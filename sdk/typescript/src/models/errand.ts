import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { bondSchema, type Bond } from "./bond.js";
import { errandStatusSchema, type ErrandStatus } from "./errand-status.js";

export type Errand = {
  id: string;
  status: ErrandStatus;
  /** The shop the errand is for. */
  resource: string;
  spentCents: number;
  spendLimitCents: number;
  perPurchaseLimitCents: number;
  remainingCents: number;
  expiresAt: Date;
  bond?: Bond | null;
};

export const errandSchema: Schema<Errand> = s.object<Errand>({
  id: s.string(),
  status: errandStatusSchema,
  resource: s.string(),
  spentCents: s.int(),
  spendLimitCents: s.int(),
  perPurchaseLimitCents: s.int(),
  remainingCents: s.int(),
  expiresAt: s.dateTime(),
  bond: s.optionalNullable(s.lazy(() => bondSchema)),
});
