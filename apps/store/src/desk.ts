import { avatarFor, COURIER_COLORS, type CourierColor, findShop, JUNIPER, paypalFor } from "@courier/shared";
import type { RequestLogEntry } from "./auth.ts";
import { db, type Order } from "./db.ts";

/*
 * The shop desk's data: what a shop knows about the couriers that visit it, as flat rows for the dashboard. It holds
 * a courier's name and its pseudonym for this shop, never the person behind it: no name, email or PayPal ID.
 */

/** A stable colour for a courier the shop only knows by name. */
export function colorFor(name: string): CourierColor {
  const colors = Object.keys(COURIER_COLORS) as CourierColor[];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return colors[h % colors.length]!;
}

/** Enough of a pseudonym to tell couriers apart in a table; the whole one is no more useful to a person reading it. */
export const shortPseudonym = (sub: string | null | undefined) => (sub ? `${sub.slice(0, 14)}…` : null);

const PAYMENT = { simulated: "PayPal simulator", sandbox: "PayPal sandbox", live: "Live PayPal" } as const;
const STATUS: Record<Order["status"], string> = {
  awaiting_approval: "Waiting to pay",
  paid: "Paid",
  cancelled: "Cancelled",
  failed: "Failed",
};

export interface DeskOrder {
  orderId: string;
  courier: string;
  pseudonym: string;
  /** See DeskCourier.topCourier. */
  topCourier: string;
  color: CourierColor;
  avatar: string;
  shop: string;
  item: string;
  items: number;
  amount: number;
  status: string;
  paid: boolean;
  paidWith: "Saved PayPal" | "Approved link";
  askedPerson: boolean;
  verified: boolean;
  demo: boolean;
  payment: string;
  errand: string | null;
  spendLimit: number | null;
  perPurchaseLimit: number | null;
  pass: string;
  captureId: string | null;
  placedAt: string;
  paidAt: string | null;
}

export interface DeskDoorEntry {
  id: string;
  at: string;
  outcome: "Let in" | "Turned away";
  allowed: boolean;
  courier: string;
  pseudonym: string | null;
  action: string;
  reason: string;
  /** Repeated polls folded into one row. */
  count: number;
  demo: boolean;
}

export interface DeskCourier {
  courier: string;
  pseudonym: string;
  color: CourierColor;
  avatar: string;
  shop: string;
  orders: number;
  paidOrders: number;
  revenue: number;
  biggestOrder: number;
  askedPerson: number;
  turnedAway: number;
  lastSeen: string;
  /** 1 for the courier that brought the most money. */
  rank: number;
  /** The courier's name if it's among the top few, otherwise "Everyone else". */
  topCourier: string;
}

export interface Desk {
  generatedAt: string;
  sources: {
    orders: DeskOrder[];
    door: DeskDoorEntry[];
    couriers: DeskCourier[];
    /** Present only once the store keeps them: the dashboard adds a source for each that has rows. */
    shipments?: Record<string, string | number | boolean | null>[];
    refunds?: Record<string, string | number | boolean | null>[];
  };
}

const dollars = (cents: number | undefined | null) => (typeof cents === "number" ? cents / 100 : null);
const limit = (value: unknown) => {
  const n = Number((value as { value?: string } | undefined)?.value);
  return Number.isFinite(n) ? n : null;
};

export function deskOrder(order: Order): DeskOrder {
  const visa = (order.evidence.visa ?? {}) as {
    id?: string;
    intent?: string | null;
    spend_limit?: { value: string };
    per_purchase_limit?: { value: string };
  };
  const intent = order.evidence.intent as { model?: string } | null;
  return {
    orderId: order.id,
    courier: order.agent,
    pseudonym: shortPseudonym(order.sub)!,
    topCourier: order.agent,
    color: colorFor(order.agent),
    avatar: avatarFor(order.agent),
    shop: (findShop(order.shop) ?? JUNIPER).name,
    item: order.items.map((i) => i.title).join(", "),
    items: order.items.reduce((n, i) => n + i.quantity, 0),
    amount: order.totalCents / 100,
    status: STATUS[order.status],
    paid: order.status === "paid",
    paidWith: order.paidWith === "saved_paypal" ? "Saved PayPal" : "Approved link",
    // Courier records "human" as the deciding model when the person said yes to an off-ticket purchase.
    askedPerson: intent?.model === "human",
    verified: Boolean(order.evidence.humanVerified) && !order.simulated,
    demo: paypalFor(order).mode === "simulated",
    payment: PAYMENT[paypalFor(order).mode],
    errand: visa.intent?.trim() || null,
    spendLimit: limit(visa.spend_limit),
    perPurchaseLimit: limit(visa.per_purchase_limit),
    pass: visa.id ?? order.visaId,
    captureId: order.captureId ?? null,
    placedAt: order.createdAt,
    paidAt: order.paidAt ?? null,
  };
}

