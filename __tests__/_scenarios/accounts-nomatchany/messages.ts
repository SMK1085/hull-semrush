import IHullAccountUpdateMessage from "../../../src/types/account-update-message";

import { createHullAccountUpdateMessages } from "../../_helpers/data-helpers";

const composeMessages = (segmentIds: string[]): IHullAccountUpdateMessage[] => {
  const messages = createHullAccountUpdateMessages(2, segmentIds, 0, 2, 0);
  return messages;
};

export default composeMessages;
