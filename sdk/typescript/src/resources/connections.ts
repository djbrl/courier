import type { AuthSchemes } from "../auth-schemes.js";
import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { connectionSchema, type Connection } from "../models/connection.js";
import { errorSchema, type Error } from "../models/error.js";
import { ticketRequestSchema, type TicketRequest } from "../models/ticket-request.js";
import { ticketResultSchema, type TicketResult } from "../models/ticket-result.js";
import type { Servers } from "../servers.js";

/**
 * A person's Claude, connected to a shop between errands.
 */
export class Connections {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;
  readonly #auth: AuthSchemes;

  constructor(rawClient: RawClient, servers: Servers, auth: AuthSchemes) {
    this.#rawClient = rawClient;
    this.#servers = servers;
    this.#auth = auth;
  }

  /**
   * Get a connection's standing
   *
   * @remarks
   * Whether a connected Claude is still allowed in, and its current errand as a short-lived signed
   * token (verify it like any Courier token).
   *
   * @returns The connection.
   *
   * @throws {@link Connections.GetConnectionError} when the API answers with an error status —
   * narrow on `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  getConnection(
    request: Connections.GetConnectionRequest,
    options?: RequestOptions,
  ): ApiPromise<Connection, Connections.GetConnectionError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/connections/{connectionId}"),
        auth: this.#auth.shopKey,
        pathParams: [{ name: "connectionId", value: request.connectionId, schema: s.string() }],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: connectionSchema },
        errorFactory: Connections.GetConnectionError,
      },
      options,
    );
  }

  /**
   * Ask the person for an errand
   *
   * @remarks
   * When a connected Claude wants to buy with no errand open. Returns a link for the person to set
   * the budget, or, when the person already chose a budget in their chat app and has PayPal saved,
   * opens the errand at once. The agent's numbers are only suggestions.
   *
   * @returns A link or a new errand.
   *
   * @throws {@link Connections.RequestTicketError} when the API answers with an error status —
   * narrow on `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  requestTicket(
    request: Connections.RequestTicketRequest,
    options?: RequestOptions,
  ): ApiPromise<TicketResult, Connections.RequestTicketError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/connections/{connectionId}/ticket"),
        auth: this.#auth.shopKey,
        pathParams: [{ name: "connectionId", value: request.connectionId, schema: s.string() }],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: ticketRequestSchema },
      },
      {
        success: { kind: "json", schema: ticketResultSchema },
        errorFactory: Connections.RequestTicketError,
      },
      options,
    );
  }
}

export namespace Connections {
  export type GetConnectionRequest = {
    /** From the courier's token (`connection.id`). */
    connectionId: string;
  };

  export class GetConnectionError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"error2", Error> | Undeclared;

    static readonly errors: ErrorDecoders<GetConnectionError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type RequestTicketRequest = {
    /** From the courier's token (`connection.id`). */
    connectionId: string;
    body: TicketRequest;
  };

  export class RequestTicketError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"error2", Error> | Undeclared;

    static readonly errors: ErrorDecoders<RequestTicketError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
    ];
  }
}
