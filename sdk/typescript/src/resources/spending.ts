import type { AuthSchemes } from "../auth-schemes.js";
import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { chargeResultSchema, type ChargeResult } from "../models/charge-result.js";
import { chargeSchema, type Charge } from "../models/charge.js";
import { commitResultSchema, type CommitResult } from "../models/commit-result.js";
import { commitSchema, type Commit } from "../models/commit.js";
import { errorSchema, type Error } from "../models/error.js";
import { okSchema, type Ok } from "../models/ok.js";
import { releaseSchema, type Release } from "../models/release.js";
import { spendCheckSchema, type SpendCheck } from "../models/spend-check.js";
import { spendDecisionSchema, type SpendDecision } from "../models/spend-decision.js";
import type { Servers } from "../servers.js";

/**
 * Ask before every hold or purchase, then charge, commit or release.
 */
export class Spending {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;
  readonly #auth: AuthSchemes;

  constructor(rawClient: RawClient, servers: Servers, auth: AuthSchemes) {
    this.#rawClient = rawClient;
    this.#servers = servers;
    this.#auth = auth;
  }

  /**
   * Charge the person's saved PayPal
   *
   * @remarks
   * Only when the decision said `autopay`. Charges exactly the held amount, once per hold.
   *
   * @returns The PayPal order.
   *
   * @throws {@link Spending.ChargeSavedPaypalError} when the API answers with an error status —
   * narrow on `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  chargeSavedPaypal(
    request: Spending.ChargeSavedPaypalRequest,
    options?: RequestOptions,
  ): ApiPromise<ChargeResult, Spending.ChargeSavedPaypalError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/spend/charge"),
        auth: this.#auth.shopKey,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: chargeSchema },
      },
      {
        success: { kind: "json", schema: chargeResultSchema },
        errorFactory: Spending.ChargeSavedPaypalError,
      },
      options,
    );
  }

  /**
   * Ask before a hold or a purchase
   *
   * @remarks
   * Courier checks the errand's limits in code, then whether the items fit what the person asked
   * for. It approves (with a hold on the budget for a checkout), denies with a code, or asks the
   * person first.
   *
   * @returns Courier's decision.
   *
   * @throws {@link Spending.CheckSpendError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  checkSpend(
    request: Spending.CheckSpendRequest,
    options?: RequestOptions,
  ): ApiPromise<SpendDecision, Spending.CheckSpendError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/spend/check"),
        auth: this.#auth.shopKey,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: spendCheckSchema },
      },
      {
        success: { kind: "json", schema: spendDecisionSchema },
        errorFactory: Spending.CheckSpendError,
      },
      options,
    );
  }

  /**
   * Record a paid order
   *
   * @remarks
   * After PayPal captured the payment. Idempotent per hold.
   *
   * @returns What the errand has spent.
   *
   * @throws {@link Spending.CommitSpendError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  commitSpend(
    request: Spending.CommitSpendRequest,
    options?: RequestOptions,
  ): ApiPromise<CommitResult, Spending.CommitSpendError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/spend/commit"),
        auth: this.#auth.shopKey,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: commitSchema },
      },
      {
        success: { kind: "json", schema: commitResultSchema },
        errorFactory: Spending.CommitSpendError,
      },
      options,
    );
  }

  /**
   * Give a hold back
   *
   * @remarks
   * When an order is cancelled before it is paid.
   *
   * @returns Released.
   *
   * @throws {@link Spending.ReleaseHoldError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  releaseHold(
    request: Spending.ReleaseHoldRequest,
    options?: RequestOptions,
  ): ApiPromise<Ok, Spending.ReleaseHoldError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/spend/release"),
        auth: this.#auth.shopKey,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: releaseSchema },
      },
      {
        success: { kind: "json", schema: okSchema },
        errorFactory: Spending.ReleaseHoldError,
      },
      options,
    );
  }
}

export namespace Spending {
  export type ChargeSavedPaypalRequest = {
    body: Charge;
  };

  export class ChargeSavedPaypalError extends ApiError {
    declare readonly payload:
      | Declared<"error", Error>
      | Declared<"error2", Error>
      | Declared<"error3", Error>
      | Declared<"error4", Error>
      | Undeclared;

    static readonly errors: ErrorDecoders<ChargeSavedPaypalError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
      { on: 409, kind: "error3", decode: { kind: "json", schema: errorSchema } },
      { on: 502, kind: "error4", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type CheckSpendRequest = {
    body: SpendCheck;
  };

  export class CheckSpendError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Undeclared;

    static readonly errors: ErrorDecoders<CheckSpendError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type CommitSpendRequest = {
    body: Commit;
  };

  export class CommitSpendError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"error2", Error> | Undeclared;

    static readonly errors: ErrorDecoders<CommitSpendError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type ReleaseHoldRequest = {
    body: Release;
  };

  export class ReleaseHoldError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Undeclared;

    static readonly errors: ErrorDecoders<ReleaseHoldError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
    ];
  }
}
