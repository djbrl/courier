import type { AuthSchemes } from "../auth-schemes.js";
import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { errorSchema, type Error } from "../models/error.js";
import { okSchema, type Ok } from "../models/ok.js";
import { parcelSchema, type Parcel } from "../models/parcel.js";
import { returnSchema, type Return } from "../models/return.js";
import { stepSchema, type Step } from "../models/step.js";
import type { Servers } from "../servers.js";

/**
 * Parcels, returns and other steps the person sees on their errand.
 */
export class AfterSale {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;
  readonly #auth: AuthSchemes;

  constructor(rawClient: RawClient, servers: Servers, auth: AuthSchemes) {
    this.#rawClient = rawClient;
    this.#servers = servers;
    this.#auth = auth;
  }

  /**
   * Add a step to the errand
   *
   * @remarks
   * A line the person sees on their errand, such as a browse. Browse steps are kept to one per 10
   * minutes.
   *
   * @returns Added, or skipped.
   *
   * @throws {@link AfterSale.AddStepError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  addStep(
    request: AfterSale.AddStepRequest,
    options?: RequestOptions,
  ): ApiPromise<Ok, AfterSale.AddStepError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/stamps"),
        auth: this.#auth.shopKey,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: stepSchema },
      },
      {
        success: { kind: "json", schema: okSchema },
        errorFactory: AfterSale.AddStepError,
      },
      options,
    );
  }

  /**
   * Tell the errand about a parcel
   *
   * @remarks
   * Each step of a delivery, in order. A step at or before the last one sent is skipped. Carries no
   * personal data.
   *
   * @returns Told, or skipped.
   *
   * @throws {@link AfterSale.UpdateParcelError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  updateParcel(
    request: AfterSale.UpdateParcelRequest,
    options?: RequestOptions,
  ): ApiPromise<Ok, AfterSale.UpdateParcelError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/shipments"),
        auth: this.#auth.shopKey,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: parcelSchema },
      },
      {
        success: { kind: "json", schema: okSchema },
        errorFactory: AfterSale.UpdateParcelError,
      },
      options,
    );
  }

  /**
   * Tell the errand what you decided on a return
   *
   * @remarks
   * A refund in full or in part, or a decline. A repeat of the same decision is skipped. A refund
   * doesn't raise what the errand may still spend.
   *
   * @returns Told, or skipped.
   *
   * @throws {@link AfterSale.UpdateReturnError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link CourierShopsError} when no usable response was produced: a connection failure, a
   * timeout, a body that would not decode, a value that would not encode, or a credential that
   * could not be obtained
   */
  updateReturn(
    request: AfterSale.UpdateReturnRequest,
    options?: RequestOptions,
  ): ApiPromise<Ok, AfterSale.UpdateReturnError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/returns"),
        auth: this.#auth.shopKey,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: returnSchema },
      },
      {
        success: { kind: "json", schema: okSchema },
        errorFactory: AfterSale.UpdateReturnError,
      },
      options,
    );
  }
}

export namespace AfterSale {
  export type AddStepRequest = {
    body: Step;
  };

  export class AddStepError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"error2", Error> | Undeclared;

    static readonly errors: ErrorDecoders<AddStepError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type UpdateParcelRequest = {
    body: Parcel;
  };

  export class UpdateParcelError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"error2", Error> | Undeclared;

    static readonly errors: ErrorDecoders<UpdateParcelError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
    ];
  }

  export type UpdateReturnRequest = {
    body: Return;
  };

  export class UpdateReturnError extends ApiError {
    declare readonly payload: Declared<"error", Error> | Declared<"error2", Error> | Undeclared;

    static readonly errors: ErrorDecoders<UpdateReturnError> = [
      { on: 401, kind: "error", decode: { kind: "json", schema: errorSchema } },
      { on: 404, kind: "error2", decode: { kind: "json", schema: errorSchema } },
    ];
  }
}