/* ---------------- the door ---------------- */

const ACTIONS: Record<string, string> = {
  search_catalog: "Browse",
  get_item: "Browse",
  hold_item: "Hold",
  request_purchase: "Purchase",
  order_status: "Order status",
  cancel_order: "Cancel",
  whoami: "Check-in",
  set_budget: "Budget",
  wait_for_budget: "Budget check",
};
/** Asked over and over by a courier waiting on something, so one row stands for a run of them. */
const POLLS = new Set(["Order status", "Check-in", "Browse", "Budget check"]);
const FOLD_WINDOW_MS = 15 * 60 * 1000;

const label = (tool: string) => ACTIONS[tool] ?? (tool.charAt(0).toUpperCase() + tool.slice(1)).replace(/_/g, " ");

/** Why a courier was turned away, in a few words a shopkeeper would use. */
export function refusalKind(entry: Pick<RequestLogEntry, "reason" | "code">): string {
  const { reason, code } = entry;
  if (code === "spend_limit" || code === "per_purchase_limit") return "Over budget";
  if (code === "wrong_merchant" || /different merchant/i.test(reason)) return "Wrong shop";
  if (code === "intent_denied")
    return /inject|override|ignore|pre-?approved|instruction/i.test(reason) ? "Injection attempt" : "Off the errand";
  if (code === "human_denied") return "Person said no";
  if (/^No ID/i.test(reason)) return "No ID";
  if (/forged|signature/i.test(reason)) return "Forged ID";
  if (/expired/i.test(reason)) return "Expired visa";
  if (/flood/i.test(reason)) return "Flooding";
  if (/reported/i.test(reason)) return "Reported";
  if (code === "visa_inactive" || /^(Visa|Connection) (revoked|suspended|ended|completed)/i.test(reason))
    return "Called back";
  if (/^Invalid token/i.test(reason)) return "Bad token";
  return "Not allowed";
}

/**
 * What happened at the door that a shop cares about: every refusal with its reason, and the tool calls that matter.
 * MCP housekeeping (initialize, notifications, tool lists) is dropped, and repeated polls fold into one row.
 */
export function doorLog(requests: RequestLogEntry[]): DeskDoorEntry[] {
  const out: DeskDoorEntry[] = [];
  const open = new Map<string, DeskDoorEntry>();
  for (const r of [...requests].sort((a, b) => a.at.localeCompare(b.at))) {
    const courier = r.agent ?? "No ID";
    if (r.outcome === "blocked") {
      // A refused spend was let through the door a moment earlier; the refusal replaces that row.
      let action = r.code ? "Purchase" : "Request";
      if (r.code) {
        const i = out.findLastIndex(
          (d) => d.allowed && d.pseudonym === shortPseudonym(r.sub) && Date.parse(r.at) - Date.parse(d.at) < 10_000,
        );
        if (i >= 0 && ["Purchase", "Hold"].includes(out[i]!.action) && out[i]!.count === 1) {
          action = out[i]!.action;
          open.delete(`${r.sub}|${action}`);
          out.splice(i, 1);
        }
      }
      out.push({
        id: r.id,
        at: r.at,
        outcome: "Turned away",
        allowed: false,
        courier,
        pseudonym: shortPseudonym(r.sub),
        action,
        reason: refusalKind(r),
        count: 1,
        demo: Boolean(r.demo),
      });
      continue;
    }
    const tool = /^tools\/call (.+)$/.exec(r.reason)?.[1];
    if (!tool) continue;
    const action = label(tool);
    const key = `${r.sub}|${action}`;
    const last = open.get(key);
    if (last && POLLS.has(action) && Date.parse(r.at) - Date.parse(last.at) < FOLD_WINDOW_MS) {
      last.count++;
      last.at = r.at;
      continue;
    }
    const entry: DeskDoorEntry = {
      id: r.id,
      at: r.at,
      outcome: "Let in",
      allowed: true,
      courier,
      pseudonym: shortPseudonym(r.sub),
      action,
      reason: "Valid ID",
      count: 1,
      demo: Boolean(r.demo),
    };
    open.set(key, entry);
    out.push(entry);
  }
  return out.sort((a, b) => b.at.localeCompare(a.at));
}

