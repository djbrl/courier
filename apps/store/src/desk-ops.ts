import { afterSaleOf, avatarFor, COURIER_COLORS, money, type Shop } from "@courier/shared";
import type { RequestLogEntry } from "./auth.ts";
import { forgetVisa, logRequest } from "./auth.ts";
import { deliveryView } from "./clerk.ts";
import { courierApi } from "./courier-api.ts";
import { type ClerkAction, db, type Order, type ReturnRecord, type Shipment } from "./db.ts";
import { colorFor, type DeskDoorEntry, doorLog, shortPseudonym } from "./desk.ts";

/*
 * One shop's back office: what needs the owner, its orders, parcels, door and couriers, as rows the desk's grids draw.
 * Money is formatted here in US English, so the desk reads the same in every browser. Couriers are known by name and
 * pseudonym only: nothing here is about the person behind one.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
/** An order nobody paid for this long is worth a look: the courier's budget is held until it's cancelled. */
const STALE_UNPAID_MS = 30 * 60 * 1000;
/** How far back the queue looks for things the clerk decided or the door caught. */
const RECENT_MS = 3 * DAY_MS;

const STATUS: Record<Order["status"], string> = {
  awaiting_approval: "Waiting to pay",
  paid: "Paid",
  cancelled: "Cancelled",
  failed: "Failed",
};

const inShop = (slug: string) => (o: { shop?: string }) => (o.shop ?? "juniper") === slug;

/* ---------------- what the owner dismissed or reported ---------------- */

interface Dismissed {
  id: string;
  at: string;
}
interface Reported {
  id: string;
  shop: string;
  at: string;
}

const dismissedKey = (slug: string, needId: string) => `${slug}:${needId}`;
const isDismissed = (slug: string, needId: string) =>
  Boolean(db.get<Dismissed>("desk_dismissed", dismissedKey(slug, needId)));
export const dismiss = (slug: string, needId: string) =>
  db.put<Dismissed>("desk_dismissed", dismissedKey(slug, needId), {
    id: dismissedKey(slug, needId),
    at: new Date().toISOString(),
  });
const isReported = (visaId: string | null | undefined) => Boolean(visaId && db.get<Reported>("desk_reports", visaId));

/**
 * Reports a courier's pass to Courier: it's suspended at every shop and its bond, if any, is claimed. The same call the
 * ledger's button always made.
 */
export async function reportCourier(
  visaId: string,
  shop: Shop,
  via: string,
): Promise<{ ok: boolean; outcome?: string }> {
  try {
    const result = await courierApi.reportCourier({
      visaId,
      reason: `Reported by ${shop.name} from its ${via}`,
      evidence: { via, shop: shop.slug },
    });
    forgetVisa(visaId);
    db.put<Reported>("desk_reports", visaId, { id: visaId, shop: shop.slug, at: new Date().toISOString() });
    logRequest({
      outcome: "blocked",
      reason: `Merchant reported visa · ${result.bondOutcome}`,
      status: 403,
      visaId,
      shop: shop.slug,
    });
    return { ok: true, outcome: result.bondOutcome };
  } catch (error) {
    console.warn("[desk] report failed", (error as Error).message);
    return { ok: false };
  }
}

/* ---------------- rows ---------------- */

export interface CourierFace {
  name: string;
  avatar: string;
  color: string;
}
/** What the page needs to draw a courier's portrait: its face and its card colour. */
const face = (name: string): CourierFace => ({
  name,
  avatar: avatarFor(name),
  color: COURIER_COLORS[colorFor(name)].ac,
});

export interface NeedRow {
  id: string;
  kind: "refund" | "unpaid" | "return" | "suspicious";
  /** A few words: what this is. */
  what: string;
  courier: CourierFace | null;
  pseudonym: string | null;
  item: string;
  amountCents: number | null;
  amount: string;
  /** Why it's here, in full. */
  why: string;
  at: string;
  ago: string;
  orderId: string | null;
  visaId: string | null;
  actionId: string | null;
  /** The buttons this row offers, in order; the first is the main one. */
  actions: ("confirm" | "decline" | "cancel" | "refund_rest" | "refund_all" | "ok" | "report" | "dismiss")[];
}

