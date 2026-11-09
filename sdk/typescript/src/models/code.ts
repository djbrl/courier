import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

/** Why it was denied. */
export const Code = {
  UnknownVisa: "unknown_visa",
  VisaInactive: "visa_inactive",
  WrongMerchant: "wrong_merchant",
  SubjectMismatch: "subject_mismatch",
  InsufficientScope: "insufficient_scope",
  BadRequest: "bad_request",
  PerPurchaseLimit: "per_purchase_limit",
  SpendLimit: "spend_limit",
  HumanDenied: "human_denied",
  IntentDenied: "intent_denied",
} as const;
export type Code = (typeof Code)[keyof typeof Code] | (string & {});

export const codeSchema: EnumSchema<Code> = s.enumOf<Code>(Code);
