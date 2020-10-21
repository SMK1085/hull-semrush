import nock from "nock";
import { Url } from "url";

const setupApiMockResponses = (
  nockFn: (
    basePath: string | RegExp | Url,
    options?: nock.Options | undefined,
  ) => nock.Scope,
): void => {
  // No API calls expected
};

// eslint-disable-next-line import/no-default-export
export default setupApiMockResponses;
