import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type ChargeResult = {
  /** The PayPal order. */
  orderId: string;
  status: string;
  captureId?: string | null;
};

export const chargeResultSchema: Schema<ChargeResult> = s.object<ChargeResult>({
  orderId: s.string(),
  status: s.string(),
  captureId: s.optionalNullable(s.string()),
});
