import { AwilixContainer, asClass, asValue } from "awilix";
import { ServiceClient } from "./service-client";
import { LoggingUtil } from "../utils/logging-util";
import { FilterUtil } from "../utils/filter-util";
import { MappingUtil } from "../utils/mapping-util";
import { ConnectorStatusResponse } from "../types/connector-status";
import { Logger } from "winston";
import {
  Schema$PrivateSettings,
  MAPPING_BACKLINKSCATEGORIES_V3,
  MAPPINGS_TRAFFICSUMMARY_V3,
  Type$SupportedAnalyticsType,
  Schema$OutgoingOperationEnvelopesFiltered,
  Schema$OutgoingOperationEnvelope,
  MAPPING_DOMAINRANKS_V3,
} from "./connector";
import IHullClient from "../types/hull-client";
import { isNil, cloneDeep, forEach, set } from "lodash";
import {
  STATUS_SETUPREQUIRED_NOAPIKEY,
  ERROR_UNHANDLED_GENERIC,
} from "./messages";
import IHullAccountUpdateMessage from "../types/account-update-message";
import asyncForEach from "../utils/async-foreach";
import { Schema$ApiResultObject } from "./service-objects";
import { FieldsSchema } from "../types/fields-schema";
import { AxiosError } from "axios";
import { HullUtil } from "../utils/hull-util";

export class SyncAgent {
  public readonly diContainer: AwilixContainer;

  constructor(container: AwilixContainer) {
    this.diContainer = container;
    const connectorSettings = this.diContainer.resolve<Schema$PrivateSettings>(
      "hullAppSettings",
    );
    this.diContainer.register(
      "apiKey",
      asValue(connectorSettings.api_key || "unknown"),
    );
    this.diContainer.register("serviceClient", asClass(ServiceClient));
    this.diContainer.register("loggingUtil", asClass(LoggingUtil));
    this.diContainer.register("filterUtil", asClass(FilterUtil));
    this.diContainer.register("mappingUtil", asClass(MappingUtil));
    this.diContainer.register("hullUtil", asClass(HullUtil));
  }

