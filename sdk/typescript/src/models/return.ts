import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { bySchema, type By } from "./by.js";
import { decision2Schema, type Decision2 } from "./decision2.js";

export type Return = {
  visaId: string;
  orderId: string;
  merchantName?: string;
  decision: Decision2;
  amountCents?: number;
  note?: string;
  by?: By;
  /** Which PayPal refunded it (Sandbox or Simulated). */
  paypal?: string;
};

export const returnSchema: Schema<Return> = s.object<Return>({
  visaId: s.string(),
  orderId: s.string(),
  merchantName: s.optional(s.string()),
  decision: decision2Schema,
  amountCents: s.optional(s.int()),
  note: s.optional(s.string()),
  by: s.optional(s.lazy(() => bySchema)),
  paypal: s.optional(s.string()),
});
