import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type TicketRequest = {
  /** What the agent says the errand is for. */
  purpose?: string;
  /** Suggested per-purchase limit, in whole dollars. */
  maxPerItem?: number;
  /** Suggested budget, in whole dollars. */
  maxTotal?: number;
  /** What the agent wants to buy costs, in whole dollars. */
  price?: number;
  /** Only a budget the person picked in their chat app's dialog. */
  budgetFromPerson?: number;
};

export const ticketRequestSchema: Schema<TicketRequest> = s.object<TicketRequest>({
  purpose: s.optional(s.string()),
  maxPerItem: s.optional(s.float64()),
  maxTotal: s.optional(s.float64()),
  price: s.optional(s.float64()),
  budgetFromPerson: s.optional(s.int()),
});
