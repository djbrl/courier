import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type ChargeItem = {
  name: string;
  unitCents: number;
  quantity: number;
  sku?: string;
};

export const chargeItemSchema: Schema<ChargeItem> = s.object<ChargeItem>({
  name: s.string(),
  unitCents: s.int(),
  quantity: s.int(),
  sku: s.optional(s.string()),
});
