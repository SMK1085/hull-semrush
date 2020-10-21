import { first, forEach, get, isNil, pick, set } from "lodash";
import {
  Schema$PrivateSettings,
  Schema$MapIncomingParameters,
  Schema$MapIncomingResult,
  Schema$MapOutgoingParameters,
  Schema$OutgoingOperationEnvelope,
} from "../core/connector";
import { semrush_v3 } from "../core/service-objects";
import IHullAccountUpdateMessage from "../types/account-update-message";
import IHullUserUpdateMessage from "../types/user-update-message";
import jsonata from "jsonata";
import { DateTime } from "luxon";

export class MappingUtil {
  public readonly appSettings: Schema$PrivateSettings;
  public readonly registeredOperationsIncoming: {
    [key: string]: (
      params: Schema$MapIncomingParameters,
    ) => Schema$MapIncomingResult[];
  };
  public readonly registeredOperationsOutgoing: {
    [key: string]: (
      params: Schema$MapOutgoingParameters,
    ) => {
      params: any[];
      envelopes: Schema$OutgoingOperationEnvelope<
        IHullAccountUpdateMessage,
        unknown
      >[];
    }[];
  };

  constructor(options: any) {
    this.appSettings = options.hullAppSettings;

    // Register supported operations here
    this.registeredOperationsIncoming = {
      traffic_summary: this.mapIncomingTrafficSummary.bind(this),
      backlinks_categories: this.mapIncomingBacklinksCategories.bind(this),
    };
    this.registeredOperationsOutgoing = {
      traffic_summary: this.mapOutgoingTrafficSummary.bind(this),
      backlinks_categories: this.mapOutgoingBacklinksCategories.bind(this),
    };
  }

  public mapIncoming(
    params: Schema$MapIncomingParameters,
  ): Schema$MapIncomingResult[] {
    if (
      !Object.keys(this.registeredOperationsIncoming).includes(
        params.analyticsType,
      )
    ) {
      throw new Error(
        `Analytics type '${
          params.analyticsType
        }' is not registered. Allowed types are ${Object.keys(
          this.registeredOperationsIncoming,
        ).join(", ")}.`,
      );
    }

    return this.registeredOperationsIncoming[params.analyticsType](params);
  }

  public mapOutgoing(
    params: Schema$MapOutgoingParameters,
  ): {
    params: any[];
    envelopes: Schema$OutgoingOperationEnvelope<
      IHullAccountUpdateMessage,
      unknown
    >[];
  }[] {
    if (
      !Object.keys(this.registeredOperationsOutgoing).includes(
        params.analyticsType,
      )
    ) {
      throw new Error(
        `Analytics type '${
          params.analyticsType
        }' is not registered. Allowed types are ${Object.keys(
          this.registeredOperationsIncoming,
        ).join(", ")}.`,
      );
    }

    return this.registeredOperationsOutgoing[params.analyticsType](params);
  }

  private mapIncomingTrafficSummary(
    params: Schema$MapIncomingParameters,
  ): Schema$MapIncomingResult[] {
    const result: Schema$MapIncomingResult[] = [];
    const trafficSummaries = params.data as semrush_v3.Schema$TrafficSummary[];
    const envelopes = params.hullData as Schema$OutgoingOperationEnvelope<
      IHullAccountUpdateMessage,
      unknown
    >[];

    trafficSummaries.forEach((d) => {
      const envelope = envelopes.find(
        (e) => e.message.account.domain === d.domain,
      );

      if (isNil(envelope)) {
        return;
      }

      const ident = pick(envelope.message.account, [
        "id",
        "external_id",
        "domain",
      ]);
      if (
        (get(envelope.message.account, "anonymous_ids", []) as string[])
          .length > 0
      ) {
        set(
          ident,
          "anonymous_id",
          first(get(envelope.message.account, "anonymous_ids", []) as string[]),
        );
      }
      const attributes = {};
      // Map the customer defined columns
      forEach(
        this.appSettings.account_attributes_incoming_traffic_summary,
        (mapping) => {
          if (!isNil(mapping.hull) && !isNil(mapping.service)) {
            const expression = jsonata(mapping.service!);
            let result = expression.evaluate(d);
            // Note: Semrush returns n/a even for numeric attributes, so we need to treat `n/a` always as `null`
            if (typeof result === "string" && result === "n/a") {
              result = null;
            }
            if (typeof result === "string" && result === "") {
              result = null;
            }
            if (result === undefined) {
              result = null;
            }
            if (
              (mapping.service.endsWith("_share") ||
                mapping.service.endsWith("_rate")) &&
              typeof result === "number" &&
              result <= 1
            ) {
              result = result * 100;
            }

            if (
              mapping.service.endsWith("_date") &&
              typeof result === "string"
            ) {
              result = DateTime.fromISO(result)
                .set({ hour: 12 })
                .toUTC()
                .toISO();
            }

            if (mapping.overwrite === false && result === null) {
              // TODO: Add logging. This is a no-op, so no need to pass it along
            } else {
              set(attributes, mapping.hull, {
                value: result,
                operation: mapping.overwrite === false ? "setIfNull" : "set",
              });
            }
          }
        },
      );

      // Set the operational attributes
      const lastRunTimestamp = isNil(params.executionTime)
        ? DateTime.utc().toISO()
        : params.executionTime;
      set(
        attributes,
        `semrush/${params.analyticsType}_lastrun_at`,
        lastRunTimestamp,
      );

      result.push({
        hullOperation: "traits",
        hullOperationParams: [attributes],
        hullScope: "asAccount",
        ident,
      });
    });

    return result;
  }

