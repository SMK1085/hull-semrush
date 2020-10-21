import { ServiceClient } from "../../src/core/service-client";
import qs from "querystring";
import nock from "nock";
import { API_BASE, API_KEY } from "../_helpers/constants";
import { semrush_v3 } from "../../src/core/service-objects";
import { MAPPINGS_TRAFFICSUMMARY_V3 } from "../../src/core/connector";

describe("ServiceClient", () => {
  afterAll(() => {
    nock.restore();
  });

  describe("#constructor", () => {
    it("should initialize the readonly fields", () => {
      // Arrange
      const opts = {
        apiKey: API_KEY,
      };

      // Act
      const client = new ServiceClient(opts);

      // Assert
      expect(client.apiKey).toEqual(API_KEY);
    });
  });

  describe("#runBacklinksCategoriesReport", () => {
    beforeEach(() => {
      if (!nock.isActive) {
        nock.activate();
      }
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it("should return the parsed API result upon success", async () => {
      // Arrange
      const request: semrush_v3.Schema$BacklinksCategoriesRequest = {
        export_columns: ["category_name", "rating"],
        target: "searchenginejournal.com",
        target_type: "root_domain",
      };
      const qsObject = {
        type: "backlinks_categories",
        ...request,
        key: API_KEY,
      };
      const opts = {
        apiKey: API_KEY,
      };

      const client = new ServiceClient(opts);

      nock(API_BASE)
        .get(`/analytics/v1/?${qs.stringify(qsObject)}`)
        .reply(
          200,
          `category_name;rating\n/Internet & Telecom/Web Services/Search Engine Optimization & Marketing;0.931905\n/Internet & Telecom/Web Services/Affiliate Programs;0.880989\n/Business & Industrial/Advertising & Marketing/Marketing;0.872495\n/Internet & Telecom/Search Engines;0.821398\n/Business & Industrial/Advertising & Marketing/Brand Management;0.813207`,
          {
            "content-type": "text/plain; charset=utf-8",
          },
        );

      // Act
      const apiResponse = await client.runBacklinksCategoriesReport(request);

      // Assert
      const expectedData = [
        {
          category_name:
            "/Internet & Telecom/Web Services/Search Engine Optimization & Marketing",
          rating: 0.931905,
        },
        {
          category_name: "/Internet & Telecom/Web Services/Affiliate Programs",
          rating: 0.880989,
        },
        {
          category_name:
            "/Business & Industrial/Advertising & Marketing/Marketing",
          rating: 0.872495,
        },
        {
          category_name: "/Internet & Telecom/Search Engines",
          rating: 0.821398,
        },
        {
          category_name:
            "/Business & Industrial/Advertising & Marketing/Brand Management",
          rating: 0.813207,
        },
      ];
      expect(apiResponse.success).toBeTruthy();
      expect(apiResponse.data).toStrictEqual(expectedData);
    });

    it("should return a proper error if the call fails with an error code", async () => {
      // Arrange
      const request: semrush_v3.Schema$BacklinksCategoriesRequest = {
        export_columns: ["category_name", "rating"],
        target: "searchenginejournal.com",
        target_type: "root_domain",
      };
      const qsObject = {
        type: "backlinks_categories",
        ...request,
        key: API_KEY,
      };
      const opts = {
        apiKey: API_KEY,
      };

      const client = new ServiceClient(opts);

      nock(API_BASE)
        .get(`/analytics/v1/?${qs.stringify(qsObject)}`)
        .reply(200, `ERROR 120 :: WRONG KEY - ID PAIR`, {
          "content-type": "text/plain; charset=utf-8",
        });

      // Act
      const apiResponse = await client.runBacklinksCategoriesReport(request);

      // Assert
      expect(apiResponse.success).toBeFalsy();
      expect(apiResponse.error).toEqual("WRONG KEY - ID PAIR (ERROR 120)");
    });
  });

  describe("#runTrafficSummaryReport", () => {
    beforeEach(() => {
      if (!nock.isActive) {
        nock.activate();
      }
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it("should return the parsed API result upon success", async () => {
      // Arrange
      const domains = [
        "twitter.com",
        "ampproject.org",
        "doubleclick.net",
        "instagram.com",
        "yahoo.co.jp",
        "exosrv.com",
        "yandex.ru",
        "vk.com",
        "blogspot.com",
        "amazon.com",
        "t.co",
      ];
      const request: semrush_v3.Schema$TrafficSummaryRequest = {
        domains,
        country: "US",
        display_date: "2018-11-01",
        export_colums: MAPPINGS_TRAFFICSUMMARY_V3.map((m) => m.value) as any[],
      };
      const opts = {
        apiKey: API_KEY,
      };

      const client = new ServiceClient(opts);
      nock(API_BASE)
        .get(/\/analytics\/ta\/v2.*$/)
        .reply(
          200,
          `domain;display_date;country;desktop_share;mobile_share;total_avg_visit_duration;desktop_avg_visit_duration;mobile_avg_visit_duration\ntwitter.com;2018-11-01;US;0.2699767314554674;0.7300232685445326;1164;1428;1066\nampproject.org;2018-11-01;US;0.0012006716984967855;0.9987993283015032;565;199;565\ndoubleclick.net;2018-11-01;US;0.005618903989814525;0.9943810960101854;407;146;408\ninstagram.com;2018-11-01;US;0.169500659532332;0.830499340467668;827;769;839\nyahoo.co.jp;2018-11-01;US;0.1519711166034962;0.8480288833965038;1252;1479;1211\nexosrv.com;2018-11-01;US;0.02838437721293225;0.9716156227870677;600;340;608\nyandex.ru;2018-11-01;US;0.5880861977963707;0.41191380220362933;1333;1559;1010\nvk.com;2018-11-01;US;0.5653450562200967;0.43465494377990327;1561;1949;1057\nblogspot.com;2018-11-01;US;n/a;n/a;n/a;n/a;n/a\namazon.com;2018-11-01;US;0.24643037260791617;0.7535696273920839;818;807;821\nt.co;2018-11-01;US;0.20281762287708946;0.7971823771229105;1275;1399;1243`,
          {
            "content-type": "text/plain; charset=utf-8",
          },
        );

      // Act
      const apiResponse = await client.runTrafficSummaryReport(request);

      // Assert
      const expectedData = [
        {
          domain: "twitter.com",
          display_date: "2018-11-01",
          country: "US",
          desktop_share: 0.2699767314554674,
          mobile_share: 0.7300232685445326,
          total_avg_visit_duration: 1164,
          desktop_avg_visit_duration: 1428,
          mobile_avg_visit_duration: 1066,
        },
        {
          domain: "ampproject.org",
          display_date: "2018-11-01",
          country: "US",
          desktop_share: 0.0012006716984967855,
          mobile_share: 0.9987993283015032,
          total_avg_visit_duration: 565,
          desktop_avg_visit_duration: 199,
          mobile_avg_visit_duration: 565,
        },
        {
          domain: "doubleclick.net",
          display_date: "2018-11-01",
          country: "US",
          desktop_share: 0.005618903989814525,
          mobile_share: 0.9943810960101854,
          total_avg_visit_duration: 407,
          desktop_avg_visit_duration: 146,
          mobile_avg_visit_duration: 408,
        },
        {
          domain: "instagram.com",
          display_date: "2018-11-01",
          country: "US",
          desktop_share: 0.169500659532332,
          mobile_share: 0.830499340467668,
          total_avg_visit_duration: 827,
          desktop_avg_visit_duration: 769,
          mobile_avg_visit_duration: 839,
        },
        {
          domain: "yahoo.co.jp",
          display_date: "2018-11-01",
          country: "US",
          desktop_share: 0.1519711166034962,
          mobile_share: 0.8480288833965038,
          total_avg_visit_duration: 1252,
          desktop_avg_visit_duration: 1479,
          mobile_avg_visit_duration: 1211,
        },
        {
          domain: "exosrv.com",
          display_date: "2018-11-01",
          country: "US",
          desktop_share: 0.02838437721293225,
          mobile_share: 0.9716156227870677,
          total_avg_visit_duration: 600,
          desktop_avg_visit_duration: 340,
          mobile_avg_visit_duration: 608,
        },
        {
          domain: "yandex.ru",
          display_date: "2018-11-01",
          country: "US",
          desktop_share: 0.5880861977963707,
          mobile_share: 0.41191380220362933,
          total_avg_visit_duration: 1333,
          desktop_avg_visit_duration: 1559,
          mobile_avg_visit_duration: 1010,
        },
        {
          domain: "vk.com",
          display_date: "2018-11-01",
          country: "US",
          desktop_share: 0.5653450562200967,
          mobile_share: 0.43465494377990327,
          total_avg_visit_duration: 1561,
          desktop_avg_visit_duration: 1949,
          mobile_avg_visit_duration: 1057,
        },
        {
          domain: "blogspot.com",
          display_date: "2018-11-01",
          country: "US",
          desktop_share: "n/a",
          mobile_share: "n/a",
          total_avg_visit_duration: "n/a",
          desktop_avg_visit_duration: "n/a",
          mobile_avg_visit_duration: "n/a",
        },
        {
          domain: "amazon.com",
          display_date: "2018-11-01",
          country: "US",
          desktop_share: 0.24643037260791617,
          mobile_share: 0.7535696273920839,
          total_avg_visit_duration: 818,
          desktop_avg_visit_duration: 807,
          mobile_avg_visit_duration: 821,
        },
        {
          domain: "t.co",
          display_date: "2018-11-01",
          country: "US",
          desktop_share: 0.20281762287708946,
          mobile_share: 0.7971823771229105,
          total_avg_visit_duration: 1275,
          desktop_avg_visit_duration: 1399,
          mobile_avg_visit_duration: 1243,
        },
      ];
      expect(apiResponse.success).toBeTruthy();
      expect(apiResponse.data).toStrictEqual(expectedData);
    });

    it("should return a proper error if the call fails with an error code", async () => {
      // Arrange
      const domains = [
        "twitter.com",
        "ampproject.org",
        "doubleclick.net",
        "instagram.com",
        "yahoo.co.jp",
        "exosrv.com",
        "yandex.ru",
        "vk.com",
        "blogspot.com",
        "amazon.com",
        "t.co",
      ];
      const request: semrush_v3.Schema$TrafficSummaryRequest = {
        domains,
        country: "US",
        display_date: "2018-11-01",
        export_colums: MAPPINGS_TRAFFICSUMMARY_V3.map((m) => m.value) as any[],
      };
      const opts = {
        apiKey: API_KEY,
      };

      const client = new ServiceClient(opts);

      nock(API_BASE)
        .get(/\/analytics\/ta\/v2.*$/)
        .reply(200, `ERROR 120 :: WRONG KEY - ID PAIR`, {
          "content-type": "text/plain; charset=utf-8",
        });

      // Act
      const apiResponse = await client.runTrafficSummaryReport(request);

      // Assert
      expect(apiResponse.success).toBeFalsy();
      expect(apiResponse.error).toEqual("WRONG KEY - ID PAIR (ERROR 120)");
    });
  });
});
