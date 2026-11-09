import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type CommitResult = {
  ok: boolean;
  spentCents: number;
  remainingCents: number;
};

export const commitResultSchema: Schema<CommitResult> = s.object<CommitResult>({
  ok: s.boolean(),
  spentCents: s.int(),
  remainingCents: s.int(),
});