  private mapIncomingBacklinksCategories(
    params: Schema$MapIncomingParameters,
  ): Schema$MapIncomingResult[] {
    const result: Schema$MapIncomingResult[] = [];

    const envelope = first(
      params.hullData as any[],
    ) as Schema$OutgoingOperationEnvelope<IHullAccountUpdateMessage, unknown>;

    const ident = pick(envelope.message.account, [
      "id",
      "external_id",
      "domain",
    ]);
    if (
      (get(envelope.message.account, "anonymous_ids", []) as string[]).length >
      0
    ) {
      set(
        ident,
        "anonymous_id",
        first(get(envelope.message.account, "anonymous_ids", []) as string[]),
      );
    }
    const attributes = {};
    const pseudoObject = {
      categories: params.data,
    };

    // Map the customer defined columns
    forEach(
      this.appSettings.account_attributes_incoming_backlinks_categories,
      (mapping) => {
        if (!isNil(mapping.hull) && !isNil(mapping.service)) {
          const expression = jsonata(mapping.service!);
          let result = expression.evaluate(pseudoObject);
          if (typeof result === "string" && result === "") {
            result = null;
          }
          if (result === undefined) {
            result = null;
          }

          if (mapping.overwrite === false && result === null) {
            // TODO: Add logging. This is a no-op, so no need to pass it along
          } else {
            set(attributes, mapping.hull, {
              value: result,
              operation: mapping.overwrite === false ? "setIfNull" : "set",
            });
          }
        }
      },
    );

    // Set the operational attributes
    const lastRunTimestamp = isNil(params.executionTime)
      ? DateTime.utc().toISO()
      : params.executionTime;
    set(
      attributes,
      `semrush/${params.analyticsType}_lastrun_at`,
      lastRunTimestamp,
    );

    result.push({
      hullOperation: "traits",
      hullOperationParams: [attributes],
      hullScope: "asAccount",
      ident,
    });

    return result;
  }

  private mapOutgoingTrafficSummary(
    params: Schema$MapOutgoingParameters,
  ): {
    params: semrush_v3.Schema$TrafficSummaryRequest[];
    envelopes: Schema$OutgoingOperationEnvelope<
      IHullAccountUpdateMessage,
      unknown
    >[];
  }[] {
    const result: {
      params: semrush_v3.Schema$TrafficSummaryRequest[];
      envelopes: Schema$OutgoingOperationEnvelope<
        IHullAccountUpdateMessage,
        unknown
      >[];
    }[] = [
      {
        params: [],
        envelopes: params.envelopes as Schema$OutgoingOperationEnvelope<
          IHullAccountUpdateMessage,
          unknown
        >[],
      },
    ];

    const param: semrush_v3.Schema$TrafficSummaryRequest = {
      domains: params.envelopes.map((envelope) =>
        get(envelope, "message.account.domain"),
      ),
    };

    result[0].params.push(param);

    return result;
  }

  private mapOutgoingBacklinksCategories<T>(
    params: Schema$MapOutgoingParameters,
  ): {
    params: semrush_v3.Schema$BacklinksCategoriesRequest[];
    envelopes: Schema$OutgoingOperationEnvelope<
      IHullAccountUpdateMessage,
      unknown
    >[];
  }[] {
    const result: {
      params: semrush_v3.Schema$BacklinksCategoriesRequest[];
      envelopes: Schema$OutgoingOperationEnvelope<
        IHullAccountUpdateMessage,
        unknown
      >[];
    }[] = [];

    forEach(params.envelopes, (envelope) => {
      result.push({
        envelopes: [
          envelope as Schema$OutgoingOperationEnvelope<
            IHullAccountUpdateMessage,
            unknown
          >,
        ],
        params: [
          {
            export_columns: ["category_name", "rating"],
            target: get(envelope, "message.account.domain"),
            target_type: "root_domain",
          },
        ],
      });
    });

    return result;
  }
}
