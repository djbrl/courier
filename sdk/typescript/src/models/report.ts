import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type Report = {
  visaId: string;
  reason: string;
  evidence?: Record<string, unknown>;
};

export const reportSchema: Schema<Report> = s.object<Report>({
  visaId: s.string(),
  reason: s.string(),
  evidence: s.optional(s.record(s.string(), s.unknown())),
});
