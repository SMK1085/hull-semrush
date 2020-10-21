import IHullAccountUpdateMessage from "../../src/types/account-update-message";

import { company, internet, random, date } from "faker";

export const createHullAccountUpdateMessages = (
  count: number,
  segmentIds: string[],
  countWithSegmentIds: number,
  countWithDomain: number,
  countWithExternalId: number,
): IHullAccountUpdateMessage[] => {
  const result: IHullAccountUpdateMessage[] = [];

  for (let index = 0; index < count; index++) {
    result.push({
      account: {
        id: random.uuid(),
        domain: index < countWithDomain ? internet.domainName() : null,
        external_id: index < countWithExternalId ? random.uuid() : null,
        anonymous_ids: [random.alphaNumeric()],
        name: company.companyName(),
      },
      message_id: random.uuid(),
      account_segments:
        index < countWithSegmentIds
          ? segmentIds.map((id) => {
              return {
                created_at: date.past().toISOString(),
                id,
                name: random.words(),
                type: "account_segment",
                updated_at: date.past().toISOString(),
              };
            })
          : [],
    });
  }

  return result;
};