export interface OrderRow {
  orderId: string;
  courier: CourierFace;
  pseudonym: string;
  item: string;
  amountCents: number;
  amount: string;
  refunded: string;
  status: string;
  /** Where it is now: paid, on its way, delivered, refunded. */
  stage: string;
  placedAt: string;
  placed: string;
  errand: string | null;
  limits: string;
  verified: string;
  paidWith: string;
  captureId: string | null;
  visaId: string;
  reported: boolean;
  parcel: { carrier: string; tracking: string; steps: { label: string; done: boolean }[] } | null;
  returned: { decision: string; amount: string; note: string; reason: string; by: string } | null;
}

export interface ParcelRow {
  orderId: string;
  courier: CourierFace;
  item: string;
  carrier: string;
  tracking: string;
  step: string;
  delivered: boolean;
  shippedAt: string;
  shipped: string;
}

export interface DoorRow extends DeskDoorEntry {
  face: CourierFace | null;
  ago: string;
  when: string;
  /** The reason as Courier or the door gave it, in full. */
  detail: string;
  /** The pass it showed, if any, so the owner can report it. */
  visaId: string | null;
  reported: boolean;
}

export interface ReasonRow {
  reason: string;
  count: number;
  last: string;
  lastAgo: string;
  lastCourier: string;
}

export interface CourierRow {
  courier: CourierFace;
  pseudonym: string;
  visaIds: string[];
  orders: number;
  paidCents: number;
  paid: string;
  refunds: number;
  turnedAway: number;
  lastSeen: string;
  lastAgo: string;
  standing: "Good" | "Reported" | "Turned away";
}

export interface ShopDesk {
  shop: { slug: string; name: string; sells: string; tile: string };
  generatedAt: string;
  counts: {
    needs: number;
    paidToday: string;
    paidWeek: string;
    ordersToday: number;
    turnedAwayToday: number;
    parcels: number;
  };
  /** What couriers paid on each of the last seven days, oldest first, for the trend under today's total. */
  week: { day: string; cents: number; amount: string }[];
  needs: NeedRow[];
  orders: OrderRow[];
  parcels: ParcelRow[];
  door: DoorRow[];
  reasons: ReasonRow[];
  couriers: CourierRow[];
  policy: { returns: string; delivery: string };
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const ago = (iso: string) => {
  const s = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < DAY_MS / 1000) return `${Math.round(s / 3600)} h ago`;
  const d = Math.round(s / 86400);
  return d === 1 ? "yesterday" : `${d} days ago`;
};

const limitOf = (value: unknown) => {
  const n = Number((value as { value?: string } | undefined)?.value);
  return Number.isFinite(n) ? `$${n.toFixed(2).replace(/\.00$/, "")}` : null;
};

const itemsOf = (o: Order) => o.items.map((i) => (i.quantity > 1 ? `${i.quantity} × ${i.title}` : i.title)).join(", ");

