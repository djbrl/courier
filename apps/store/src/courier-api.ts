import { config } from "@courier/shared";
import { CourierShopsClient } from "../../../sdk/typescript/src/index.ts";

/*
 * Everything a shop asks Courier, through the Courier Shops SDK that APIMatic generates from sdk/src/spec/openapi.json.
 * The demo shops run on the same SDK a real shop would install. The types below are what the store's code relies on;
 * the SDK's own are open-ended (an enum also takes any string), so each call narrows its answer to them.
 */

const client = new CourierShopsClient({
  shopKey: config.internalSecret,
  serverOptions: { baseUrl: `${config.courier.url}/internal` },
  // A knock waits on these calls, so a Courier that's down is reported at once rather than after retries.
  retry: { maxRetries: 0, timeout: 15_000 },
});

export interface Errand {
  id: string;
  status: string;
  resource: string;
  spentCents: number;
  spendLimitCents: number;
  perPurchaseLimitCents: number;
  remainingCents: number;
  expiresAt: Date;
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
  getErrand: async (visaId: string) => (await client.errands.getErrand({ visaId })) as Errand,
  getConnection: async (connectionId: string) =>
    (await client.connections.getConnection({ connectionId })) as Connection,
  requestTicket: (connectionId: string, body: TicketRequest) =>
    client.connections.requestTicket({ connectionId, body }) as Promise<{ url?: string; issued?: boolean }>,
  checkSpend: async (body: SpendCheck) => (await client.spending.checkSpend({ body })) as SpendDecision,
  chargeSavedPaypal: async (body: Charge) => {
    const charged = await client.spending.chargeSavedPaypal({ body });
    return { orderId: charged.orderId, status: charged.status, captureId: charged.captureId ?? null };
  },
  commitSpend: (body: Commit) => client.spending.commitSpend({ body }),
  releaseHold: (holdId: string) => client.spending.releaseHold({ body: { holdId } }) as Promise<Ok>,
  getApproval: async (approvalId: string) =>
    (await client.approvals.getApproval({ approvalId })) as { status: "pending" | "approved" | "denied" },
  recordApproval: async (approvalId: string, body: { visaId: string; decision: "approved" | "denied" }) =>
    (await client.approvals.recordApproval({ approvalId, body })) as { status: "approved" | "denied" },
  addStep: (body: Step) => client.afterSale.addStep({ body }) as Promise<Ok>,
  updateParcel: (body: Parcel) => client.afterSale.updateParcel({ body }) as Promise<Ok>,
  updateReturn: (body: Return) => client.afterSale.updateReturn({ body }) as Promise<Ok>,
  reportCourier: (body: { visaId: string; reason: string; evidence?: Record<string, unknown> }) =>
    client.reports.reportCourier({ body }),
};
