import { createHash } from "node:crypto";
import type { RequestLogEntry } from "./auth.ts";
import { shelfOf } from "./catalog.ts";
import { db, type Order, type ReturnRecord, type Shipment } from "./db.ts";

/*
 * Sample activity for the demo's default shop, so an owner who signs in for the first time sees a shop that's been
 * trading rather than an empty desk. Every record is marked `sample`: the desk tags it, its buttons refuse it, and
 * nothing about it reaches Courier or PayPal. It's dated relative to today and rewritten each day, so "today" always
 * has something in it. Real orders from the demo land in the same tables beside it.
 */

export const SAMPLE_SHOP = "floor-dash";
const DAY_MS = 86_400_000;
const DAYS = 14;

/** Made-up couriers. Their pseudonyms are invented too: no person stands behind them. */
const COURIERS = ["Juno", "Otto", "Mika", "Bea", "Nova", "Kit", "Ziggy", "Pip"];

/** The same numbers every time for a given day, so a refresh doesn't reshuffle the shop. */
function dice(seed: string) {
  let n = 0;
  return () => {
    const h = createHash("sha256").update(`${seed}:${n++}`).digest();
    return h.readUInt32BE(0) / 2 ** 32;
  };
}

export const isSample = (row: { sample?: boolean } | undefined | null) => Boolean(row?.sample);
export const isSampleVisa = (visaId: string | null | undefined) => Boolean(visaId?.startsWith("sample_"));

const collections = ["orders", "shipments", "returns", "requests"] as const;

/** Rewrites the sample for today, once a day. Cheap to call often. */
export function refreshSample(now = Date.now()): void {
  const day = new Date(now).toISOString().slice(0, 10);
  const marker = db.get<{ day: string }>("sample_meta", SAMPLE_SHOP);
  if (marker?.day === day) return;
  for (const c of collections) db.deleteWhere<{ sample?: boolean }>(c, (r) => r.sample === true);
  write(day, now);
  db.put("sample_meta", SAMPLE_SHOP, { day });
}

