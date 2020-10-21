import { ContextMock } from "../../_helpers/mocks";
import IHullAccountUpdateMessage from "../../../src/types/account-update-message";

/* eslint-disable @typescript-eslint/no-explicit-any */
const setupExpectations = (
  ctx: ContextMock,
  messages: IHullAccountUpdateMessage[],
): void => {
  expect(((ctx.client as any).traits as any).mock.calls).toHaveLength(
    messages.length,
  );

  for (let index = 0; index < messages.length; index++) {
    const element = messages[index];
    expect(
      ((ctx.client as any).traits as any).mock.calls[index][0],
    ).toMatchObject({
      "semrush/domain": {
        operation: "set",
        value: element.account.domain,
      },
    });
  }
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/no-default-export
export default setupExpectations;
