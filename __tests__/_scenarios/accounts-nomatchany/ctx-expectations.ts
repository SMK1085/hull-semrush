import { ContextMock } from "../../_helpers/mocks";
import { VALIDATION_SKIP_HULLOBJECT_NOTINANYSEGMENT } from "../../../src/core/messages";
import { IMPLEMENTED_ANALYTICSTYPES } from "../../_helpers/constants";

/* eslint-disable @typescript-eslint/no-explicit-any */
const setupExpectations = (ctx: ContextMock): void => {
  expect((ctx.client.logger.info as any).mock.calls).toHaveLength(
    2 * IMPLEMENTED_ANALYTICSTYPES.length,
  );
  for (let index = 0; index < 2 * IMPLEMENTED_ANALYTICSTYPES.length; index++) {
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
