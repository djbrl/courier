import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type Ok = {
  ok: boolean;
  /** Nothing changed: it was already recorded. */
  skipped?: boolean;
};

export const okSchema: Schema<Ok> = s.object<Ok>({
  ok: s.boolean(),
  skipped: s.optional(s.boolean()),
});
