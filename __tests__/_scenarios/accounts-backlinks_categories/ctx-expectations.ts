import { ContextMock } from "../../_helpers/mocks";
import { VALIDATION_SKIP_HULLOBJECT_NOTINANYSEGMENT } from "../../../src/core/messages";
import IHullAccountUpdateMessage from "../../../src/types/account-update-message";

/* eslint-disable @typescript-eslint/no-explicit-any */
const setupExpectations = (
  ctx: ContextMock,
  messages: IHullAccountUpdateMessage[],
): void => {
  expect(((ctx.client as any).traits as any).mock.calls).toHaveLength(
    messages.length,
  );
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/no-default-export
export default setupExpectations;
