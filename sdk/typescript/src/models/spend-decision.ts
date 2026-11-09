import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { codeSchema, type Code } from "./code.js";
import { decisionSchema, type Decision } from "./decision.js";
import { intentCheckSchema, type IntentCheck } from "./intent-check.js";

export type SpendDecision = {
  decision: Decision;
  reason: string;
  /** Why it was denied. */
  code?: Code;
  /** The budget held for this checkout, for 30 minutes. */
  holdId?: string | null;
  approvalId?: string;
  /** Where the person answers. */
  approvalUrl?: string;
  /** Who decided: the limits in code, a model checking fit, or the person. */
  intent?: IntentCheck;
  remainingCents?: number;
  /** The errand has saved PayPal: charge it with chargeSavedPaypal. */
  autopay?: boolean;
  model?: string;
  modelCalled?: boolean;
};

export const spendDecisionSchema: Schema<SpendDecision> = s.object<SpendDecision>({
  decision: decisionSchema,
  reason: s.string(),
  code: s.optional(s.lazy(() => codeSchema)),
  holdId: s.optionalNullable(s.string()),
  approvalId: s.optional(s.string()),
  approvalUrl: s.optional(s.string()),
  intent: s.optional(s.lazy(() => intentCheckSchema)),
  remainingCents: s.optional(s.int()),
  autopay: s.optional(s.boolean()),
  model: s.optional(s.string()),
  modelCalled: s.optional(s.boolean()),
});