  /**
   * Processes outgoing notifications for account:update lane.
   *
   * @param {IHullAccountUpdateMessage[]} messages The notification messages.
   * @param {boolean} [isBatch=false] `True` if it is a batch; otherwise `false`.
   * @returns {Promise<unknown>} An awaitable Promise.
   * @memberof SyncAgent
   */
  public async sendAccountMessages(
    messages: IHullAccountUpdateMessage[],
    isBatch = false,
  ): Promise<void> {
    const connectorSettings = this.diContainer.resolve<Schema$PrivateSettings>(
      "hullAppSettings",
    );

    if (isNil(connectorSettings.api_key)) {
      // If no API key is configured, return immediately
      return;
    }

    const logger = this.diContainer.resolve<Logger>("logger");
    const loggingUtil = this.diContainer.resolve<LoggingUtil>("loggingUtil");
    const correlationKey = this.diContainer.resolve<string>("correlationKey");
    const hullClient = this.diContainer.resolve<IHullClient>("hullClient");

    try {
      const connectorId = this.diContainer.resolve<string>("hullAppId");
      if (isBatch === true) {
        logger.debug(
          loggingUtil.composeOperationalMessage(
            "OPERATION_SENDACCOUNTMESSAGESBATCH_START",
            correlationKey,
          ),
        );
      } else {
        logger.debug(
          loggingUtil.composeOperationalMessage(
            "OPERATION_SENDACCOUNTMESSAGES_START",
            correlationKey,
          ),
        );
      }

      logger.info(
        loggingUtil.composeMetricMessage(
          "OPERATION_SENDACCOUNTMESSAGES_COUNT",
          correlationKey,
          messages.length,
        ),
      );

      const filterUtil = this.diContainer.resolve<FilterUtil>("filterUtil");
      const envelopesFiltered: {
        [key: string]: Schema$OutgoingOperationEnvelopesFiltered<
          IHullAccountUpdateMessage,
          unknown
        >;
      } = {};
      const supportedAnalyticTypes: Type$SupportedAnalyticsType[] = [
        "backlinks_categories",
        "traffic_summary",
        "domain_ranks",
      ];
      let totalEnvelopesForAnalytics = 0;
      forEach(supportedAnalyticTypes, (analyticsType) => {
        const filtered = filterUtil.filterAccountMessages(
          analyticsType,
          messages,
          isBatch,
        );
        totalEnvelopesForAnalytics += filtered.analytics.length;
        set(envelopesFiltered, analyticsType, filtered);
        // Log the skips right away
        forEach(filtered.skips, (envelope) => {
          hullClient
            .asAccount(envelope.message.account)
            .logger.info(
              `outgoing.${envelope.objectType}.${envelope.operation}`,
              {
                details: envelope.notes,
              },
            );
        });
      });

      if (totalEnvelopesForAnalytics === 0) {
        logger.info(
          loggingUtil.composeOperationalMessage(
            "OPERATION_SENDACCOUNTMESSAGES_NOOP",
            correlationKey,
          ),
        );
        return;
      }

      const mappingUtil = this.diContainer.resolve<MappingUtil>("mappingUtil");
      const serviceClient = this.diContainer.resolve<ServiceClient>(
        "serviceClient",
      );
      const hullUtil = this.diContainer.resolve<HullUtil>("hullUtil");
      const registeredServiceOperations: {
        [key: string]: (
          params: any,
        ) => Promise<Schema$ApiResultObject<any, any, AxiosError>>;
      } = {
        backlinks_categories: serviceClient.runBacklinksCategoriesReport.bind(
          serviceClient,
        ),
        traffic_summary: serviceClient.runTrafficSummaryReport.bind(
          serviceClient,
        ),
        domain_ranks: serviceClient.runDomainRanksReport.bind(serviceClient),
      };

      // TODO: Process analytics
      // Step 1 - Map to requests
      // Step 2 - Call service client
      // Step 3 - Map response
      // Step 4 - Send back to Hull
      await asyncForEach(
        supportedAnalyticTypes,
        async (analyticsType: Type$SupportedAnalyticsType) => {
          const requestsParams = mappingUtil.mapOutgoing({
            analyticsType,
            envelopes: envelopesFiltered[analyticsType].analytics,
          });

          await asyncForEach(
            requestsParams,
            async (requestParams: {
              params: any[];
              envelopes: Schema$OutgoingOperationEnvelope<
                IHullAccountUpdateMessage,
                unknown
              >[];
            }) => {
              if (
                requestParams.params.length === 0 ||
                requestParams.envelopes.length === 0
              ) {
                return;
              }
              console.log(">> Request Params", JSON.stringify(requestParams));
              const apiResult = await registeredServiceOperations[
                analyticsType
              ](requestParams.params[0]);
              console.log(">> Api Result", apiResult);
              if (apiResult.success) {
                const mappedResults = mappingUtil.mapIncoming({
                  analyticsType,
                  data: apiResult.data,
                  hullData: requestParams.envelopes,
                });
                console.log(">> Mapped results", mappedResults);
                await hullUtil.processIncomingData(mappedResults);
              } else {
                await Promise.all(
                  requestParams.envelopes.map((envelope) =>
                    hullClient
                      .asAccount(envelope.message.account)
                      .logger.error("outgoing.account.error", {
                        error: apiResult.error,
                      }),
                  ),
                );
              }
            },
          );
        },
      );

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_SENDACCOUNTMESSAGES_SUCCESS",
          correlationKey,
        ),
      );
    } catch (error) {
      console.error(error);
      logger.error(
        loggingUtil.composeErrorMessage(
          "OPERATION_SENDACCOUNTMESSAGES_UNHANDLED",
          cloneDeep(error),
          correlationKey,
        ),
      );
    }
  }

  /**
   * Returns the fields schema metadata to be used in connector settings.
   * @param objectType The object type to return metadata for. Currently accepts `backlinks_categories` or `traffic_summary`.
   * @param direction The direction of data, currently ignored.
   */
  public async listMetadata(
    objectType: string,
    direction: string,
  ): Promise<FieldsSchema> {
    const fieldSchema: FieldsSchema = {
      error: null,
      ok: true,
      options: [],
    };

    switch (objectType) {
      case "backlinks_categories":
        fieldSchema.options = MAPPING_BACKLINKSCATEGORIES_V3;
        break;
      case "traffic_summary":
        fieldSchema.options = MAPPINGS_TRAFFICSUMMARY_V3;
        break;
      case "domain_ranks":
        fieldSchema.options = MAPPING_DOMAINRANKS_V3;
        break;
      default:
        fieldSchema.error = `No metadata for object type '${objectType}' and direction '${direction}' available.`;
        fieldSchema.ok = false;
        break;
    }
    return Promise.resolve(fieldSchema);
  }

  /**
   * Determines the overall status of the connector.
   *
   * @returns {Promise<ConnectorStatusResponse>} The status response.
   * @memberof SyncAgent
   */
  public async determineConnectorStatus(): Promise<ConnectorStatusResponse> {
    const logger = this.diContainer.resolve<Logger>("logger");
    const loggingUtil = this.diContainer.resolve<LoggingUtil>("loggingUtil");
    const correlationKey = this.diContainer.resolve<string>("correlationKey");

    const statusResult: ConnectorStatusResponse = {
      status: "ok",
      messages: [],
    };

    try {
      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_CONNECTORSTATUS_START",
          correlationKey,
        ),
      );

      const connectorSettings = this.diContainer.resolve<
        Schema$PrivateSettings
      >("hullAppSettings");
      const hullClient = this.diContainer.resolve<IHullClient>("hullClient");
      const connectorId = this.diContainer.resolve<string>("hullAppId");

      // Perfom checks to verify setup is complete
      if (isNil(connectorSettings.api_key)) {
        statusResult.status = "setupRequired";
        statusResult.messages.push(STATUS_SETUPREQUIRED_NOAPIKEY);
      }

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_CONNECTORSTATUS_STARTHULLAPI",
          correlationKey,
        ),
      );

      await hullClient.put(`${connectorId}/status`, statusResult);

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_CONNECTORSTATUS_SUCCESS",
          correlationKey,
        ),
      );
    } catch (error) {
      const logPayload = loggingUtil.composeErrorMessage(
        "OPERATION_CONNECTORSTATUS_UNHANDLED",
        cloneDeep(error),
        correlationKey,
      );
      logger.error(logPayload);
      statusResult.status = "error";
      if (logPayload && logPayload.message) {
        statusResult.messages.push(logPayload.message);
      } else {
        statusResult.messages.push(ERROR_UNHANDLED_GENERIC);
      }
    }

    return statusResult;
  }
}