function orderRow(o: Order, ret: ReturnRecord | undefined): OrderRow {
  const visa = (o.evidence.visa ?? {}) as {
    id?: string;
    intent?: string | null;
    spend_limit?: unknown;
    per_purchase_limit?: unknown;
  };
  const delivery = o.status === "paid" ? deliveryView(o) : null;
  const refunded = o.refundedCents ?? 0;
  const stage =
    o.status !== "paid"
      ? STATUS[o.status]
      : refunded >= o.totalCents
        ? "Refunded"
        : refunded > 0
          ? "Part refunded"
          : delivery
            ? delivery.status
            : "Paid";
  const total = limitOf(visa.spend_limit);
  const each = limitOf(visa.per_purchase_limit);
  return {
    orderId: o.id,
    courier: face(o.agent),
    pseudonym: shortPseudonym(o.sub)!,
    item: itemsOf(o),
    amountCents: o.totalCents,
    amount: money(o.totalCents),
    refunded: refunded ? money(refunded) : "",
    status: STATUS[o.status],
    stage,
    placedAt: o.createdAt,
    placed: when(o.createdAt),
    errand: visa.intent?.trim() || null,
    limits: [total && `${total} in total`, each && `${each} each`].filter(Boolean).join(" · ") || "Not given",
    verified: o.simulated
      ? "Demo person (simulated PayPal)"
      : o.evidence.humanVerified
        ? "A real person, verified by PayPal"
        : "Not verified",
    paidWith: o.status !== "paid" ? "" : o.paidWith === "saved_paypal" ? "Saved PayPal" : "PayPal checkout",
    captureId: o.captureId ?? null,
    visaId: visa.id ?? o.visaId,
    reported: isReported(visa.id ?? o.visaId),
    parcel: delivery ? { carrier: delivery.carrier, tracking: delivery.tracking_number, steps: delivery.steps } : null,
    returned: ret
      ? {
          decision:
            ret.decision === "decline" ? "Declined" : ret.decision === "full" ? "Full refund" : "Partial refund",
          amount: money(ret.amountCents),
          note: ret.note,
          reason: ret.reason,
          by: ret.by === "owner" ? "You" : ret.decidedBy === "rules" ? "The clerk (written rules)" : "The clerk",
        }
      : null,
  };
}

