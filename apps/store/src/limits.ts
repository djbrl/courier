/**
 * What a refund may be, worked out in plain code before PayPal is called. The clerk's model picks an amount and writes
 * a note; these checks decide whether that call goes out at all. Nothing a courier or a model says can change them.
 */

export interface RefundableOrder {
  id: string;
  shop?: string;
  sub: string;
  status: string;
  captureId?: string | null;
  totalCents: number;
  refundedCents?: number;
}

export type RefundRoom =
  | { ok: true; captureId: string; maxCents: number }
  | { ok: false; code: string; problem: string };

/** The order is this courier's own: bought at this shop under the same person's pseudonym. */
export function ownsOrder(order: RefundableOrder | undefined, sub: string, shop: string): order is RefundableOrder {
  return Boolean(order && order.sub === sub && (order.shop ?? "juniper") === shop);
}

/**
 * How much may still go back on an order: only a paid one, only to its own capture, never past what was captured less
 * what's already been refunded, and once.
 */
export function refundRoom(order: RefundableOrder, refundedBefore: boolean): RefundRoom {
  if (order.status !== "paid")
    return { ok: false, code: "not_paid", problem: `Order ${order.id} isn't paid, so there's nothing to refund.` };
  if (!order.captureId)
    return { ok: false, code: "no_capture", problem: `Order ${order.id} has no PayPal payment to refund.` };
  if (refundedBefore || (order.refundedCents ?? 0) > 0)
    return { ok: false, code: "already_refunded", problem: `Order ${order.id} has already had its refund.` };
  const maxCents = order.totalCents - (order.refundedCents ?? 0);
  if (maxCents <= 0) return { ok: false, code: "nothing_left", problem: `Nothing is left to refund on ${order.id}.` };
  return { ok: true, captureId: order.captureId, maxCents };
}

export interface RefundArgs {
  capture_id: string;
  amount: { currency_code: "USD"; value: string };
  note_to_payer?: string;
}

/**
 * Checks the arguments a model gave PayPal's create_refund, and returns the only ones that go out: this order's capture,
 * an amount in cents within the room, in dollars. A missing amount means "all of it" to PayPal, so it is always written.
 */
export function checkRefundArgs(
  args: unknown,
  room: Extract<RefundRoom, { ok: true }>,
): { ok: true; amountCents: number; args: RefundArgs } | { ok: false; problem: string } {
  const a = (args && typeof args === "object" ? args : {}) as Record<string, any>;
  if (a.capture_id !== room.captureId)
    return { ok: false, problem: `Refunds go to this order's own payment only: capture_id must be ${room.captureId}.` };
  let cents = room.maxCents;
  if (a.amount !== undefined) {
    if (!a.amount || typeof a.amount !== "object")
      return { ok: false, problem: "amount must be {currency_code, value}." };
    if (a.amount.currency_code !== "USD") return { ok: false, problem: "Refunds are in USD." };
    const value = String(a.amount.value ?? "");
    if (!/^\d{1,6}(\.\d{1,2})?$/.test(value)) return { ok: false, problem: `"${value}" isn't an amount in dollars.` };
    cents = Math.round(Number(value) * 100);
  }
  if (cents < 1) return { ok: false, problem: "A refund has to be at least $0.01. To give nothing back, decline." };
  if (cents > room.maxCents)
    return { ok: false, problem: `The most this order can get back is $${(room.maxCents / 100).toFixed(2)}.` };
  const note = typeof a.note_to_payer === "string" ? a.note_to_payer.replace(/\s+/g, " ").trim().slice(0, 255) : "";
  return {
    ok: true,
    amountCents: cents,
    args: {
      capture_id: room.captureId,
      amount: { currency_code: "USD", value: (cents / 100).toFixed(2) },
      ...(note ? { note_to_payer: note } : {}),
    },
  };
}
