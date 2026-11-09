import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { status1Schema, type Status1 } from "./status1.js";

export type Connection = {
  status: Status1;
  /** The courier's name. */
  agent: string;
  /** The current errand as a signed token valid for 60 seconds, or null between errands. */
  ticketToken?: string | null;
};

export const connectionSchema: Schema<Connection> = s.object<Connection>({
  status: status1Schema,
  agent: s.string(),
  ticketToken: s.optionalNullable(s.string()),
});
