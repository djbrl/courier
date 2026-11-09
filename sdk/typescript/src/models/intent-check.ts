import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

/** Who decided: the limits in code, a model checking fit, or the person. */
export type IntentCheck = {
  model: string;
  reason: string;
  probability?: number;
  latencyMs?: number;
  decision?: string;
};

export const intentCheckSchema: Schema<IntentCheck> = s.object<IntentCheck>({
  model: s.string(),
  reason: s.string(),
  probability: s.optional(s.float64()),
  latencyMs: s.optional(s.int()),
  decision: s.optional(s.string()),
});
