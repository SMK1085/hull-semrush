import { ContextMock } from "../../_helpers/mocks";
import { VALIDATION_SKIP_HULLOBJECT_NOTINANYSEGMENT } from "../../../src/core/messages";

/* eslint-disable @typescript-eslint/no-explicit-any */
const setupExpectations = (ctx: ContextMock): void => {
  expect((ctx.client.logger.info as any).mock.calls).toHaveLength(4);
  for (let index = 0; index < 4; index++) {
    expect((ctx.client.logger.info as any).mock.calls[index]).toEqual([
      "outgoing.account.skip",
      {
        details: [VALIDATION_SKIP_HULLOBJECT_NOTINANYSEGMENT("account")],
      },
    ]);
  }
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line import/no-default-export
export default setupExpectations;
