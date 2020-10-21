export type Type$ApiMethod =
  | "delete"
  | "get"
  | "GET"
  | "DELETE"
  | "head"
  | "HEAD"
  | "options"
  | "OPTIONS"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "patch"
  | "PATCH"
  | "link"
  | "LINK"
  | "unlink"
  | "UNLINK";

export interface Schema$ApiResultObject<TPayload, TData, TError> {
  endpoint: string;
  method: Type$ApiMethod;
  payload: TPayload | undefined;
  data?: TData;
  success: boolean;
  error?: string | string[];
  errorDetails?: TError;
}

export type OutgoingOperationType = "analytics" | "skip";
export type OutgoingOperationObjectType = "user" | "event" | "account";

export interface OutgoingOperationEnvelope<TMessage, TServiceObject> {
  message: TMessage;
  serviceObject?: TServiceObject;
  operation: OutgoingOperationType;
  objectType: OutgoingOperationObjectType;
  notes?: string[];
}

export interface OutgoingOperationEnvelopesFiltered<TMessage, TServiceObject> {
  enrichments: OutgoingOperationEnvelope<TMessage, TServiceObject>[];
  skips: OutgoingOperationEnvelope<TMessage, TServiceObject>[];
}

export namespace semrush_v3 {
  export interface Options {
    version: "v3";
  }

  export type Type$TrafficSummaryColumn =
    | "domain"
    | "display_date"
    | "country"
    | "total_rank"
    | "desktop_rank"
    | "mobile_rank"
    | "desktop_share"
    | "mobile_share"
    | "total_visits"
    | "mobile_visits"
    | "desktop_visits"
    | "total_unique_visitors"
    | "mobile_unique_visitors"
    | "desktop_unique_visitors"
    | "total_pages_per_visit"
    | "mobile_pages_per_visit"
    | "desktop_pages_per_visit"
    | "total_avg_visit_duration"
    | "mobile_avg_visit_duration"
    | "desktop_avg_visit_duration"
    | "total_bounce_rate"
    | "mobile_bounce_rate"
    | "desktop_bounce_rate";

  export type Type$BacklinksCategoriesColumn = "category_name" | "rating";

  /**
   * Refer to https://www.semrush.com/api-analytics/#ta
   */
  export interface Schema$TrafficSummaryRequest {
    domains: string[];
    display_date?: string; // a date in the format `YYYY-MM-01`
    country?: string;
    export_colums?: Type$TrafficSummaryColumn[];
  }

  export interface Schema$TrafficSummary {
    domain: string;
    display_date: string;
    [key: string]: string | number;
  }

  export interface Schema$BacklinksCategoriesRequest {
    target: string;
    target_type: "root_domain";
    export_columns: Type$BacklinksCategoriesColumn[];
  }

  export interface Schema$BacklinksCategories {
    category_name: string;
    rating: number;
  }
}

export const DOMAINAPI_MAPPINGS_V17: { value: string; label: string }[] = [
  {
    value: "Results[0].Result.IsDB",
    label: "Is DB",
  },
  {
    value: "Results[0].Result.Spend",
    label: "Tech Spend (USD)",
  },
  {
    value: "Results[0].Result.SalesRevenue",
    label: "Sales Revenue (USD)",
  },
  {
    value: "$fromMillis($min(Results[0].Result.Paths.FirstIndexed))",
    label: "First Indexed At",
  },
  {
    value: "$fromMillis($min(Results[0].Result.Paths.LastIndexed))",
    label: "Last Indexed At",
  },
  {
    value: "$distinct(Results[0].Result.Paths.Technologies.Name)",
    label: "All Technologies",
  },
  {
    value:
      '$distinct(Results[0].Result.Paths.Technologies[IsPremium="yes"].Name)',
    label: "Premium Technologies",
  },
  {
    value: "Results[0].Meta.CompanyName",
    label: "Company Name",
  },
  {
    value: "Results[0].Meta.City",
    label: "City",
  },
  {
    value: "Results[0].Meta.Postcode",
    label: "Postal Code",
  },
  {
    value: "Results[0].Meta.State",
    label: "State",
  },
  {
    value: "Results[0].Meta.Country",
    label: "Country",
  },
  {
    value: "Results[0].Meta.Vertical",
    label: "Vertical",
  },
  {
    value: "Results[0].Meta.Telephones",
    label: "Telephones",
  },
  {
    value: "Results[0].Meta.Emails",
    label: "Domain Emails",
  },
  {
    value: "Results[0].Meta.Social",
    label: "Social",
  },
  {
    value: "Results[0].Meta.Names",
    label: "Names (for people)",
  },
  {
    value: "Results[0].Meta.Majestic",
    label: "Majestic",
  },
  {
    value: "Results[0].Meta.Umbrella",
    label: "Umbrella",
  },
  {
    value: "Results[0].Meta.ARank",
    label: "ARank",
  },
  {
    value: "Results[0].Meta.QRank",
    label: "QRank",
  },
  {
    value: "Results[0].Attributes.MJRank",
    label: "Majestic Rank",
  },
  {
    value: "Results[0].Attributes.MJTLDRank",
    label: "Majestic Rank for TLD of Domain",
  },
  {
    value: "Results[0].Attributes.RefSN",
    label: "Referring Subnets to Domain from Majestic",
  },
  {
    value: "Results[0].Attributes.RefIP",
    label: "Referring IPs to Domain from Majestic",
  },
  {
    value: "Results[0].Attributes.TTFB",
    label: "Seconds to First Byte",
  },
  {
    value: "Results[0].Attributes.Sitemap",
    label: "Amount of sites in an indexable sitemap",
  },
  {
    value: "Results[0].Attributes.GTMTags",
    label: "Amount of tags being loaded by Google Tag Manager",
  },
  {
    value: "Results[0].Attributes.QubitTags",
    label: "Amount of tags being loaded by Qubit Tag Manager",
  },
  {
    value: "Results[0].Attributes.TealiumTags",
    label: "Amount of tags being loaded by Tealium Tag Manager",
  },
  {
    value: "Results[0].Attributes.AdobeTags",
    label: "Amount of tags being loaded by Adobe Tag Manager",
  },
  {
    value: "Results[0].Attributes.CDimensions",
    label: "Amount of custom dimensions created by Google Analytics",
  },
  {
    value: "Results[0].Attributes.CGoals",
    label: "Amount of custom goals created by Google Analytics",
  },
  {
    value: "Results[0].Attributes.CMetrics",
    label: "Amount of custom metrics created by Google Analytics",
  },
  {
    value: "Results[0].Attributes.SourceBytes",
    label: "Size of document",
  },
];
