import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

export const PaidWith = {
  PaypalPage: "paypal_page",
  SavedPaypal: "saved_paypal",
} as const;
export type PaidWith = (typeof PaidWith)[keyof typeof PaidWith] | (string & {});

export const paidWithSchema: EnumSchema<PaidWith> = s.enumOf<PaidWith>(PaidWith);
