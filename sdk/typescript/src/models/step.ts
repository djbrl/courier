import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type Step = {
  visaId: string;
  /** e.g. browse, reserve, shipping. */
  kind: string;
  title: string;
  detail?: string;
  merchantName?: string;
};

export const stepSchema: Schema<Step> = s.object<Step>({
  visaId: s.string(),
  kind: s.string(),
  title: s.string(),
  detail: s.optional(s.string()),
  merchantName: s.optional(s.string()),
});
