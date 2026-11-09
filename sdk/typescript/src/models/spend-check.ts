import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { actionSchema, type Action } from "./action.js";
import { spendItemSchema, type SpendItem } from "./spend-item.js";

export type SpendCheck = {
  visaId: string;
  /** The token's subject: the person's pseudonym at this shop. */
  sub: string;
  /** This shop's resource URL (the token's audience). */
  resource: string;
  action: Action;
  items: SpendItem[];
  totalCents: number;
  /** The agent's own words. Untrusted: Courier only weighs it. */
  agentNote?: string;
  /** From an earlier decision that asked the person. */
  approvalId?: string;
};

export const spendCheckSchema: Schema<SpendCheck> = s.object<SpendCheck>({
  visaId: s.string(),
  sub: s.string(),
  resource: s.string(),
  action: actionSchema,
  items: s.array(s.lazy(() => spendItemSchema)),
  totalCents: s.int(),
  agentNote: s.optional(s.string()),
  approvalId: s.optional(s.string()),
});
