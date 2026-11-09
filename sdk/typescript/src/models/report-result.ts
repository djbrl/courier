import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { errandStatusSchema, type ErrandStatus } from "./errand-status.js";

export type ReportResult = {
  ok: boolean;
  status: ErrandStatus;
  bondOutcome: string;
};

export const reportResultSchema: Schema<ReportResult> = s.object<ReportResult>({
  ok: s.boolean(),
  status: errandStatusSchema,
  bondOutcome: s.string(),
});
