import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type TicketResult = {
  /** Send the person here to set the budget. */
  url?: string;
  /** The errand is already open. */
  issued?: boolean;
};

export const ticketResultSchema: Schema<TicketResult> = s.object<TicketResult>({
  url: s.optional(s.string()),
  issued: s.optional(s.boolean()),
});
