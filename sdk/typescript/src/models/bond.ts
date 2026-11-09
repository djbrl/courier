import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { statusSchema, type Status } from "./status.js";

/** Money the person put down so the courier could act without asking. */
export type Bond = {
  amountCents: number;
  orderId?: string;
  authorizationId?: string | null;
  status: Status;
};

export const bondSchema: Schema<Bond> = s.object<Bond>({
  amountCents: s.int(),
  orderId: s.optional(s.string()),
  authorizationId: s.optionalNullable(s.string()),
  status: statusSchema,
});
