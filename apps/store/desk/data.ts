/* The desk's data, as AG Studio sources. Field lists are fixed so the report and the clerk can rely on the names. */

export interface DeskJson {
  generatedAt: string;
  sources: Record<string, Record<string, unknown>[]>;
}

type Format = "textFormat" | "integerFormat" | "currencyFormat" | "booleanFormat" | "dateTimeFormat";
interface Field {
  id: string;
  name: string;
  format: Format;
  description?: string;
  formatOptions?: { format: string };
}

const money = (id: string, name: string, description?: string): Field => ({
  id,
  name,
  format: "currencyFormat",
  formatOptions: { format: "$#,##0.00" },
  description,
});
const text = (id: string, name: string, description?: string): Field => ({
  id,
  name,
  format: "textFormat",
  description,
});
const count = (id: string, name: string, description?: string): Field => ({
  id,
  name,
  format: "integerFormat",
  description,
});
const yes = (id: string, name: string, description?: string): Field => ({
  id,
  name,
  format: "booleanFormat",
  description,
});
const when = (id: string, name: string, description?: string): Field => ({
  id,
  name,
  format: "dateTimeFormat",
  description,
});
// Left visible: widgets only see the fields the data panel shows.
const look = (id: string, name: string): Field => text(id, name, "Used to draw the courier's ID card.");

const SOURCES: Record<string, { name: string; description: string; fields: Field[] }> = {
  orders: {
    name: "Orders",
    description: "Every order a courier placed at the shops, newest first.",
    fields: [
      text("orderId", "Order", "PayPal order id."),
      text("courier", "Courier", "The courier's name, as it introduced itself."),
      text("pseudonym", "Pseudonym", "Who sent the courier, as a pseudonym for this shop. Never the person's name."),
      text(
        "topCourier",
        "Top courier",
        "The courier's name if it's among the top eight by money paid, else 'Everyone else'.",
      ),
      text("shop", "Shop"),
      text("item", "Item"),
      count("items", "Items"),
      money("amount", "Amount", "The order's total in US dollars, paid or not."),
      money("revenue", "Revenue", "The order's total if it was paid, else 0."),
      text("status", "Status"),
      yes("paid", "Paid"),
      text(
        "paidWith",
        "Paid with",
        "'Saved PayPal' (charged straight away) or 'Approved link' (the person approved it at PayPal).",
      ),
      yes(
        "askedPerson",
        "Asked the person",
        "The courier asked its person before buying, because it was off the errand.",
      ),
      yes("verified", "Verified by PayPal", "The person behind the courier was verified by PayPal (sandbox)."),
      yes("demo", "Demo", "Paid at the PayPal simulator: no money moved."),
      text("payment", "Paid at", "PayPal simulator, PayPal sandbox or live PayPal."),
      text("errand", "Errand", "What the person sent the courier for, in their words."),
      money("spendLimit", "Errand budget"),
      money("perPurchaseLimit", "Per-purchase limit"),
      text("pass", "Pass", "The id of the courier's signed pass (visa)."),
      text("captureId", "Capture", "PayPal capture id, once paid."),
      when("placedAt", "Placed"),
      when("paidAt", "Paid at time"),
      look("color", "Colour"),
      look("avatar", "Face"),
    ],
  },
  door: {
    name: "Access log",
    description:
      "What agents asked for at the shop and whether they were let in. Protocol housekeeping is left out, and " +
      "repeated status checks are folded into one row with a count.",
    fields: [
      text("id", "Entry"),
      when("at", "When"),
      text("outcome", "Outcome", "'Let in' or 'Turned away'."),
      yes("allowed", "Let in"),
      count("turnedAway", "Turned away", "1 if this courier was turned away, else 0. Sum it to count refusals."),
      text("courier", "Courier", "'No ID' when the caller showed none."),
      text("pseudonym", "Pseudonym"),
      text("action", "Action", "Browse, Hold, Purchase, Order status, Cancel, Check-in, Budget or Request."),
      text(
        "reason",
        "Reason",
        "Why a courier was turned away (Over budget, Wrong shop, Expired visa, Injection attempt, Forged ID, No ID, " +
          "Flooding, Called back, Off the errand, Person said no, Reported, Bad token, Not allowed), or 'Valid ID'.",
      ),
      count("count", "Times", "How many requests this row stands for."),
      yes("demo", "Demo"),
    ],
  },
  couriers: {
    name: "Couriers",
    description: "One row per courier that ordered here, with its totals. Ranked by money paid.",
    fields: [
      text("courier", "Courier"),
      text("pseudonym", "Pseudonym"),
      text("topCourier", "Top courier"),
      count("rank", "Rank", "1 for the courier that paid the most."),
      text("shop", "First shop"),
      count("orders", "Orders"),
      count("paidOrders", "Paid orders"),
      money("revenue", "Revenue"),
      money("biggestOrder", "Biggest order"),
      count("askedPerson", "Times it asked the person"),
      count("turnedAway", "Times turned away"),
      when("lastSeen", "Last seen"),
      look("color", "Colour"),
      look("avatar", "Face"),
    ],
  },
};

/** Fields for a source the desk doesn't know yet (shipments, refunds), guessed from its rows. */
function inferred(rows: Record<string, unknown>[]): Field[] {
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  return keys.map((key) => {
    const sample = rows.find((r) => r[key] !== null && r[key] !== undefined)?.[key];
    const name = key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
    if (key === "amount") return money(key, name);
    if (typeof sample === "number") return count(key, name);
    if (typeof sample === "boolean") return yes(key, name);
    if (typeof sample === "string" && /At$/.test(key)) return when(key, name);
    return text(key, name);
  });
}

/** Studio's data definition. Rows are copied so a later poll never mutates what Studio holds. */
export function toStudioData(desk: DeskJson) {
  const sources = Object.entries(desk.sources)
    .filter(([id, rows]) => SOURCES[id] || rows.length)
    .map(([id, rows]) => {
      const known = SOURCES[id];
      const data = rows.map((row) =>
        id === "orders"
          ? { ...row, revenue: row.paid ? row.amount : 0 }
          : id === "door"
            ? { ...row, turnedAway: row.allowed ? 0 : 1 }
            : { ...row },
      );
      return {
        id,
        name: known?.name ?? id.charAt(0).toUpperCase() + id.slice(1),
        description: known?.description,
        fields: known?.fields ?? inferred(rows),
        data,
      };
    });
  return { sources };
}

/** Sources can't be added to a running Studio, so a new one (say, refunds) remounts it. */
export const sourceKey = (desk: DeskJson) =>
  Object.entries(desk.sources)
    .filter(([id, rows]) => SOURCES[id] || rows.length)
    .map(([id]) => id)
    .join(",");
