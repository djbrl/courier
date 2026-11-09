import { config, internalFetch } from "@courier/shared";

/*
 * Everything a shop asks Courier, in one place. Each call is an operation in sdk/src/spec/openapi.json (the spec the
 * shop SDKs are generated from), under the same name, so a shop on the SDK makes the same calls as these demo shops.
 */

const at = (path: string) => `${config.courier.url}/internal${path}`;
const id = encodeURIComponent;

export interface Errand {
  id: string;
  status: string;
  resource: string;
  spentCents: number;
  spendLimitCents: number;
  perPurchaseLimitCents: number;
  remainingCents: number;
  expiresAt: string;
  bond: { status: string; amountCents: number } | null;
}

export interface Connection {
  status: string;
  agent: string;
  ticketToken: string | null;
}

export interface TicketRequest {
  purpose?: string;
  maxPerItem?: number;
  maxTotal?: number;
  price?: number;
  budgetFromPerson?: number;
}

export interface SpendCheck {
  visaId: string;
  sub: string;
  resource: string;
  action: "reserve" | "checkout";
  items: { title: string; category: string; priceCents: number; quantity?: number }[];
  totalCents: number;
  agentNote?: string;
  approvalId?: string;
}

export interface SpendDecision {
  decision: "approve" | "ask_human" | "deny";
  reason: string;
  code?: string;
  holdId?: string | null;
  approvalId?: string;
  approvalUrl?: string;
  intent?: { model: string; probability: number; reason: string; latencyMs: number } | null;
  remainingCents?: number;
  /** The errand has saved PayPal: Courier can charge this checkout straight away. */
  autopay?: boolean;
}

export interface Charge {
  visaId: string;
  holdId: string;
  description: string;
  brandName: string;
  items?: { name: string; unitCents: number; quantity: number; sku?: string }[];
}

export interface Commit {
  visaId: string;
  holdId: string;
  orderId: string;
  amountCents: number;
  summary: string;
  paidWith?: "paypal_page" | "saved_paypal";
  merchantName?: string;
}

export interface Step {
  visaId: string;
  kind: string;
  title: string;
  detail?: string;
  merchantName?: string;
}

export interface Parcel {
  visaId: string;
  orderId: string;
  merchantName?: string;
  carrierName?: string;
  trackingNumber?: string;
  stage: number;
  labels: string[];
  expectedAt?: string;
  paypal?: string | null;
  simulated?: boolean;
}

export interface Return {
  visaId: string;
  orderId: string;
  merchantName?: string;
  decision: "full" | "partial" | "decline";
  amountCents?: number;
  note?: string;
  by?: "clerk" | "owner";
  paypal?: string;
}

type Ok = { ok: boolean; skipped?: boolean };

export const courierApi = {
  getErrand: (visaId: string) => internalFetch<Errand>(at(`/visas/${id(visaId)}`)),
  getConnection: (connectionId: string) => internalFetch<Connection>(at(`/connections/${id(connectionId)}`)),
  requestTicket: (connectionId: string, body: TicketRequest) =>
    internalFetch<{ url?: string; issued?: boolean }>(at(`/connections/${id(connectionId)}/ticket`), { body }),
  checkSpend: (body: SpendCheck) => internalFetch<SpendDecision>(at("/spend/check"), { body }),
  chargeSavedPaypal: (body: Charge) =>
    internalFetch<{ orderId: string; status: string; captureId: string | null }>(at("/spend/charge"), { body }),
  commitSpend: (body: Commit) =>
    internalFetch<{ ok: boolean; spentCents: number; remainingCents: number }>(at("/spend/commit"), { body }),
  releaseHold: (holdId: string) => internalFetch<Ok>(at("/spend/release"), { body: { holdId } }),
  getApproval: (approvalId: string) =>
    internalFetch<{ status: "pending" | "approved" | "denied" }>(at(`/approvals/${id(approvalId)}`)),
  recordApproval: (approvalId: string, body: { visaId: string; decision: "approved" | "denied" }) =>
    internalFetch<{ status: "approved" | "denied" }>(at(`/approvals/${id(approvalId)}/decide`), { body }),
  addStep: (body: Step) => internalFetch<Ok>(at("/stamps"), { body }),
  updateParcel: (body: Parcel) => internalFetch<Ok>(at("/shipments"), { body }),
  updateReturn: (body: Return) => internalFetch<Ok>(at("/returns"), { body }),
  reportCourier: (body: { visaId: string; reason: string; evidence?: Record<string, unknown> }) =>
    internalFetch<{ ok: boolean; status: string; bondOutcome: string }>(at("/report"), { body }),
};
