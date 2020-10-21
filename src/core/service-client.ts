import {
  semrush_v3,
  Schema$ApiResultObject,
  Type$ApiMethod,
} from "../core/service-objects";
import axios, { AxiosError } from "axios";
import { ApiUtil } from "../utils/api-util";
import { parse } from "papaparse";
import qs from "querystring";
import { pickBy, identity } from "lodash";

const API_BASE = "https://api.semrush.com";

export class ServiceClient {
  public readonly apiKey: string;

  constructor(options: any) {
    this.apiKey = options.apiKey;
  }

  public async runTrafficSummaryReport(
    params: semrush_v3.Schema$TrafficSummaryRequest,
  ): Promise<
    Schema$ApiResultObject<
      semrush_v3.Schema$TrafficSummaryRequest,
      semrush_v3.Schema$TrafficSummary[],
      AxiosError
    >
  > {
    const url = `${API_BASE}/analytics/ta/v2/?${this.createQueryString(
      "traffic_summary",
      {
        ...params,
        export_colums: params.export_colums
          ? params.export_colums.join(",")
          : null,
        domains: params.domains.join(","),
      },
    )}`;
    const method: Type$ApiMethod = "get";

    try {
      const response = await axios.get<string>(url);

      return ApiUtil.handleApiResultSuccess(
        url,
        method,
        params,
        this.parseCsvResponse<semrush_v3.Schema$TrafficSummary>(response.data),
      );
    } catch (error) {
      return ApiUtil.handleApiResultError(url, method, params, error);
    }
  }

  public async runBacklinksCategoriesReport(
    params: semrush_v3.Schema$BacklinksCategoriesRequest,
  ): Promise<
    Schema$ApiResultObject<
      semrush_v3.Schema$BacklinksCategoriesRequest,
      semrush_v3.Schema$BacklinksCategories[],
      AxiosError
    >
  > {
    const url = `${API_BASE}/analytics/v1/?${this.createQueryString(
      "backlinks_categories",
      params,
    )}`;
    const method: Type$ApiMethod = "get";

    try {
      const response = await axios.get<string>(url);

      return ApiUtil.handleApiResultSuccess(
        url,
        method,
        params,
        this.parseCsvResponse<semrush_v3.Schema$BacklinksCategories>(
          response.data,
        ),
      );
    } catch (error) {
      return ApiUtil.handleApiResultError(url, method, params, error);
    }
  }

  private createQueryString(type: string, params: any): string {
    const qsObject = {
      type,
      ...pickBy(params, identity),
      key: this.apiKey,
    };
    const query = qs.stringify(qsObject);
    return query;
  }

  private parseCsvResponse<T>(csvString: string): T[] {
    let resultRows: T[] = [];

    if (csvString.startsWith("ERROR")) {
      const errorSplits = csvString.split("::");
      let errorMessage = csvString.trim();
      if (errorSplits.length === 2) {
        errorMessage = `${errorSplits[1].trim()} (${errorSplits[0].trim()})`;
      }
      throw new Error(errorMessage);
    }

    var parseResult = parse(csvString, {
      delimiter: ";",
      header: true,
      dynamicTyping: true,
    });

    resultRows = parseResult.data as T[];

    if (parseResult.errors && parseResult.errors.length > 0) {
      console.error(parseResult.errors);
    }

    return resultRows;
  }
}
