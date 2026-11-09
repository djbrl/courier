import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { paidWithSchema, type PaidWith } from "./paid-with.js";

export type Commit = {
  visaId: string;
  holdId: string;
  orderId: string;
  amountCents: number;
  /** One line for the errand, e.g. "Bought a slipmat". */
  summary: string;
  paidWith?: PaidWith;
  merchantName?: string;
};

export const commitSchema: Schema<Commit> = s.object<Commit>({
  visaId: s.string(),
  holdId: s.string(),
  orderId: s.string(),
  amountCents: s.int(),
  summary: s.string(),
  paidWith: s.optional(s.lazy(() => paidWithSchema)),
  merchantName: s.optional(s.string()),
});
