import { DocStore } from "@courier/shared";

export const db = new DocStore("store");

export interface Order {
  id: string; // PayPal order id
  /** Which shop sold it. Older orders were all Juniper Records'. */
  shop?: string;
  visaId: string;
  sub: string;
  agent: string;
  holdId: string;
  items: { id: string; title: string; priceCents: number; quantity: number }[];
  totalCents: number;
  status: "awaiting_approval" | "paid" | "cancelled" | "failed";
  /** PayPal's page for the person to pay; null when it was paid with the errand's saved PayPal. */
  approveUrl: string | null;
  /** "saved_paypal": paid straight away with the PayPal the person saved on their Courier ticket. */
  paidWith?: "paypal_page" | "saved_paypal";
  captureId?: string | null;
  /** The unguessable part of the receipt link. Older orders don't have one. */
  receiptKey?: string;
  createdAt: string;
  paidAt?: string | null;
  /** Bought for a demo person: this order lives at the simulator, whatever the server's mode. */
  simulated?: boolean;
  /** What the merchant can show in a dispute: the human's signed delegation and the decision trail. */
  evidence: {
    visa: unknown;
    intent: unknown;
    tokenJti: string;
    humanVerified: boolean;
  };
  disputed?: boolean;
  /** A share of one item, paid alongside other people's shares. */
  group?: string;
  /** Given back through PayPal after a return. */
  refundedCents?: number;
  /** Made up for the demo shop's desk (sample.ts): shown, never acted on. */
  sample?: boolean;
}

/** The steps a parcel goes through. PayPal's tracker only knows SHIPPED and DELIVERED; the rest are the carrier's scans. */
export const STAGES = ["label_created", "in_transit", "out_for_delivery", "delivered"] as const;
export type Stage = (typeof STAGES)[number];

/** A paid order on its way, keyed by the order id. */
export interface Shipment {
  id: string;
  orderId: string;
  shop: string;
  visaId: string;
  /** PayPal's name for the carrier, or "RIDER" for the shop's own delivery, which PayPal doesn't track. */
  carrier: string;
  carrierName: string;
  trackingNumber: string;
  /** The PayPal capture the tracker is added to. */
  captureId: string | null;
  shippedAt: string;
  /** The last step Courier was told about. */
  told: number;
  deliveredAt?: string;
  /** What PayPal said when the clerk added or closed the tracker; null when it isn't tracked there. */
  paypal: { status: "SHIPPED" | "DELIVERED"; mode: string } | { error: string; mode: string } | null;
  simulated?: boolean;
  /** Made up for the demo shop's desk, with the step it's frozen at. */
  sample?: boolean;
  sampleStage?: number;
}

/** A return asked for by a courier, or a refund the owner confirmed. One per order, decided once. */
export interface ReturnRecord {
  id: string;
  orderId: string;
  shop: string;
  /** What the courier said, word for word. Untrusted: kept for the owner, never followed. */
  reason: string;
  decision: "full" | "partial" | "decline";
  amountCents: number;
  /** For the customer, from the clerk or the owner. */
  note: string;
  refundId?: string;
  by: "clerk" | "owner";
  /** Which mind decided: the model's name, or "rules". */
  decidedBy: string;
  paypalMode: string;
  at: string;
  sample?: boolean;
}

/** A refund the owner's clerk proposed. Nothing moves until the owner confirms it. */
export interface ClerkAction {
  id: string;
  kind: "refund";
  orderId: string;
  amountCents: number;
  note: string;
  status: "proposed" | "done" | "refused";
  createdAt: string;
  expiresAt: string;
}

/** People chipping in on one item. Each pays their own order; the item ships once the shares add up to its price. */
export interface Group {
  id: string;
  shop: string;
  itemId: string;
  priceCents: number;
  orderIds: string[];
  createdAt: string;
  shippedAt?: string;
}

export interface Reservation {
  id: string;
  visaId: string;
  itemId: string;
  expiresAt: string;
}
