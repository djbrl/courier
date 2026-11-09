import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

export const Decision2 = {
  Full: "full",
  Partial: "partial",
  Decline: "decline",
} as const;
export type Decision2 = (typeof Decision2)[keyof typeof Decision2] | (string & {});

export const decision2Schema: EnumSchema<Decision2> = s.enumOf<Decision2>(Decision2);
