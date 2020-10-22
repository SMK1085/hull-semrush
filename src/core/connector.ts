import IHullAccountUpdateMessage from "../types/account-update-message";
import { HullConnectorAttributeMapping } from "../types/hull-connector";
import IHullUserUpdateMessage from "../types/user-update-message";

export interface Schema$PrivateSettings {
  /**
   * The API key from Semrush
   */
  api_key?: string | null;
  /**
   * The segments to use with the traffic API for accounts
   */
  account_synchronized_segments_traffic_summary: string[];
  /**
   * The mapping for incoming account attributes
   */
  account_attributes_incoming_traffic_summary: HullConnectorAttributeMapping[];
  /**
   * The segments to use with the domain ranks API for accounts
   */
  account_synchronized_segments_domain_ranks: string[];
  /**
   * The mapping for incoming account attributes
   */
  account_attributes_incoming_domain_ranks: HullConnectorAttributeMapping[];
  /**
   * The lookup attribute for the database
   */
  account_lookup_database_domain_ranks?: string | null;
  /**
   * The segments to use with the callback links API for accounts
   */
  account_synchronized_segments_backlinks_categories: string[];
  /**
   * The mapping for incoming account attributes
   */
  account_attributes_incoming_backlinks_categories: HullConnectorAttributeMapping[];
  /**
   * Defines whether the backlinks_categories report should run on batch or not.
   */
  batch_enabled_backlinks_categories?: boolean;
  /**
   * Defines whether the traffic_summary report should run on batch or not.
   */
  batch_enabled_traffic_summary?: boolean;

  /**
   * Defines whether the domain_ranks report should run on batch or not.
   */
  batch_enabled_domain_ranks?: boolean;
}

export interface Schema$LogPayload {
  channel: "operational" | "metric" | "error";
  component: string;
  code: string;
  message?: string | null;
  metricKey?: string | null;
  metricValue?: number | null;
  errorDetails?: any | null;
  errorMessage?: string | null;
  appId: string;
  tenantId: string;
  correlationKey?: string;
}

export type Type$SupportedAnalyticsType =
  | "backlinks_categories"
  | "traffic_summary"
  | "domain_ranks";

export interface Schema$MapIncomingParameters {
  data: unknown;
  analyticsType: Type$SupportedAnalyticsType;
  [key: string]: unknown;
  hullData: unknown;
  executionTime?: string;
}

export interface Schema$MapIncomingResult {
  ident: unknown;
  hullScope: "asUser" | "asAccount";
  hullOperation: "traits" | "track" | "alias" | "unalias";
  hullOperationParams: unknown[];
}

export interface Schema$MapOutgoingParameters {
  envelopes: Schema$OutgoingOperationEnvelope<
    IHullAccountUpdateMessage | IHullUserUpdateMessage,
    unknown
  >[];
  analyticsType: Type$SupportedAnalyticsType;
}

export type Type$OutgoingOperation = "analytics" | "skip";
export type Type$OutgoingOperationObject = "user" | "account";

export interface Schema$OutgoingOperationEnvelope<TMessage, TServiceObject> {
  message: TMessage;
  serviceObject?: TServiceObject;
  operation: Type$OutgoingOperation;
  objectType: Type$OutgoingOperationObject;
  notes?: string[];
}

export interface Schema$OutgoingOperationEnvelopesFiltered<
  TMessage,
  TServiceObject
> {
  analytics: Schema$OutgoingOperationEnvelope<TMessage, TServiceObject>[];
  skips: Schema$OutgoingOperationEnvelope<TMessage, TServiceObject>[];
}

export const MAPPINGS_TRAFFICSUMMARY_V3: { value: string; label: string }[] = [
  {
    value: "domain",
    label: "Domain",
  },
  {
    value: "display_date",
    label: "Display date",
  },
  {
    value: "country",
    label: "Country",
  },
  {
    value: "total_rank",
    label: "Total rank",
  },
  {
    value: "desktop_rank",
    label: "Desktop rank",
  },
  {
    value: "mobile_rank",
    label: "Mobile rank",
  },
  {
    value: "desktop_share",
    label: "Desktop share",
  },
  {
    value: "mobile_share",
    label: "Mobile share",
  },
  {
    value: "total_visits",
    label: "Total visits",
  },
  {
    value: "mobile_visits",
    label: "Mobile visits",
  },
  {
    value: "desktop_visits",
    label: "Desktop visits",
  },
  {
    value: "total_unique_visitors",
    label: "Total unique visitors",
  },
  {
    value: "mobile_unique_visitors",
    label: "Mobile unique visitors",
  },
  {
    value: "desktop_unique_visitors",
    label: "Desktop unique visitors",
  },
  {
    value: "total_pages_per_visit",
    label: "Total pages per visit",
  },
  {
    value: "mobile_pages_per_visit",
    label: "Mobile pages per visit",
  },
  {
    value: "desktop_pages_per_visit",
    label: "Desktop pages per visit",
  },
  {
    value: "total_avg_visit_duration",
    label: "Total average visit duration",
  },
  {
    value: "mobile_avg_visit_duration",
    label: "Mobile average visit duration",
  },
  {
    value: "desktop_avg_visit_duration",
    label: "Desktop average visit duration",
  },
  {
    value: "total_bounce_rate",
    label: "Total bounce rate",
  },
  {
    value: "mobile_bounce_rate",
    label: "Mobile bounce rate",
  },
  {
    value: "desktop_bounce_rate",
    label: "Desktop bounce rate",
  },
];

export const MAPPING_BACKLINKSCATEGORIES_V3: {
  value: string;
  label: string;
}[] = [
  {
    value: "categories[].category_name",
    label: "Categories names",
  },
  {
    value: "categories",
    label: "Categories detailed",
  },
];

export const MAPPING_DOMAINRANKS_V3: {
  value: string;
  label: string;
}[] = [
  {
    value: "Database", // Db
    label: "Categories names",
  },
  {
    value: "Date", // Dt
    label: "Categories detailed",
  },
  {
    value: "Domain", //Dn
    label: "Domain",
  },
  {
    value: "Rank", // Rk
    label: "Rank",
  },
  {
    value: "Organic Keywords", // Or
    label: "Organic Keywords",
  },
  {
    value: "Organic Traffic", // Ot
    label: "Organic Traffic",
  },
  {
    value: "Organic Cost", // Oc
    label: "Organic Cost",
  },
  {
    value: "Adwords Keywords", // Ad
    label: "Adwords Keywords",
  },
  {
    value: "Adwords Traffic", // At
    label: "Adwords Traffic",
  },
  {
    value: "Adwords Cost", // Ac
    label: "Adwords Cost",
  },
  {
    value: "PLA keywords", // Sh
    label: "PLA Keywords",
  },
  {
    value: "PLA uniques", //Sv
    label: "PLA Uniques",
  },
];
