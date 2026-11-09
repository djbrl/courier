import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { decision1Schema, type Decision1 } from "./decision1.js";

export type Decide = {
  visaId: string;
  decision: Decision1;
};

export const decideSchema: Schema<Decide> = s.object<Decide>({
  visaId: s.string(),
  decision: decision1Schema,
});
