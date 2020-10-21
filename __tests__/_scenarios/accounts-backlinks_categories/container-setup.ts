import { AwilixContainer, asValue } from "awilix";
import { random } from "faker";
import { Schema$PrivateSettings } from "../../../src/core/connector";
import {
  API_KEY,
  APP_SETTINGS_MAPPINGS_BACKLINGS_CATEGORIES_DEFAULT,
  APP_SETTINGS_MAPPINGS_TRAFFIC_SUMMARY_DEFAULT,
} from "../../_helpers/constants";

const setupContainer = (
  container: AwilixContainer,
  segmentIds: string[],
): AwilixContainer => {
  const scope = container.createScope();
  const appSettings: Schema$PrivateSettings = {
    account_attributes_incoming_backlinks_categories: APP_SETTINGS_MAPPINGS_BACKLINGS_CATEGORIES_DEFAULT as any[],
    account_attributes_incoming_traffic_summary: APP_SETTINGS_MAPPINGS_TRAFFIC_SUMMARY_DEFAULT as any[],
    account_synchronized_segments_backlinks_categories: segmentIds,
    account_synchronized_segments_traffic_summary: [],
    api_key: API_KEY,
  };

  scope.register("hullAppSettings", asValue(appSettings));
  scope.register("correlationKey", asValue(random.uuid()));

  return scope;
};

export default setupContainer;
