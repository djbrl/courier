import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { chargeItemSchema, type ChargeItem } from "./charge-item.js";

export type Charge = {
  visaId: string;
  holdId: string;
  description: string;
  /** The shop's name on the PayPal receipt. */
  brandName: string;
  items?: ChargeItem[];
};

export const chargeSchema: Schema<Charge> = s.object<Charge>({
  visaId: s.string(),
  holdId: s.string(),
  description: s.string(),
  brandName: s.string(),
  items: s.optional(s.array(s.lazy(() => chargeItemSchema))),
});
