import type { AuthSchemes } from "../auth-schemes.js";
import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import * as s from "../core/validation/index.js";
import { errandSchema, type Errand } from "../models/errand.js";
import { errorSchema, type Error } from "../models/error.js";
import type { Servers } from "../servers.js";

/**
 * What an errand allows and how much of it is left.
 */
export class Errands {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;
  readonly #auth: AuthSchemes;

  constructor(rawClient: RawClient, servers: Servers, auth: AuthSchemes) {
    this.#rawClient = rawClient;
    this.#servers = servers;
    this.#auth = auth;
  }

  /**
   * Get an errand's standing
   *
   * @remarks
   * The errand's status and what is left to spend. Call it when a courier knocks: a revoked or
   * used-up errand is turned away within seconds.
   *
   * @returns The errand.
   *
   * @throws {@link Errands.GetErrandError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  getErrand(
    request: Errands.GetErrandRequest,
    options?: RequestOptions,
  ): ApiPromise<Errand, Errands.GetErrandError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/visas/{visaId}"),
        auth: this.#auth.shopKey,
        pathParams: [{ name: "visaId", value: request.visaId, schema: s.string() }],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: errandSchema },
        errorFactory: Errands.GetErrandError,
      },
      options,
    );
  }
}

export namespace Errands {
  export type GetErrandRequest = {
    /** The errand's ID, from the courier's token (`visa.id`). */
    visaId: string;
  };

  export class GetErrandError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"error2", Error> | Undeclared;

    static readonly errors: ErrorDecoders<GetErrandError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
    ];
  }
}
