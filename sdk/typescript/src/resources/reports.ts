import type { AuthSchemes } from "../auth-schemes.js";
import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { errorSchema, type Error } from "../models/error.js";
import { reportResultSchema, type ReportResult } from "../models/report-result.js";
import { reportSchema, type Report } from "../models/report.js";
import type { Servers } from "../servers.js";

/**
 * Report a courier that misbehaves.
 */
export class Reports {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;
  readonly #auth: AuthSchemes;

  constructor(rawClient: RawClient, servers: Servers, auth: AuthSchemes) {
    this.#rawClient = rawClient;
    this.#servers = servers;
    this.#auth = auth;
  }

  /**
   * Report a courier
   *
   * @remarks
   * Suspends the errand at once and claims its bond, if it has one.
   *
   * @returns Suspended.
   *
   * @throws {@link Reports.ReportCourierError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  reportCourier(
    request: Reports.ReportCourierRequest,
    options?: RequestOptions,
  ): ApiPromise<ReportResult, Reports.ReportCourierError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/report"),
        auth: this.#auth.shopKey,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: reportSchema },
      },
      {
        success: { kind: "json", schema: reportResultSchema },
        errorFactory: Reports.ReportCourierError,
      },
      options,
    );
  }
}

export namespace Reports {
  export type ReportCourierRequest = {
    body: Report;
  };

  export class ReportCourierError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"error2", Error> | Undeclared;

    static readonly errors: ErrorDecoders<ReportCourierError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
    ];
  }
}
