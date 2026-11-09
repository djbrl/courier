import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type SpendItem = {
  title: string;
  category: string;
  priceCents: number;
  /** @default 1 */
  quantity?: number;
};

export const spendItemSchema: Schema<SpendItem> = s.object<SpendItem>({
  title: s.string(),
  category: s.string(),
  priceCents: s.int(),
  quantity: s.defaulted(s.int(), 1),
});