/* ---------------- per courier ---------------- */

function courierTotals(orders: DeskOrder[], door: DeskDoorEntry[], raw: Order[]): DeskCourier[] {
  const byPseudonym = new Map<string, DeskCourier>();
  const subOf = new Map(raw.map((o) => [o.id, o.sub]));
  for (const o of orders) {
    const key = subOf.get(o.orderId) ?? o.pseudonym;
    const c =
      byPseudonym.get(key) ??
      ({
        courier: o.courier,
        pseudonym: o.pseudonym,
        color: o.color,
        avatar: o.avatar,
        shop: o.shop,
        orders: 0,
        paidOrders: 0,
        revenue: 0,
        biggestOrder: 0,
        askedPerson: 0,
        turnedAway: 0,
        lastSeen: o.placedAt,
        rank: 0,
        topCourier: o.courier,
      } satisfies DeskCourier);
    c.orders++;
    if (o.paid) {
      c.paidOrders++;
      c.revenue = Math.round((c.revenue + o.amount) * 100) / 100;
      c.biggestOrder = Math.max(c.biggestOrder, o.amount);
    }
    if (o.askedPerson) c.askedPerson++;
    if (o.placedAt > c.lastSeen) c.lastSeen = o.placedAt;
    byPseudonym.set(key, c);
  }
  const byShort = new Map([...byPseudonym.values()].map((c) => [c.pseudonym, c]));
  for (const d of door) {
    const c = d.pseudonym ? byShort.get(d.pseudonym) : undefined;
    if (!c) continue;
    if (!d.allowed) c.turnedAway++;
    if (d.at > c.lastSeen) c.lastSeen = d.at;
  }
  return [...byPseudonym.values()].sort((a, b) => b.revenue - a.revenue);
}

/* ---------------- sources another part of the store may add ---------------- */

/**
 * Shipments and refunds are kept by the store once that work lands. Only these keys reach the desk, so a field added
 * there later (an address, say) never reaches a shop's dashboard by accident.
 */
const SAFE_KEYS = new Set([
  "id",
  "orderId",
  "shop",
  "status",
  "carrier",
  "reason",
  "createdAt",
  "updatedAt",
  "shippedAt",
  "deliveredAt",
  "refundedAt",
  "agent",
  "sub",
  "amountCents",
  "totalCents",
]);

function optionalSource(collection: string) {
  return db.list<Record<string, unknown>>(collection, undefined, 5000).map((doc) => {
    const row: Record<string, string | number | boolean | null> = {};
    for (const [key, value] of Object.entries(doc)) {
      if (!SAFE_KEYS.has(key) || (value !== null && typeof value === "object")) continue;
      if (key === "agent") row.courier = value as string;
      else if (key === "sub") row.pseudonym = shortPseudonym(value as string);
      else if (key === "shop") row.shop = findShop(value as string)?.name ?? (value as string);
      else if (key === "amountCents" || key === "totalCents") row.amount = dollars(value as number);
      else row[key] = value as string | number | boolean | null;
    }
    return row;
  });
}

/** How many couriers the charts name before folding the rest into one bar. */
const TOP_COURIERS = 8;
const OTHERS = "Everyone else";

export function deskSnapshot(): Desk {
  const raw = db.list<Order>("orders", undefined, 5000).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const orders = raw.map(deskOrder);
  const door = doorLog(db.list<RequestLogEntry>("requests", undefined, 3000));
  const couriers = courierTotals(orders, door, raw);
  // Charts group by this field, so a shop with dozens of couriers still gets a readable chart.
  couriers.forEach((c, i) => {
    c.rank = i + 1;
    c.topCourier = i < TOP_COURIERS ? c.courier : OTHERS;
  });
  const top = new Map(couriers.map((c) => [c.pseudonym, c.topCourier]));
  for (const o of orders) o.topCourier = top.get(o.pseudonym) ?? OTHERS;
  const sources: Desk["sources"] = { orders, door, couriers };
  for (const name of ["shipments", "refunds"] as const) {
    const rows = optionalSource(name);
    if (rows.length) sources[name] = rows;
  }
  return { generatedAt: new Date().toISOString(), sources };
}
