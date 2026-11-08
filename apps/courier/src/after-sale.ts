import { money, requireInternal, type Visa } from "@courier/shared";
import { Router } from "express";
import { type Delivery, db, type Refund } from "./db.ts";
import { afterSale, deliveryEvent } from "./room.ts";
import { addStamp } from "./visas.ts";

/**
 * What shops report after a sale: a parcel's next step, and what they decided on a return. Both land on the errand as
 * steps and in the chat that bought the order. A refund is recorded on the errand but doesn't raise what it may still
 * spend: the budget was what the person allowed, and money coming back to their PayPal doesn't change that.
 */
export const afterSaleRouter = Router();
afterSaleRouter.use(requireInternal);

const text = (value: unknown, max: number) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

afterSaleRouter.post("/shipments", (req, res) => {
  const body = req.body as Record<string, unknown>;
  const visa = db.get<Visa>("visas", text(body.visaId, 80));
  const orderId = text(body.orderId, 80);
  const labels = Array.isArray(body.labels) ? body.labels.slice(0, 6).map((l) => text(l, 40)) : [];
  const stage = Number(body.stage);
  if (!visa || !orderId || !labels.length || !Number.isInteger(stage) || stage < 0 || stage >= labels.length) {
    res.status(404).json({ error: "unknown errand or step" });
    return;
  }
  const before = db.get<Delivery>("deliveries", orderId);
  if (before && before.stage >= stage) {
    res.json({ ok: true, skipped: true });
    return;
  }
  const delivery = db.put<Delivery>("deliveries", orderId, {
    id: orderId,
    visaId: visa.id,
    humanId: visa.humanId,
    merchantName: text(body.merchantName, 80) || visa.merchantName,
    carrierName: text(body.carrierName, 40),
    trackingNumber: text(body.trackingNumber, 40),
    stage,
    labels,
    expectedAt: text(body.expectedAt, 40),
    paypal: body.paypal ? text(body.paypal, 20) : null,
    updatedAt: new Date().toISOString(),
  });
  const parcel = `${delivery.carrierName} ${delivery.trackingNumber}`;
  if (stage === 0)
    addStamp(
      visa,
      "shipping",
      `Shipped · tracking ${delivery.trackingNumber}`,
      `${delivery.merchantName} · ${delivery.carrierName}${delivery.paypal ? ` · tracking added to the ${delivery.paypal.toLowerCase()} PayPal payment` : ""}`,
      delivery.merchantName,
    );
  else addStamp(visa, "shipping", labels[stage]!, `${delivery.merchantName} · ${parcel}`, delivery.merchantName);
  afterSale(visa.humanId, orderId, deliveryEvent(delivery));
  res.json({ ok: true });
});

afterSaleRouter.post("/returns", (req, res) => {
  const body = req.body as Record<string, unknown>;
  const visa = db.get<Visa>("visas", text(body.visaId, 80));
  const orderId = text(body.orderId, 80);
  const decision = body.decision === "full" || body.decision === "partial" ? body.decision : "decline";
  const amountCents = decision === "decline" ? 0 : Math.max(0, Math.round(Number(body.amountCents) || 0));
  if (!visa || !orderId) {
    res.status(404).json({ error: "unknown errand" });
    return;
  }
  const before = db.get<Refund>("refunds", orderId);
  // Told once per decision: a repeat changes nothing. An owner's refund after a decline is a new decision.
  if (before && before.decision === decision && before.amountCents === amountCents) {
    res.json({ ok: true, skipped: true });
    return;
  }
  const refund = db.put<Refund>("refunds", orderId, {
    id: orderId,
    visaId: visa.id,
    humanId: visa.humanId,
    merchantName: text(body.merchantName, 80) || visa.merchantName,
    decision,
    amountCents,
    note: text(body.note, 255),
    by: body.by === "owner" ? "owner" : "clerk",
    paypal: text(body.paypal, 20),
    at: new Date().toISOString(),
  });
  if (amountCents > 0) {
    const fresh = db.get<Visa>("visas", visa.id)!;
    db.put<Visa>("visas", visa.id, { ...fresh, refundedCents: (fresh.refundedCents ?? 0) + amountCents });
  }
  addStamp(
    visa,
    "refund",
    decision === "decline" ? "Return declined" : `Refunded ${money(amountCents)}`,
    `${refund.merchantName}${refund.note ? ` · “${refund.note}”` : ""}${amountCents ? ` · back to your PayPal (${refund.paypal.toLowerCase()})` : ""}`,
    refund.merchantName,
  );
  afterSale(visa.humanId, orderId, {
    t: "refund",
    order_id: orderId,
    shop: refund.merchantName,
    decision,
    amount: (amountCents / 100).toFixed(2),
    note: refund.note,
    paypal: refund.paypal,
  });
  res.json({ ok: true });
});
