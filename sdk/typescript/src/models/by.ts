import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

export const By = {
  Clerk: "clerk",
  Owner: "owner",
} as const;
export type By = (typeof By)[keyof typeof By] | (string & {});

export const bySchema: EnumSchema<By> = s.enumOf<By>(By);
