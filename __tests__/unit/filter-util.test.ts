import { set } from "lodash";
import { Schema$PrivateSettings } from "../../src/core/connector";
import { FilterUtil } from "../../src/utils/filter-util";
import { IMPLEMENTED_ANALYTICSTYPES } from "../_helpers/constants";
import { createHullAccountUpdateMessages } from "../_helpers/data-helpers";
import { random } from "faker";

describe("FilterUtil", () => {
  const loggerMock = {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    silly: jest.fn(),
    verbose: jest.fn(),
  };

  describe("#constructor", () => {
    it("should initialize all readonly fields", () => {
      // Arrange
      const hullAppSettings: Schema$PrivateSettings = {
        account_attributes_incoming_backlinks_categories: [],
        account_attributes_incoming_domain_ranks: [],
        account_attributes_incoming_traffic_summary: [],
        account_synchronized_segments_backlinks_categories: [],
        account_synchronized_segments_domain_ranks: [],
        account_synchronized_segments_traffic_summary: [],
      };
      const opts = {
        logger: loggerMock,
        hullAppSettings,
      };
      // Act
      const util = new FilterUtil(opts);

      // Assert
      expect(util.appSettings).toEqual(hullAppSettings);
      expect(util.logger).toBeDefined();
      expect(Object.keys(util.registeredAccountFilters).length).toEqual(
        IMPLEMENTED_ANALYTICSTYPES.length,
      );
    });
  });

  describe("#filterAccountMessages()", () => {
    IMPLEMENTED_ANALYTICSTYPES.forEach((analyticsType) => {
      describe(`for analytics type '${analyticsType}'`, () => {
        it("should mark all messages as skips if none matches the whitelisted segments", () => {
          // Arrange
          const totalMessages = 2;
          const messages = createHullAccountUpdateMessages(
            totalMessages,
            [],
            0,
            totalMessages,
            0,
          );
          const hullAppSettings: Schema$PrivateSettings = {
            account_attributes_incoming_backlinks_categories: [],
            account_attributes_incoming_domain_ranks: [],
            account_attributes_incoming_traffic_summary: [],
            account_synchronized_segments_backlinks_categories: [],
            account_synchronized_segments_domain_ranks: [],
            account_synchronized_segments_traffic_summary: [],
          };
          const opts = {
            logger: loggerMock,
            hullAppSettings,
          };
          const util = new FilterUtil(opts);

          // Act
          const filterResult = util.filterAccountMessages(
            analyticsType,
            messages,
            false,
          );

          // Assert
          expect(filterResult.analytics.length).toEqual(0);
          expect(filterResult.skips.length).toEqual(totalMessages);
        });

        it("should mark all messages as skips on a batch if batch handling is not enabled", () => {
          // Arrange
          const totalMessages = 2;
          const messages = createHullAccountUpdateMessages(
            totalMessages,
            [],
            0,
            totalMessages,
            0,
          );
          const hullAppSettings: Schema$PrivateSettings = {
            account_attributes_incoming_backlinks_categories: [],
            account_attributes_incoming_domain_ranks: [],
            account_attributes_incoming_traffic_summary: [],
            account_synchronized_segments_backlinks_categories: [],
            account_synchronized_segments_domain_ranks: [],
            account_synchronized_segments_traffic_summary: [],
          };
          const opts = {
            logger: loggerMock,
            hullAppSettings,
          };
          const util = new FilterUtil(opts);

          // Act
          const filterResult = util.filterAccountMessages(
            analyticsType,
            messages,
            true,
          );

          // Assert
          expect(filterResult.analytics.length).toEqual(0);
          expect(filterResult.skips.length).toEqual(totalMessages);
        });

        it("should mark all messages to process on a batch if batch handling is enabled", () => {
          // Arrange
          const totalMessages = 2;
          const messages = createHullAccountUpdateMessages(
            totalMessages,
            [],
            0,
            totalMessages,
            0,
          );
          const hullAppSettings: Schema$PrivateSettings = {
            account_attributes_incoming_backlinks_categories: [],
            account_attributes_incoming_domain_ranks: [],
            account_attributes_incoming_traffic_summary: [],
            account_synchronized_segments_backlinks_categories: [],
            account_synchronized_segments_domain_ranks: [],
            account_synchronized_segments_traffic_summary: [],
          };
          set(hullAppSettings, `batch_enabled_${analyticsType}`, true);
          const opts = {
            logger: loggerMock,
            hullAppSettings,
          };
          const util = new FilterUtil(opts);

          // Act
          const filterResult = util.filterAccountMessages(
            analyticsType,
            messages,
            true,
          );

          // Assert
          expect(filterResult.analytics.length).toEqual(totalMessages);
          expect(filterResult.skips.length).toEqual(0);
        });

        it("should mark messages to process if they match a whitelisted segment", () => {
          // Arrange
          const segmentIds = [random.uuid()];
          const totalMessages = 2;
          const totalInSegments = 1;
          const messages = createHullAccountUpdateMessages(
            totalMessages,
            segmentIds,
            totalInSegments,
            totalMessages,
            0,
          );
          const hullAppSettings: Schema$PrivateSettings = {
            account_attributes_incoming_backlinks_categories: [],
            account_attributes_incoming_domain_ranks: [],
            account_attributes_incoming_traffic_summary: [],
            account_synchronized_segments_backlinks_categories: [],
            account_synchronized_segments_domain_ranks: [],
            account_synchronized_segments_traffic_summary: [],
          };
          set(
            hullAppSettings,
            `account_synchronized_segments_${analyticsType}`,
            segmentIds,
          );
          const opts = {
            logger: loggerMock,
            hullAppSettings,
          };
          const util = new FilterUtil(opts);

          // Act
          const filterResult = util.filterAccountMessages(
            analyticsType,
            messages,
            false,
          );

          // Assert
          expect(filterResult.analytics.length).toEqual(totalInSegments);
          expect(filterResult.skips.length).toEqual(
            totalMessages - totalInSegments,
          );
        });

        it("should mark messages to skip if they don't have a domain even if they match a whitelisted segment", () => {
          // Arrange
          const segmentIds = [random.uuid()];
          const totalMessages = 2;
          const totalInSegments = 1;
          const messages = createHullAccountUpdateMessages(
            totalMessages,
            segmentIds,
            totalInSegments,
            0,
            0,
          );
          const hullAppSettings: Schema$PrivateSettings = {
            account_attributes_incoming_backlinks_categories: [],
            account_attributes_incoming_domain_ranks: [],
            account_attributes_incoming_traffic_summary: [],
            account_synchronized_segments_backlinks_categories: [],
            account_synchronized_segments_domain_ranks: [],
            account_synchronized_segments_traffic_summary: [],
          };
          set(
            hullAppSettings,
            `account_synchronized_segments_${analyticsType}`,
            segmentIds,
          );
          const opts = {
            logger: loggerMock,
            hullAppSettings,
          };
          const util = new FilterUtil(opts);

          // Act
          const filterResult = util.filterAccountMessages(
            analyticsType,
            messages,
            false,
          );

          // Assert
          expect(filterResult.analytics.length).toEqual(0);
          expect(filterResult.skips.length).toEqual(totalMessages);
        });
      });
    });
  });
});
