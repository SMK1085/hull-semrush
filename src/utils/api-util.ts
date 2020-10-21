import {
  Type$ApiMethod,
  Schema$ApiResultObject,
} from "../core/service-objects";

export class ApiUtil {
  /**
   * Handles errors of an API operation and creates an appropriate result.
   *
   * @static
   * @template T The type of data.
   * @param {string} url The url of the API endpoint
   * @param {Method} method The API method.
   * @param {TPayload} payload The payload data with which the API endpoint has been invoked.
   * @param {TError} payload The error type.
   * @param {any} error The error thrown by the invocation of the API.
   * @returns {Schema$ApiResultObject<TPayload, TData, TError>} An API result with the properly formatted error messages.
   * @memberof ErrorUtil
   */
  public static handleApiResultError<TPayload, TData, TError>(
    url: string,
    method: Type$ApiMethod,
    payload: TPayload,
    error: TError,
  ): Schema$ApiResultObject<TPayload, TData, TError> {
    const apiResult: Schema$ApiResultObject<TPayload, TData, TError> = {
      data: undefined,
      endpoint: url,
      error: (error as any).message,
      method,
      payload,
      success: false,
      errorDetails: error,
    };

    return apiResult;
  }

  /**
   * Creates a properly composed API result object based on the nforce response data.
   *
   * @static
   * @template T The type of data.
   * @param {string} url The url of the API endpoint.
   * @param {Method} method The API method.
   * @param {TPayload} payload The payload data with which the API endpoint has been invoked.
   * @param {TData} data The response data returned from the API.
   * @param {TError} payload The error type.
   * @returns {Schema$ApiResultObject<TPayload, TData>} A properly composed API result object.
   * @memberof ApiUtil
   */
  public static handleApiResultSuccess<TPayload, TData, TError>(
    url: string,
    method: Type$ApiMethod,
    payload: TPayload,
    data: TData,
  ): Schema$ApiResultObject<TPayload, TData, TError> {
    const apiResult: Schema$ApiResultObject<TPayload, TData, TError> = {
      data,
      endpoint: url,
      error: undefined,
      method,
      payload,
      success: true,
      errorDetails: undefined,
    };

    return apiResult;
  }
}
