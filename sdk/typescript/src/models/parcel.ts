import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type Parcel = {
  visaId: string;
  orderId: string;
  merchantName?: string;
  carrierName?: string;
  trackingNumber?: string;
  /** Index into labels. */
  stage: number;
  /** Every step of this delivery, e.g. Shipped, Out for delivery, Delivered. */
  labels: string[];
  expectedAt?: string;
  /** Which PayPal took the tracking number (Sandbox or Simulated), if any. */
  paypal?: string | null;
  simulated?: boolean;
};

export const parcelSchema: Schema<Parcel> = s.object<Parcel>({
  visaId: s.string(),
  orderId: s.string(),
  merchantName: s.optional(s.string()),
  carrierName: s.optional(s.string()),
  trackingNumber: s.optional(s.string()),
  stage: s.int(),
  labels: s.array(s.string()),
  expectedAt: s.optional(s.string()),
  paypal: s.optionalNullable(s.string()),
  simulated: s.optional(s.boolean()),
});
