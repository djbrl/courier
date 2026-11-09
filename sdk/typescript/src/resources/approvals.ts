import type { AuthSchemes } from "../auth-schemes.js";
import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { approvalStatusSchema, type ApprovalStatus } from "../models/approval-status.js";
import { decideSchema, type Decide } from "../models/decide.js";
import { errorSchema, type Error } from "../models/error.js";
import type { Servers } from "../servers.js";

/**
 * The person's answer when Courier asked them first.
 */
export class Approvals {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;
  readonly #auth: AuthSchemes;

  constructor(rawClient: RawClient, servers: Servers, auth: AuthSchemes) {
    this.#rawClient = rawClient;
    this.#servers = servers;
    this.#auth = auth;
  }

  /**
   * Get the person's answer
   *
   * @remarks
   * Where an ask stands while the person answers on Courier's page.
   *
   * @returns The ask.
   *
   * @throws {@link Approvals.GetApprovalError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  getApproval(
    request: Approvals.GetApprovalRequest,
    options?: RequestOptions,
  ): ApiPromise<ApprovalStatus, Approvals.GetApprovalError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/approvals/{approvalId}"),
        auth: this.#auth.shopKey,
        pathParams: [{ name: "approvalId", value: request.approvalId, schema: s.string() }],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: approvalStatusSchema },
        errorFactory: Approvals.GetApprovalError,
      },
      options,
    );
  }

  /**
   * Record the person's answer from their chat app
   *
   * @remarks
   * Only for an answer the person picked in a dialog their chat app showed them (the model can't
   * answer it). Never pass on an agent's own answer.
   *
   * @returns The ask.
   *
   * @throws {@link Approvals.RecordApprovalError} when the API answers with an error status —
   * narrow on `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  recordApproval(
    request: Approvals.RecordApprovalRequest,
    options?: RequestOptions,
  ): ApiPromise<ApprovalStatus, Approvals.RecordApprovalError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/approvals/{approvalId}/decide"),
        auth: this.#auth.shopKey,
        pathParams: [{ name: "approvalId", value: request.approvalId, schema: s.string() }],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: decideSchema },
      },
      {
        success: { kind: "json", schema: approvalStatusSchema },
        errorFactory: Approvals.RecordApprovalError,
      },
      options,
    );
  }
}

export namespace Approvals {
  export type GetApprovalRequest = {
    /** From a spend decision that asked the person. */
    approvalId: string;
  };

  export class GetApprovalError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"error2", Error> | Undeclared;

    static readonly errors: ErrorDecoders<GetApprovalError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type RecordApprovalRequest = {
    /** From a spend decision that asked the person. */
    approvalId: string;
    body: Decide;
  };

  export class RecordApprovalError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"error2", Error> | Undeclared;

    static readonly errors: ErrorDecoders<RecordApprovalError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
    ];
  }
}