function write(day: string, now: number): void {
  const roll = dice(`${SAMPLE_SHOP}:${day}`);
  const pick = <T>(list: readonly T[]) => list[Math.floor(roll() * list.length)]!;
  const menu = shelfOf(SAMPLE_SHOP);
  if (!menu.length) return;
  const sub = (name: string) => `pp_${createHash("sha256").update(`sample:${name}`).digest("base64url").slice(0, 22)}`;
  const visa = (name: string, n: number) => `sample_${name.toLowerCase()}_${n}`;
  const at = (ms: number) => new Date(ms).toISOString();
  // Midnight today, local: the desk counts "today" from here.
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const sinceMidnight = Math.max(30 * 60_000, now - midnight.getTime());

  let n = 0;
  for (let d = DAYS - 1; d >= 0; d--) {
    // Busier lately, and never fewer than four orders today.
    const count = d === 0 ? 4 + Math.floor(roll() * 3) : 1 + Math.floor(roll() * (d < 7 ? 5 : 3));
    for (let k = 0; k < count; k++) {
      const name = pick(COURIERS);
      const placed =
        d === 0 ? now - Math.floor(roll() * sinceMidnight * 0.95) : midnight.getTime() - d * DAY_MS + roll() * DAY_MS;
      const lines = Array.from({ length: 1 + Math.floor(roll() * 2) }, () => pick(menu));
      const items = lines.map((i) => ({ id: i.id, title: i.title, priceCents: i.priceCents, quantity: 1 }));
      const total = items.reduce((s, i) => s + i.priceCents, 0);
      const id = `SAMPLE-${day.replace(/-/g, "")}-${String(++n).padStart(3, "0")}`;
      const visaId = visa(name, Math.floor(roll() * 3));
      const unpaid = d === 0 && k === 0;
      const order: Order & { sample: true } = {
        id,
        shop: SAMPLE_SHOP,
        visaId,
        sub: sub(name),
        agent: name,
        holdId: `sample_hold_${n}`,
        items,
        totalCents: total,
        status: unpaid ? "awaiting_approval" : "paid",
        approveUrl: null,
        paidWith: roll() < 0.6 ? "saved_paypal" : "paypal_page",
        captureId: unpaid ? null : `SAMPLE-CAPTURE-${n}`,
        createdAt: at(placed),
        paidAt: unpaid ? null : at(placed + 40_000),
        simulated: true,
        evidence: {
          visa: {
            id: visaId,
            intent: pick(["Dinner for two", "Lunch at my desk", "Something quick tonight", "Burgers for the flat"]),
            spend_limit: { value: String(40 + Math.floor(roll() * 4) * 10) },
            per_purchase_limit: { value: "40" },
          },
          intent: null,
          tokenJti: `sample_${n}`,
          humanVerified: true,
        },
        sample: true,
      };
      db.put("orders", id, order);
      if (!unpaid) {
        // Older orders were delivered; today's are somewhere on the road.
        const stage = d > 0 ? 3 : Math.min(3, Math.floor(roll() * 4));
        db.put<Shipment & { sample: true; sampleStage: number }>("shipments", id, {
          id,
          orderId: id,
          shop: SAMPLE_SHOP,
          visaId,
          carrier: "RIDER",
          carrierName: "Floor Dash rider",
          trackingNumber: `FL-${id.slice(-6)}`,
          captureId: order.captureId ?? null,
          shippedAt: at(placed + 120_000),
          told: 3,
          ...(stage === 3 ? { deliveredAt: at(placed + 35 * 60_000) } : {}),
          paypal: null,
          simulated: true,
          sample: true,
          sampleStage: stage,
        });
      }
      // Every courier knocks before it buys: a browse, then the purchase.
      for (const [tool, offset] of [
        ["search_catalog", -90_000],
        ["request_purchase", 0],
      ] as const) {
        db.put<RequestLogEntry & { sample: true }>("requests", `sample_req_${n}_${tool}`, {
          id: `sample_req_${n}_${tool}`,
          at: at(placed + offset),
          outcome: "accepted",
          reason: `tools/call ${tool}`,
          status: 200,
          sub: sub(name),
          visaId,
          agent: name,
          method: "tools/call",
          demo: true,
          shop: SAMPLE_SHOP,
          sample: true,
        });
      }
      // Now and then something comes back.
      if (d > 1 && d < 9 && roll() < 0.12) {
        const full = roll() < 0.6;
        const refund: ReturnRecord & { sample: true } = {
          id,
          orderId: id,
          shop: SAMPLE_SHOP,
          reason: full ? "The fries were missing from the bag." : "It arrived cold, an hour late.",
          decision: full ? "full" : "decline",
          amountCents: full ? total : 0,
          note: full ? "Sorry about that. We've refunded the order." : "Food can't come back once it's delivered.",
          by: "clerk",
          decidedBy: "rules",
          paypalMode: "simulated",
          at: at(placed + 3 * 3_600_000),
          sample: true,
        };
        db.put("returns", id, refund);
        if (full) db.put("orders", id, { ...order, refundedCents: total });
      }
    }
  }

  // Agents that didn't get in, and why.
  const refusals: [string | null, string, string | null][] = [
    [null, "No ID: no Courier token on the request", null],
    [null, "No ID: no Courier token on the request", null],
    [null, "Invalid token: signature verification failed (forged)", null],
    ["Ziggy", "$64.00 is over the remaining visa budget of $40.00.", "spend_limit"],
    ["Pip", "Visa revoked by the person", "visa_inactive"],
    [null, "No ID: no Courier token on the request", null],
    ["Kit", "The errand was for dinner; a cordless drill isn't it.", "intent_denied"],
  ];
  refusals.forEach(([name, reason, code], i) => {
    const when = i < 2 ? now - roll() * sinceMidnight : now - (1 + roll() * (DAYS - 2)) * DAY_MS;
    db.put<RequestLogEntry & { sample: true }>("requests", `sample_refused_${i}`, {
      id: `sample_refused_${i}`,
      at: at(when),
      outcome: "blocked",
      reason,
      code,
      status: code ? 403 : 401,
      sub: name ? sub(name) : null,
      visaId: name ? visa(name, 9) : null,
      agent: name,
      demo: true,
      shop: SAMPLE_SHOP,
      sample: true,
    });
  });
}
