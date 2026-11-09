import { randomInt } from "node:crypto";
import { config, findShop, JUNIPER, MONEY } from "@courier/shared";
import { afterSaleOf } from "./catalog.ts";
import { courierApi } from "./courier-api.ts";
import { db, type Order, type Shipment, STAGES } from "./db.ts";
import { toolkitFor } from "./toolkit.ts";

/**
 * Once an order is paid the shop ships it: the clerk adds the tracking number to the PayPal payment with the Agent
 * Toolkit's create_shipment_tracking, and closes it as delivered with update_shipment_tracking. Between the two the
 * parcel moves on a clock (SHIPPING_STEP_SECONDS a step), and Courier hears about each step.
 */

const LABELS: Record<"post" | "rider", string[]> = {
  post: ["Label created", "In transit", "Out for delivery", "Delivered"],
  rider: ["Being made ready", "Picked up", "Nearly there", "Delivered"],
};

export const stageLabels = (s: Pick<Shipment, "carrier">) => LABELS[s.carrier === "RIDER" ? "rider" : "post"];

/** Where a parcel is now, from the time it left. */
export function stageOf(s: Shipment, now = Date.now()): number {
  if (s.sampleStage !== undefined) return s.sampleStage;
  if (s.deliveredAt) return STAGES.length - 1;
  return Math.max(0, Math.min(STAGES.length - 1, Math.floor((now - Date.parse(s.shippedAt)) / config.shipping.stepMs)));
}

export const expectedAt = (s: Shipment) =>
  new Date(Date.parse(s.shippedAt) + (STAGES.length - 1) * config.shipping.stepMs).toISOString();

const digits = (n: number) => Array.from({ length: n }, () => randomInt(10)).join("");
const letters = (n: number) =>
  Array.from({ length: n }, () => "ABCDEFGHJKLMNPRSTVWXYZ0123456789"[randomInt(32)]).join("");

/** A made-up number in the carrier's own format. */
function trackingNumber(carrier: string, shop: string): string {
  if (carrier === "USPS") return `9400${digits(18)}`;
  if (carrier === "UPS") return `1Z${letters(6)}03${digits(8)}`;
  if (carrier === "FEDEX") return digits(12);
  if (carrier === "DHL") return digits(10);
  return `${shop.slice(0, 2).toUpperCase()}-${letters(6)}`;
}

const CARRIER_NAMES: Record<string, string> = { USPS: "USPS", UPS: "UPS", FEDEX: "FedEx", DHL: "DHL" };

/** What Courier is told about a parcel. No personal data: the order, the carrier, the step. */
async function tell(s: Shipment, stage: number): Promise<void> {
  await courierApi
    .updateParcel({
      visaId: s.visaId,
      orderId: s.orderId,
      merchantName: (findShop(s.shop) ?? JUNIPER).name,
      carrierName: s.carrierName,
      trackingNumber: s.trackingNumber,
      stage,
      labels: stageLabels(s),
      expectedAt: expectedAt(s),
      paypal: s.paypal && "status" in s.paypal ? MONEY[s.paypal.mode as keyof typeof MONEY]?.name : null,
      simulated: Boolean(s.simulated),
    })
    .catch((e) => console.warn("[shipping] couldn't tell Courier", (e as Error).message));
}

/**
 * Ships a paid order, once. The record is written before PayPal is called, so a courier asking straight away already
 * sees a label; the tracker follows.
 */
export async function ship(order: Order, parcel?: string): Promise<Shipment | null> {
  const policy = afterSaleOf(order.shop);
  if (policy.delivery === "none" || order.status !== "paid") return null;
  const existing = db.get<Shipment>("shipments", order.id);
  if (existing) return existing;
  const carrier = policy.delivery === "post" ? policy.carrier! : "RIDER";
  const shop = findShop(order.shop) ?? JUNIPER;
  let s: Shipment = db.put<Shipment>("shipments", order.id, {
    id: order.id,
    orderId: order.id,
    shop: shop.slug,
    visaId: order.visaId,
    carrier,
    carrierName: CARRIER_NAMES[carrier] ?? `${shop.name} rider`,
    trackingNumber: parcel ?? trackingNumber(carrier, shop.slug),
    captureId: order.captureId ?? null,
    shippedAt: new Date().toISOString(),
    told: 0,
    paypal: null,
    ...(order.simulated ? { simulated: true } : {}),
  });
  const kit = carrier !== "RIDER" && s.captureId ? toolkitFor(order) : null;
  if (kit) {
    const added = await kit.run("create_shipment_tracking", {
      transaction_id: s.captureId,
      tracking_number: s.trackingNumber,
      status: "SHIPPED",
      carrier,
    });
    if (!added.ok) console.warn(`[shipping] PayPal didn't take the tracker for ${order.id}: ${added.error}`);
    s = db.put<Shipment>("shipments", s.id, {
      ...s,
      paypal: added.ok ? { status: "SHIPPED", mode: kit.mode } : { error: added.error, mode: kit.mode },
    });
  }
  await tell(s, 0);
  return s;
}

/** Moves every parcel on to where the clock says it is, and tells Courier each new step. */
async function advance(): Promise<void> {
  // Sample parcels stay where they were drawn, and Courier never hears of them.
  for (const s of db.list<Shipment>("shipments", (x) => !x.deliveredAt && !x.sample, Infinity)) {
    const stage = stageOf(s);
    if (stage <= s.told) continue;
    let next: Shipment = { ...s, told: stage };
    if (stage === STAGES.length - 1) {
      next.deliveredAt = new Date().toISOString();
      const kit = s.paypal && "status" in s.paypal ? toolkitFor(s) : null;
      if (kit) {
        const closed = await kit.run("update_shipment_tracking", {
          transaction_id: s.captureId,
          tracking_number: s.trackingNumber,
          status: "DELIVERED",
          carrier: s.carrier,
        });
        if (closed.ok) next = { ...next, paypal: { status: "DELIVERED", mode: kit.mode } };
        else console.warn(`[shipping] PayPal didn't close the tracker for ${s.orderId}: ${closed.error}`);
      }
    }
    db.put("shipments", s.id, next);
    await tell(next, stage);
  }
}

/** Starts the clock that moves parcels along. Called once by the server. */
export function startDeliveries(): void {
  let busy = false;
  const tick = Math.max(250, Math.min(5000, config.shipping.stepMs / 2));
  setInterval(() => {
    if (busy) return;
    busy = true;
    advance()
      .catch((e) => console.warn("[shipping] advance failed", (e as Error).message))
      .finally(() => {
        busy = false;
      });
  }, tick).unref();
}
