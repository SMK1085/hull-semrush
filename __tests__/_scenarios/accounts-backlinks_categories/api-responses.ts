import nock from "nock";
import { Url } from "url";
import { API_BASE } from "../../_helpers/constants";

const setupApiMockResponses = (
  nockFn: (
    basePath: string | RegExp | Url,
    options?: nock.Options | undefined,
  ) => nock.Scope,
): void => {
  nockFn(API_BASE)
    .get(/\/analytics\/v1\/\?.*/)
    .reply(
      200,
      `category_name;rating\n/Internet & Telecom/Web Services/Search Engine Optimization & Marketing;0.931905\n/Internet & Telecom/Web Services/Affiliate Programs;0.880989\n/Business & Industrial/Advertising & Marketing/Marketing;0.872495\n/Internet & Telecom/Search Engines;0.821398\n/Business & Industrial/Advertising & Marketing/Brand Management;0.813207`,
      {
        "content-type": "text/plain; charset=utf-8",
      },
    );
  nockFn(API_BASE)
    .get(/\/analytics\/v1\/\?.*/)
    .reply(
      200,
      `category_name;rating\n/Internet & Telecom/Web Services/Search Engine Optimization & Marketing;0.931905\n/Internet & Telecom/Web Services/Affiliate Programs;0.880989\n/Business & Industrial/Advertising & Marketing/Marketing;0.872495\n/Internet & Telecom/Search Engines;0.821398\n/Business & Industrial/Advertising & Marketing/Brand Management;0.813207`,
      {
        "content-type": "text/plain; charset=utf-8",
      },
    );
};

// eslint-disable-next-line import/no-default-export
export default setupApiMockResponses;
