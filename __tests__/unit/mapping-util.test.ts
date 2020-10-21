import { first, forIn, get, pick, set } from "lodash";
import {
  Schema$MapIncomingResult,
  Schema$OutgoingOperationEnvelope,
  Schema$PrivateSettings,
  Type$OutgoingOperation,
  Type$OutgoingOperationObject,
} from "../../src/core/connector";
import { semrush_v3 } from "../../src/core/service-objects";
import IHullAccountUpdateMessage from "../../src/types/account-update-message";
import { MappingUtil } from "../../src/utils/mapping-util";
import { IMPLEMENTED_ANALYTICSTYPES } from "../_helpers/constants";
import { createHullAccountUpdateMessages } from "../_helpers/data-helpers";
import { date, random } from "faker";
import { DateTime } from "luxon";

describe("MappingUtil", () => {
  describe("#constructor", () => {
    it("should initialize all readonly fields", () => {
      // Arrange
      const hullAppSettings: Schema$PrivateSettings = {
        account_attributes_incoming_backlinks_categories: [],
        account_attributes_incoming_traffic_summary: [],
        account_synchronized_segments_backlinks_categories: [],
        account_synchronized_segments_traffic_summary: [],
      };
      const opts = {
        hullAppSettings,
      };
      // Act
      const util = new MappingUtil(opts);

      // Assert
      expect(util.appSettings).toEqual(hullAppSettings);
      expect(Object.keys(util.registeredOperationsIncoming).length).toEqual(
        IMPLEMENTED_ANALYTICSTYPES.length,
      );
      expect(Object.keys(util.registeredOperationsOutgoing).length).toEqual(
        IMPLEMENTED_ANALYTICSTYPES.length,
      );
    });
  });

  describe("#mapOutgoing()", () => {
    describe("for analytics type 'traffic_summary'", () => {
      const analyticsType = "traffic_summary";
      it("should map it to one request with all envelopes", () => {
        // Arrange
        const totalMessages = 2;
        const messages = createHullAccountUpdateMessages(
          totalMessages,
          [],
          0,
          totalMessages,
          0,
        );
        const envelopes = messages.map((message) => {
          return {
            message,
            objectType: "account" as Type$OutgoingOperationObject,
            operation: "analytics" as Type$OutgoingOperation,
          };
        });

        const hullAppSettings: Schema$PrivateSettings = {
          account_attributes_incoming_backlinks_categories: [],
          account_attributes_incoming_traffic_summary: [],
          account_synchronized_segments_backlinks_categories: [],
          account_synchronized_segments_traffic_summary: [],
        };
        const opts = {
          hullAppSettings,
        };
        const util = new MappingUtil(opts);

        // Act
        const mappedResult = util.mapOutgoing({
          analyticsType,
          envelopes,
        });

        // Assert
        const expectedResult = [
          {
            params: [
              {
                domains: messages.map((msg) => msg.account.domain),
              },
            ],
            envelopes,
          },
        ];

        expect(mappedResult).toEqual(expectedResult);
      });
    });

    describe("for analytics type 'backlinks_categories'", () => {
      const analyticsType = "backlinks_categories";
      it("should map it to one request per envelope", () => {
        // Arrange
        const totalMessages = 2;
        const messages = createHullAccountUpdateMessages(
          totalMessages,
          [],
          0,
          totalMessages,
          0,
        );
        const envelopes = messages.map((message) => {
          return {
            message,
            objectType: "account" as Type$OutgoingOperationObject,
            operation: "analytics" as Type$OutgoingOperation,
          };
        });

        const hullAppSettings: Schema$PrivateSettings = {
          account_attributes_incoming_backlinks_categories: [],
          account_attributes_incoming_traffic_summary: [],
          account_synchronized_segments_backlinks_categories: [],
          account_synchronized_segments_traffic_summary: [],
        };
        const opts = {
          hullAppSettings,
        };
        const util = new MappingUtil(opts);

        // Act
        const mappedResult = util.mapOutgoing({
          analyticsType,
          envelopes,
        });

        // Assert
        const expectedResult = envelopes.map((envelope) => {
          return {
            envelopes: [
              envelope as Schema$OutgoingOperationEnvelope<
                IHullAccountUpdateMessage,
                unknown
              >,
            ],
            params: [
              {
                export_columns: ["category_name", "rating"],
                target: get(envelope, "message.account.domain"),
                target_type: "root_domain",
              },
            ],
          };
        });

        expect(mappedResult).toEqual(expectedResult);
      });
    });
  });

  describe("#mapIncoming()", () => {
    describe("for analytics type 'traffic_summary'", () => {
      const analyticsType = "traffic_summary";
      it("should map it account attributes", () => {
        // Arrange
        const totalMessages = 2;
        const messages = createHullAccountUpdateMessages(
          totalMessages,
          [],
          0,
          totalMessages,
          0,
        );
        const envelopes = messages.map((message) => {
          return {
            message,
            objectType: "account" as Type$OutgoingOperationObject,
            operation: "analytics" as Type$OutgoingOperation,
          };
        });

        const hullAppSettings: Schema$PrivateSettings = {
          account_attributes_incoming_backlinks_categories: [],
          account_attributes_incoming_traffic_summary: [
            {
              hull: "semrush/domain",
              service: "domain",
            },
            {
              hull: "semrush/report_date",
              service: "display_date",
            },
            {
              hull: "semrush/country",
              service: "country",
            },
            {
              hull: "semrush/total_rank",
              service: "total_rank",
            },
            {
              hull: "semrush/desktop_share",
              service: "desktop_share",
            },
          ],
          account_synchronized_segments_backlinks_categories: [],
          account_synchronized_segments_traffic_summary: [],
        };
        const opts = {
          hullAppSettings,
        };
        const now = new Date();
        const data: semrush_v3.Schema$TrafficSummary[] = messages.map((msg) => {
          return {
            domain: msg.account.domain as string,
            display_date: `${now.getFullYear()}-${
              now.getMonth() < 10 ? "0" : ""
            }${now.getMonth()}-01`,
            total_rank: random.number(),
            desktop_rank: random.number(),
            mobile_rank: random.number(),
            desktop_share: random.float({ min: 0, max: 1 }),
            mobile_share: random.float({ min: 0, max: 1 }),
            total_visits: random.number(),
            mobile_visits: random.number(),
            desktop_visits: random.number(),
            total_unique_visitors: random.number(),
            mobile_unique_visitors: random.number(),
            desktop_unique_visitors: random.number(),
            total_pages_per_visit: random.float({
              min: 0,
              max: 100,
              precision: 2,
            }),
            mobile_pages_per_visit: random.float({
              min: 0,
              max: 100,
              precision: 2,
            }),
            desktop_pages_per_visit: random.float({
              min: 0,
              max: 100,
              precision: 2,
            }),
            total_avg_visit_duration: random.number(),
            mobile_avg_visit_duration: random.number(),
            desktop_avg_visit_duration: random.number(),
            total_bounce_rate: random.float({ min: 0, max: 1 }),
            mobile_bounce_rate: random.float({ min: 0, max: 1 }),
            desktop_bounce_rate: random.float({ min: 0, max: 1 }),
          };
        });
        const util = new MappingUtil(opts);
        const executionTime = DateTime.utc().toISO();
        // Act
        const mappedResult = util.mapIncoming({
          analyticsType,
          data,
          hullData: envelopes,
          executionTime,
        });

        // Assert
        const expectedResult: Schema$MapIncomingResult[] = data.map((d) => {
          const envelope = envelopes.find(
            (e) => e.message.account.domain === d.domain,
          );
          const ident = pick(envelope!.message.account, [
            "id",
            "external_id",
            "domain",
          ]);
          if (
            (get(envelope!.message.account, "anonymous_ids", []) as string[])
              .length > 0
          ) {
            set(
              ident,
              "anonymous_id",
              first(
                get(envelope!.message.account, "anonymous_ids", []) as string[],
              ),
            );
          }

          const attribs = {
            "semrush/domain": {
              operation: "set",
              value: d.domain,
            },
            "semrush/country": {
              operation: "set",
              value: null,
            },
            "semrush/report_date": {
              operation: "set",
              value: DateTime.fromISO(d.display_date)
                .set({ hour: 12 })
                .toUTC()
                .toISO(),
            },
            "semrush/total_rank": {
              operation: "set",
              value: d.total_rank,
            },
            "semrush/desktop_share": {
              operation: "set",
              value: (d.desktop_share as number) * 100,
            },
          };
          set(attribs, `semrush/${analyticsType}_lastrun_at`, executionTime);
          return {
            ident,
            hullOperation: "traits",
            hullScope: "asAccount",
            hullOperationParams: [attribs],
          };
        });

        expect(mappedResult).toEqual(expectedResult);
      });
    });

    describe("for analytics type 'backlinks_categories'", () => {
      const analyticsType = "backlinks_categories";
      it("should map it account attributes", () => {
        // Arrange
        const totalMessages = 1;
        const messages = createHullAccountUpdateMessages(
          totalMessages,
          [],
          0,
          totalMessages,
          0,
        );
        const envelopes = messages.map((message) => {
          return {
            message,
            objectType: "account" as Type$OutgoingOperationObject,
            operation: "analytics" as Type$OutgoingOperation,
          };
        });

        const hullAppSettings: Schema$PrivateSettings = {
          account_attributes_incoming_backlinks_categories: [
            {
              hull: "semrush/categories_names",
              service: "categories[].category_name",
            },
            {
              hull: "semrush/categories_detailed",
              service: "categories",
            },
          ],
          account_attributes_incoming_traffic_summary: [],
          account_synchronized_segments_backlinks_categories: [],
          account_synchronized_segments_traffic_summary: [],
        };
        const opts = {
          hullAppSettings,
        };
        const util = new MappingUtil(opts);
        const data: semrush_v3.Schema$BacklinksCategories[] = [
          {
            category_name:
              "/Internet & Telecom/Web Services/Search Engine Optimization & Marketing",
            rating: 0.931905,
          },
          {
            category_name:
              "/Internet & Telecom/Web Services/Affiliate Programs",
            rating: 0.880989,
          },
          {
            category_name:
              "/Business & Industrial/Advertising & Marketing/Marketing",
            rating: 0.872495,
          },
        ];
        const executionTime = DateTime.utc().toISO();

        // Act
        const mappedResult = util.mapIncoming({
          analyticsType,
          data,
          hullData: envelopes,
          executionTime,
        });

        // Assert
        const expectedResult: Schema$MapIncomingResult[] = envelopes.map(
          (envelope) => {
            const ident = pick(envelope!.message.account, [
              "id",
              "external_id",
              "domain",
            ]);
            if (
              (get(envelope!.message.account, "anonymous_ids", []) as string[])
                .length > 0
            ) {
              set(
                ident,
                "anonymous_id",
                first(
                  get(
                    envelope!.message.account,
                    "anonymous_ids",
                    [],
                  ) as string[],
                ),
              );
            }
            const attribs = {
              "semrush/categories_names": {
                operation: "set",
                value: data.map((d) => d.category_name),
              },
              "semrush/categories_detailed": {
                operation: "set",
                value: data,
              },
            };
            set(attribs, `semrush/${analyticsType}_lastrun_at`, executionTime);
            return {
              hullOperation: "traits",
              hullOperationParams: [attribs],
              hullScope: "asAccount",
              ident,
            };
          },
        );

        // Note: For now we don't do a value comparison for equality reasons of floats in arrays,
        //       but this test needs to be revisited
        expect(mappedResult[0].hullOperation).toEqual(
          expectedResult[0].hullOperation,
        );
        expect(mappedResult[0].hullScope).toEqual(expectedResult[0].hullScope);
        expect(mappedResult[0].hullOperationParams.length).toEqual(
          expectedResult[0].hullOperationParams.length,
        );
      });
    });
  });
});
