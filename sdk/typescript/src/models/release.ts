import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type Release = {
  holdId: string;
};

export const releaseSchema: Schema<Release> = s.object<Release>({
  holdId: s.string(),
});