/** Everything one shop's desk shows. */
export function shopDesk(shop: Shop): ShopDesk {
  const now = Date.now();
  const raw = db.list<Order>("orders", inShop(shop.slug), 5000).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const returns = new Map(db.list<ReturnRecord>("returns", inShop(shop.slug), 5000).map((r) => [r.orderId, r]));
  const orders = raw.map((o) => orderRow(o, returns.get(o.id)));
  const byId = new Map(raw.map((o) => [o.id, o]));

  // Older door entries carry no shop: they were all Juniper Records', the first shop.
  const requests = db.list<RequestLogEntry>("requests", (r) => (r.shop ?? "juniper") === shop.slug, 5000);
  const visaOf = new Map(requests.flatMap((r) => (r.visaId ? [[r.id, r.visaId] as const] : [])));
  const detailOf = new Map(requests.map((r) => [r.id, r.reason]));
  // A visa the door itself reported for flooding is as reported as one the owner reported here.
  const doorReported = new Set(
    requests.flatMap((r) =>
      r.visaId && r.outcome === "blocked" && /^(Agent|Merchant) reported/.test(r.reason) ? [r.visaId] : [],
    ),
  );
  const door: DoorRow[] = doorLog(requests).map((d) => ({
    ...d,
    face: d.courier === "No ID" ? null : face(d.courier),
    ago: ago(d.at),
    when: when(d.at),
    detail: d.allowed ? (d.count > 1 ? `${d.count} times` : "") : (detailOf.get(d.id) ?? d.reason),
    visaId: visaOf.get(d.id) ?? null,
    reported: isReported(visaOf.get(d.id)) || doorReported.has(visaOf.get(d.id) ?? ""),
  }));

  /* ---- what needs the owner ---- */
  const needs: NeedRow[] = [];
  for (const a of db.list<ClerkAction>("clerk_actions", (a) => a.status === "proposed", 500)) {
    const o = byId.get(a.orderId);
    if (!o || Date.parse(a.expiresAt) < now) continue;
    needs.push({
      id: a.id,
      kind: "refund",
      what: "Refund to confirm",
      courier: face(o.agent),
      pseudonym: shortPseudonym(o.sub),
      item: itemsOf(o),
      amountCents: a.amountCents,
      amount: money(a.amountCents),
      why: `The clerk proposes refunding ${money(a.amountCents)}: “${a.note}”. Nothing moves until you confirm.`,
      at: a.createdAt,
      ago: ago(a.createdAt),
      orderId: o.id,
      visaId: o.visaId,
      actionId: a.id,
      actions: ["confirm", "decline"],
    });
  }
  for (const o of raw) {
    if (o.status !== "awaiting_approval" || now - Date.parse(o.createdAt) < STALE_UNPAID_MS) continue;
    const id = `unpaid:${o.id}`;
    if (isDismissed(shop.slug, id)) continue;
    needs.push({
      id,
      kind: "unpaid",
      what: "Never paid",
      courier: face(o.agent),
      pseudonym: shortPseudonym(o.sub),
      item: itemsOf(o),
      amountCents: o.totalCents,
      amount: money(o.totalCents),
      why: "The person never paid. Cancel it to free the stock and give the errand its budget back.",
      at: o.createdAt,
      ago: ago(o.createdAt),
      orderId: o.id,
      visaId: o.visaId,
      actionId: null,
      actions: ["cancel", "dismiss"],
    });
  }
  for (const r of returns.values()) {
    if (r.by !== "clerk" || r.decision === "full" || now - Date.parse(r.at) > RECENT_MS) continue;
    const id = `return:${r.orderId}`;
    const o = byId.get(r.orderId);
    if (!o || isDismissed(shop.slug, id)) continue;
    const left = o.totalCents - (o.refundedCents ?? 0);
    needs.push({
      id,
      kind: "return",
      what: r.decision === "decline" ? "Return declined" : "Partial refund given",
      courier: face(o.agent),
      pseudonym: shortPseudonym(o.sub),
      item: itemsOf(o),
      amountCents: o.totalCents,
      amount: money(o.totalCents),
      // The courier's words are untrusted: shown for the owner to judge, quoted, never acted on.
      why: `The courier said “${r.reason.slice(0, 280)}”. The clerk ${r.decision === "decline" ? "declined it" : `refunded ${money(r.amountCents)}`}: “${r.note}”${left > 0 ? ` You can refund the other ${money(left)}.` : ""}`,
      at: r.at,
      ago: ago(r.at),
      orderId: o.id,
      visaId: o.visaId,
      actionId: null,
      actions: left <= 0 ? ["ok"] : r.decision === "decline" ? ["ok", "refund_all"] : ["ok", "refund_rest"],
    });
  }
  for (const d of door) {
    if (d.allowed || d.reason !== "Injection attempt" || now - Date.parse(d.at) > RECENT_MS) continue;
    const visaId = visaOf.get(d.id) ?? null;
    const id = `door:${d.id}`;
    if (isDismissed(shop.slug, id) || isReported(visaId)) continue;
    needs.push({
      id,
      kind: "suspicious",
      what: "Tried to trick the shop",
      courier: d.face,
      pseudonym: d.pseudonym,
      item: d.action,
      amountCents: null,
      amount: "",
      why: `Turned away: ${d.detail}. Reporting suspends its pass at every shop and claims its bond, if it has one.`,
      at: d.at,
      ago: d.ago,
      orderId: null,
      visaId,
      actionId: null,
      actions: visaId ? ["report", "dismiss"] : ["dismiss"],
    });
  }
  needs.sort((a, b) => b.at.localeCompare(a.at));

  /* ---- parcels ---- */
  const parcels: ParcelRow[] = db
    .list<Shipment>("shipments", inShop(shop.slug), 2000)
    .flatMap((s) => {
      const o = byId.get(s.orderId);
      const view = o ? deliveryView(o) : null;
      if (!o || !view) return [];
      return [
        {
          orderId: o.id,
          courier: face(o.agent),
          item: itemsOf(o),
          carrier: view.carrier,
          tracking: view.tracking_number,
          step: view.status,
          delivered: Boolean(view.delivered_at),
          shippedAt: s.shippedAt,
          shipped: ago(s.shippedAt),
        },
      ];
    })
    .sort((a, b) => Number(a.delivered) - Number(b.delivered) || b.shippedAt.localeCompare(a.shippedAt));

  /* ---- why couriers were turned away ---- */
  const reasons = new Map<string, ReasonRow>();
  for (const d of door) {
    if (d.allowed) continue;
    const r = reasons.get(d.reason) ?? {
      reason: d.reason,
      count: 0,
      last: d.at,
      lastAgo: d.ago,
      lastCourier: d.courier,
    };
    r.count++;
    if (d.at >= r.last) Object.assign(r, { last: d.at, lastAgo: d.ago, lastCourier: d.courier });
    reasons.set(d.reason, r);
  }

  /* ---- couriers ---- */
  const couriers = new Map<string, CourierRow>();
  const touch = (pseudonym: string | null, name: string, at: string) => {
    if (!pseudonym) return null;
    const c =
      couriers.get(pseudonym) ??
      ({
        courier: face(name),
        pseudonym,
        visaIds: [],
        orders: 0,
        paidCents: 0,
        paid: "",
        refunds: 0,
        turnedAway: 0,
        lastSeen: at,
        lastAgo: "",
        standing: "Good",
      } satisfies CourierRow);
    if (at > c.lastSeen) c.lastSeen = at;
    couriers.set(pseudonym, c);
    return c;
  };
  for (const o of raw) {
    const c = touch(shortPseudonym(o.sub), o.agent, o.createdAt)!;
    c.orders++;
    if (o.status === "paid") c.paidCents += o.totalCents - (o.refundedCents ?? 0);
    if (returns.get(o.id) && returns.get(o.id)!.decision !== "decline") c.refunds++;
    if (!c.visaIds.includes(o.visaId)) c.visaIds.push(o.visaId);
  }
  const autoReported = new Set<string>();
  for (const d of door) {
    if (d.courier === "No ID") continue;
    const c = touch(d.pseudonym, d.courier, d.at);
    if (!c) continue;
    if (!d.allowed) c.turnedAway++;
    // Reported by this shop's door itself (flooding) or by an owner: either way its pass is suspended.
    if (!d.allowed && (d.reason === "Flooding" || d.reason === "Reported")) autoReported.add(c.pseudonym);
    const v = visaOf.get(d.id);
    if (v && !c.visaIds.includes(v)) c.visaIds.push(v);
  }
  for (const c of couriers.values()) {
    c.paid = money(c.paidCents);
    c.lastAgo = ago(c.lastSeen);
    c.standing =
      c.visaIds.some(isReported) || autoReported.has(c.pseudonym)
        ? "Reported"
        : c.turnedAway > 0 && c.orders === 0
          ? "Turned away"
          : "Good";
  }

  const today = (iso: string) => now - Date.parse(iso) < DAY_MS;
  const policy = afterSaleOf(shop.slug);
  const paid = raw.filter((o) => o.status === "paid");
  const week = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (6 - i));
    const from = start.getTime();
    const cents = paid
      .filter((o) => {
        const at = Date.parse(o.paidAt ?? o.createdAt);
        return at >= from && at < from + DAY_MS;
      })
      .reduce((sum, o) => sum + o.totalCents, 0);
    return { day: start.toLocaleDateString("en-US", { weekday: "short" }), cents, amount: money(cents) };
  });
  return {
    shop: { slug: shop.slug, name: shop.name, sells: shop.sells, tile: shop.tile },
    generatedAt: new Date().toISOString(),
    counts: {
      needs: needs.length,
      paidToday: money(
        raw.filter((o) => o.status === "paid" && today(o.paidAt ?? o.createdAt)).reduce((s, o) => s + o.totalCents, 0),
      ),
      paidWeek: money(week.reduce((sum, d) => sum + d.cents, 0)),
      ordersToday: raw.filter((o) => today(o.createdAt)).length,
      turnedAwayToday: door.filter((d) => !d.allowed && today(d.at)).length,
      parcels: parcels.filter((p) => !p.delivered).length,
    },
    week,
    needs,
    orders,
    parcels,
    door,
    reasons: [...reasons.values()].sort((a, b) => b.count - a.count),
    couriers: [...couriers.values()].sort((a, b) => b.paidCents - a.paidCents || b.lastSeen.localeCompare(a.lastSeen)),
    policy: {
      returns: policy.returns,
      delivery:
        policy.delivery === "post"
          ? `Posted with ${policy.carrier}, tracked on the PayPal payment`
          : policy.delivery === "rider"
            ? "Delivered by the shop's own riders"
            : "Nothing ships: it's delivered on purchase",
    },
  };
}
