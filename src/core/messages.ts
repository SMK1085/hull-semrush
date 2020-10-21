export const STATUS_SETUPREQUIRED_NOAPIKEY =
  "Connector unauthenticated: No API Key is present.";
export const ERROR_UNHANDLED_GENERIC = `An unhandled error occurred and our engineering team has been notified.`;

export const VALIDATION_SKIP_HULLOBJECT_NOTINANYSEGMENT = (
  objectType: "user" | "account",
) => {
  return `Hull ${objectType} won't be synchronized since it is not matching any of the filtered segments.`;
};

export const DATAFLOW_BATCHOP_SKIPFILTER = (objectType: "user" | "account") => {
  return `Hull ${objectType} synchronized in batch operation. Segment filters not applied.`;
};

export const VALIDATION_SKIP_HULLACCOUNT_NODOMAIN =
  "Hull account doesn't have a value for attribute domain.";

export const VALIDATION_SKIP_HULLACCOUNT_BATCHNOTENABLED = (
  analyticsType: string,
) => {
  return `Batch handling for report '${analyticsType}' is not enabled.`;
};
