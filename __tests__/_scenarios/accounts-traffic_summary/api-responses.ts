import nock from "nock";
import { Url } from "url";
import IHullAccountUpdateMessage from "../../../src/types/account-update-message";
import { API_BASE } from "../../_helpers/constants";

const setupApiMockResponses = (
  nockFn: (
    basePath: string | RegExp | Url,
    options?: nock.Options | undefined,
  ) => nock.Scope,
  messages: IHullAccountUpdateMessage[],
): void => {
  let resultString = `domain;display_date;country;desktop_share;mobile_share;total_avg_visit_duration;desktop_avg_visit_duration;mobile_avg_visit_duration`;
  messages.forEach((msg) => {
    resultString += `\n${msg.account.domain};2018-11-01;US;0.2699767314554674;0.7300232685445326;1164;1428;1066`;
  });

  nockFn(API_BASE)
    .get(/\/analytics\/ta\/v2.*$/)
    .reply(200, resultString, {
      "content-type": "text/plain; charset=utf-8",
    });
};

// eslint-disable-next-line import/no-default-export
export default setupApiMockResponses;
