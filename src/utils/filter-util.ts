import { Logger } from "winston";
import IHullSegment from "../types/hull-segment";
import IHullAccountUpdateMessage from "../types/account-update-message";
import { semrush_v3 } from "../core/service-objects";
import { forIn, get, intersection, isNil } from "lodash";
import {
  VALIDATION_SKIP_HULLOBJECT_NOTINANYSEGMENT,
  VALIDATION_SKIP_HULLACCOUNT_NODOMAIN,
  VALIDATION_SKIP_HULLACCOUNT_BATCHNOTENABLED,
} from "../core/messages";
import {
  Schema$OutgoingOperationEnvelopesFiltered,
  Schema$PrivateSettings,
  Type$SupportedAnalyticsType,
} from "../core/connector";

export class FilterUtil {
  public readonly appSettings: Schema$PrivateSettings;
  public readonly logger: Logger;
  public readonly registeredAccountFilters: {
    [key: string]: (
      messages: IHullAccountUpdateMessage[],
      isBatch: boolean,
    ) => Schema$OutgoingOperationEnvelopesFiltered<
      IHullAccountUpdateMessage,
      unknown
    >;
  };

  constructor(options: any) {
    this.appSettings = options.hullAppSettings;
    this.logger = options.logger;
    this.registeredAccountFilters = {
      traffic_summary: this.filterAccountMessagesTrafficSummary.bind(this),
      backlinks_categories: this.filterAccountMessagesBacklinksCategories.bind(
        this,
      ),
      domain_ranks: this.filterAccountMessagesDomainRanks.bind(this),
    };
  }

  public filterAccountMessages(
    analyticsType: Type$SupportedAnalyticsType,
    messages: IHullAccountUpdateMessage[],
    isBatch: boolean = false,
  ): Schema$OutgoingOperationEnvelopesFiltered<
    IHullAccountUpdateMessage,
    unknown
  > {
    return this.registeredAccountFilters[analyticsType](messages, isBatch);
  }

  private filterAccountMessagesTrafficSummary(
    messages: IHullAccountUpdateMessage[],
    isBatch: boolean = false,
  ): Schema$OutgoingOperationEnvelopesFiltered<
    IHullAccountUpdateMessage,
    semrush_v3.Schema$TrafficSummaryRequest
  > {
    const result: Schema$OutgoingOperationEnvelopesFiltered<
      IHullAccountUpdateMessage,
      semrush_v3.Schema$TrafficSummaryRequest
    > = {
      analytics: [],
      skips: [],
    };

    messages.forEach((msg) => {
      if (
        !isBatch &&
        !FilterUtil.isInAnySegment(
          msg.account_segments,
          this.appSettings.account_synchronized_segments_traffic_summary || [],
        )
      ) {
        result.skips.push({
          message: msg,
          operation: "skip",
          notes: [VALIDATION_SKIP_HULLOBJECT_NOTINANYSEGMENT("account")],
          objectType: "account",
        });
      } else {
        if (isNil(get(msg, "account.domain", null))) {
          result.skips.push({
            message: msg,
            operation: "skip",
            notes: [VALIDATION_SKIP_HULLACCOUNT_NODOMAIN],
            objectType: "account",
          });
        } else if (
          get(this.appSettings, "batch_enabled_traffic_summary", false) !==
            true &&
          isBatch === true
        ) {
          result.skips.push({
            message: msg,
            operation: "skip",
            notes: [
              VALIDATION_SKIP_HULLACCOUNT_BATCHNOTENABLED("traffic_summary"),
            ],
            objectType: "account",
          });
        } else {
          result.analytics.push({
            message: msg,
            operation: "analytics",
            objectType: "account",
          });
        }
      }
    });

    return result;
  }

  private filterAccountMessagesBacklinksCategories(
    messages: IHullAccountUpdateMessage[],
    isBatch: boolean = false,
  ): Schema$OutgoingOperationEnvelopesFiltered<
    IHullAccountUpdateMessage,
    semrush_v3.Schema$BacklinksCategoriesRequest
  > {
    const result: Schema$OutgoingOperationEnvelopesFiltered<
      IHullAccountUpdateMessage,
      semrush_v3.Schema$BacklinksCategoriesRequest
    > = {
      analytics: [],
      skips: [],
    };

    messages.forEach((msg) => {
      if (
        !isBatch &&
        !FilterUtil.isInAnySegment(
          msg.account_segments,
          this.appSettings.account_synchronized_segments_backlinks_categories ||
            [],
        )
      ) {
        result.skips.push({
          message: msg,
          operation: "skip",
          notes: [VALIDATION_SKIP_HULLOBJECT_NOTINANYSEGMENT("account")],
          objectType: "account",
        });
      } else {
        if (isNil(get(msg, "account.domain", null))) {
          result.skips.push({
            message: msg,
            operation: "skip",
            notes: [VALIDATION_SKIP_HULLACCOUNT_NODOMAIN],
            objectType: "account",
          });
        } else if (
          get(this.appSettings, "batch_enabled_backlinks_categories", false) !==
            true &&
          isBatch === true
        ) {
          result.skips.push({
            message: msg,
            operation: "skip",
            notes: [
              VALIDATION_SKIP_HULLACCOUNT_BATCHNOTENABLED(
                "backlinks_categories",
              ),
            ],
            objectType: "account",
          });
        } else {
          result.analytics.push({
            message: msg,
            operation: "analytics",
            objectType: "account",
          });
        }
      }
    });

    return result;
  }

  private filterAccountMessagesDomainRanks(
    messages: IHullAccountUpdateMessage[],
    isBatch: boolean = false,
  ): Schema$OutgoingOperationEnvelopesFiltered<
    IHullAccountUpdateMessage,
    semrush_v3.Schema$DomainRankRequest
  > {
    const result: Schema$OutgoingOperationEnvelopesFiltered<
      IHullAccountUpdateMessage,
      semrush_v3.Schema$DomainRankRequest
    > = {
      analytics: [],
      skips: [],
    };

    messages.forEach((msg) => {
      if (
        !isBatch &&
        !FilterUtil.isInAnySegment(
          msg.account_segments,
          this.appSettings.account_synchronized_segments_domain_ranks || [],
        )
      ) {
        result.skips.push({
          message: msg,
          operation: "skip",
          notes: [VALIDATION_SKIP_HULLOBJECT_NOTINANYSEGMENT("account")],
          objectType: "account",
        });
      } else {
        if (isNil(get(msg, "account.domain", null))) {
          result.skips.push({
            message: msg,
            operation: "skip",
            notes: [VALIDATION_SKIP_HULLACCOUNT_NODOMAIN],
            objectType: "account",
          });
        } else if (
          get(this.appSettings, "batch_enabled_domain_ranks", false) !== true &&
          isBatch === true
        ) {
          result.skips.push({
            message: msg,
            operation: "skip",
            notes: [
              VALIDATION_SKIP_HULLACCOUNT_BATCHNOTENABLED("domain_ranks"),
            ],
            objectType: "account",
          });
        } else {
          result.analytics.push({
            message: msg,
            operation: "analytics",
            objectType: "account",
          });
        }
      }
    });

    return result;
  }

  private static isInAnySegment(
    actualSegments: IHullSegment[],
    whitelistedSegments: string[],
  ): boolean {
    const actualIds = actualSegments.map((s) => s.id);
    if (intersection(actualIds, whitelistedSegments).length === 0) {
      return false;
    }

    return true;
  }
}
