import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

export const ErrandStatus = {
  PendingPaypal: "pending_paypal",
  PendingBond: "pending_bond",
  Active: "active",
  Revoked: "revoked",
  Expired: "expired",
  Suspended: "suspended",
} as const;
export type ErrandStatus = (typeof ErrandStatus)[keyof typeof ErrandStatus] | (string & {});

export const errandStatusSchema: EnumSchema<ErrandStatus> = s.enumOf<ErrandStatus>(ErrandStatus);
