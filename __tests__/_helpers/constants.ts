import { Type$SupportedAnalyticsType } from "../../src/core/connector";
import manifest from "../../manifest.json";

export const IMPLEMENTED_ANALYTICSTYPES: Type$SupportedAnalyticsType[] = [
  "backlinks_categories",
  "traffic_summary",
];

// Semrush API
export const API_KEY = "go4y1ho9hw9o4h";
export const API_BASE = "https://api.semrush.com";

// App auth
export const APP_ID = "12345";
export const APP_SECRET = "iuyh2hyjpwe0jnmype";
export const APP_ORG = "unittest.hullapp.io";

// Default app settings
export const APP_SETTINGS_MAPPINGS_TRAFFIC_SUMMARY_DEFAULT = manifest.private_settings.find(
  (s) => s.name === "account_attributes_incoming_traffic_summary",
)!.default;
export const APP_SETTINGS_MAPPINGS_BACKLINGS_CATEGORIES_DEFAULT = manifest.private_settings.find(
  (s) => s.name === "account_attributes_incoming_backlinks_categories",
)!.default;
