import {
  avatar,
  type CreateOrderInput,
  courierLayout,
  html,
  LOGO,
  money,
  newId,
  type OrderSummary,
  PP,
  randomToken,
  requireInternal,
  type VaultSetupInput,
} from "@courier/shared";
import express, { Router } from "express";
import { db } from "./db.ts";

/**
 * A small, clearly labelled stand-in for the PayPal sandbox, used when PAYPAL_CLIENT_ID/SECRET are not set, and for
 * demo people on any server.
 * It mimics the shapes the app needs (Log in with PayPal identity, Orders v2, authorizations) so the full product
 * can be demoed end to end. It is not PayPal and does not look like PayPal.
 */

interface SimPersona {
  key: string;
  name: string;
  payerId: string;
  verified: boolean;
  ageRange: string;
  note: string;
}

const PERSONAS: SimPersona[] = [
  {
    key: "maya",
    name: "Maya Chen",
    payerId: "SIMPAYERMAYA0",
    verified: true,
    ageRange: "25-34",
    note: "Verified account",
  },
  {
    key: "ada",
    name: "Ada Okafor",
    payerId: "SIMPAYERADA01",
    verified: true,
    ageRange: "25-34",
    note: "Verified account",
  },
  {
    key: "malik",
    name: "Malik Diallo",
    payerId: "SIMPAYERMLK02",
    verified: true,
    ageRange: "18-24",
    note: "Verified account",
  },
  {
    key: "sam",
    name: "Sam Reyes",
    payerId: "SIMPAYERSAM03",
    verified: false,
    ageRange: "25-34",
    note: "Unverified account",
  },
  { key: "riley", name: "Riley Chen", payerId: "SIMPAYERRLY04", verified: true, ageRange: "13-17", note: "Under 18" },
];

/** The accounts on the sign-in page. The others stay, unlisted, for the tests of who gets turned away. */
const SHOWN = PERSONAS.filter((p) => p.verified && p.ageRange !== "13-17").slice(0, 3);

interface SimOrder extends CreateOrderInput {
  id: string;
  status: "CREATED" | "APPROVED" | "COMPLETED" | "VOIDED";
  createdAt: string;
  captureId?: string | null;
  authorizationId?: string | null;
}

interface SimAuthorization {
  id: string;
  orderId: string;
  amountCents: number;
  status: "CREATED" | "VOIDED" | "CAPTURED";
}

interface SimSetupToken extends VaultSetupInput {
  id: string;
  status: "PAYER_ACTION_REQUIRED" | "APPROVED" | "VAULTED" | "CANCELLED";
}

interface SimPaymentToken {
  id: string;
  setupTokenId: string;
  email: string;
  deleted: boolean;
}

function summary(order: SimOrder, base: string): OrderSummary {
  return {
    id: order.id,
    status: order.status,
    approveUrl: `${base}/sim-paypal/checkout/${order.id}`,
    customId: order.customId,
    amountCents: order.amountCents,
    captureId: order.captureId ?? null,
    authorizationId: order.authorizationId ?? null,
  };
}

function simBanner() {
  return html`<header class="sim-bar">${LOGO}<span>Simulated. Not PayPal, no real money.</span></header>`;
}

function personaButton(p: SimPersona, i: number) {
  return html`<button class="persona ${i === 0 ? "rec" : ""}" name="persona" value="${p.key}" type="submit">
    ${avatar(["#FFC629", "#D6FF2E", "#B7A3FF", "#FF8A3D", "#DEDDFF"][i % 5])}
    <span><b>${p.name}</b><small>${p.note} · demo account</small></span>
    <span class="tagx">Continue</span>
  </button>`;
}

export function simPaypalRouter(courierUrl: string): Router {
  const router = Router();
  router.use(express.urlencoded({ extended: false }));
  router.use(express.json());

  /* ---------- Log in with PayPal (simulated) ---------- */

  router.get("/login", (req, res) => {
    const redirectUri = String(req.query.redirect_uri ?? "");
    const state = String(req.query.state ?? "");
    res.send(
      courierLayout({
        title: "Simulated PayPal sign-in",
        bodyClass: "simf",
        body: html`
          ${simBanner()}
          <main class="sim-card">
            <h1>Pick a demo account.</h1>
            <p class="lead">This is a demo, so it doesn’t connect a real ${PP} account. Sign in as one of these made-up people.</p>
            <form method="post" action="/sim-paypal/login" class="personas">
              <input type="hidden" name="redirect_uri" value="${redirectUri}">
              <input type="hidden" name="state" value="${state}">
              ${SHOWN.map((p, i) => personaButton(p, i))}
            </form>
          </main>`,
      }),
    );
  });

  router.post("/login", (req, res) => {
    const persona = PERSONAS.find((p) => p.key === req.body.persona);
    const redirectUri = String(req.body.redirect_uri ?? "");
    if (!persona || !redirectUri.startsWith(courierUrl)) {
      res.status(400).send("Bad request");
      return;
    }
    const code = `simcode_${randomToken(16)}`;
    db.put("sim_login_codes", code, { code, persona: persona.key, expiresAt: Date.now() + 5 * 60 * 1000 });
    const url = new URL(redirectUri);
    url.searchParams.set("code", code);
    url.searchParams.set("state", String(req.body.state ?? ""));
    res.redirect(302, url.toString());
  });

  /* ---------- Checkout approval (simulated) ---------- */

  router.get("/checkout/:id", (req, res) => {
    const order = db.get<SimOrder>("sim_orders", req.params.id);
    if (!order) {
      res.status(404).send("Unknown order");
      return;
    }
    const isBond = order.intent === "AUTHORIZE";
    res.send(
      courierLayout({
        title: isBond ? "Approve a refundable hold" : "Approve payment",
        bodyClass: "simf",
        body: html`
          ${simBanner()}
          <main class="sim-card">
            <p class="wiz-n">${order.brandName}</p>
            <h1>${isBond ? "Approve a refundable hold" : "Approve this payment"}</h1>
            <p class="lead">${order.description}</p>
            ${
              order.items?.length
                ? html`<ul class="sim-lines">${order.items.map(
                    (i) =>
                      html`<li><span>${i.quantity} × ${i.name}</span><span>${money(i.unitCents * i.quantity, order.currency)}</span></li>`,
                  )}</ul>`
                : ""
            }
            <p class="sim-tot"><span>${isBond ? "Hold amount" : "Total"}</span><b>${money(order.amountCents, order.currency)}</b></p>
            ${isBond ? html`<p class="fine" style="margin-top:8px">Nothing is charged now. The hold is released when the errand ends cleanly.</p>` : ""}
            ${
              order.status !== "CREATED"
                ? html`<p class="err">This order is already ${order.status.toLowerCase()}.</p>`
                : html`<form method="post" action="/sim-paypal/checkout/${order.id}" class="sim-acts">
                  <button class="btn" name="decision" value="approve" type="submit">${isBond ? "Approve hold" : "Pay now"}</button>
                  <button class="btn ghost" name="decision" value="cancel" type="submit">Cancel</button>
                </form>`
            }
          </main>`,
      }),
    );
  });

  router.post("/checkout/:id", (req, res) => {
    const order = db.get<SimOrder>("sim_orders", req.params.id);
    if (order?.status !== "CREATED") {
      res.status(409).send("Order is not awaiting approval");
      return;
    }
    if (req.body.decision === "approve") {
      db.put("sim_orders", order.id, { ...order, status: "APPROVED" });
      const url = new URL(order.returnUrl);
      url.searchParams.set("token", order.id);
      url.searchParams.set("PayerID", "SIMPAYER");
      res.redirect(302, url.toString());
    } else {
      const url = new URL(order.cancelUrl);
      url.searchParams.set("token", order.id);
      res.redirect(302, url.toString());
    }
  });

  /* ---------- Save PayPal for later (simulated Vault approval) ---------- */

  router.get("/vault/:id", (req, res) => {
    const setup = db.get<SimSetupToken>("sim_setup_tokens", req.params.id);
    if (!setup) {
      res.status(404).send("Unknown setup token");
      return;
    }
    res.send(
      courierLayout({
        title: "Save PayPal for later",
        bodyClass: "simf",
        body: html`
          ${simBanner()}
          <main class="sim-card">
            <p class="wiz-n">${setup.brandName}</p>
            <h1>Save PayPal for ${setup.brandName}?</h1>
            <p class="lead">${setup.description}</p>
            <p class="fine" style="margin-top:8px">Nothing is charged now. You can remove it any time.</p>
            ${
              setup.status !== "PAYER_ACTION_REQUIRED"
                ? html`<p class="err">This request is already ${setup.status.toLowerCase()}.</p>`
                : html`<form method="post" action="/sim-paypal/vault/${setup.id}" class="sim-acts">
                  <button class="btn" name="decision" value="approve" type="submit">Agree and continue</button>
                  <button class="btn ghost" name="decision" value="cancel" type="submit">Cancel</button>
                </form>`
            }
          </main>`,
      }),
    );
  });

  router.post("/vault/:id", (req, res) => {
    const setup = db.get<SimSetupToken>("sim_setup_tokens", req.params.id);
    if (setup?.status !== "PAYER_ACTION_REQUIRED") {
      res.status(409).send("Setup token is not awaiting approval");
      return;
    }
    const approved = req.body.decision === "approve";
    db.put("sim_setup_tokens", setup.id, { ...setup, status: approved ? "APPROVED" : "CANCELLED" });
    const url = new URL(approved ? setup.returnUrl : setup.cancelUrl);
    url.searchParams.set("approval_token_id", setup.id);
    res.redirect(302, url.toString());
  });

  /* ---------- API (server-to-server, shared secret) ---------- */

  const api = Router();
  api.use(requireInternal);

  api.post("/login/token", (req, res) => {
    const record = db.get<{ persona: string; expiresAt: number }>("sim_login_codes", req.body.code);
    if (!record || record.expiresAt < Date.now()) {
      res.status(400).json({ message: "invalid code" });
      return;
    }
    db.delete("sim_login_codes", req.body.code);
    const persona = PERSONAS.find((p) => p.key === record.persona)!;
    res.json({
      payerId: persona.payerId,
      verified: persona.verified,
      ageRange: persona.ageRange,
      accountType: "PERSONAL",
      emailVerified: true,
      name: persona.name,
    });
  });

  api.post("/orders", (req, res) => {
    const input = req.body as CreateOrderInput & { idempotencyKey?: string };
    if (input.idempotencyKey) {
      const existing = db.get<{ orderId: string }>("sim_idempotency", input.idempotencyKey);
      if (existing) {
        res.json(summary(db.get<SimOrder>("sim_orders", existing.orderId)!, courierUrl));
        return;
      }
    }
    const order: SimOrder = {
      ...input,
      id: newId("SIM").replace("_", "-"),
      status: "CREATED",
      createdAt: new Date().toISOString(),
    };
    db.put("sim_orders", order.id, order);
    if (input.idempotencyKey) db.put("sim_idempotency", input.idempotencyKey, { orderId: order.id });
    res.status(201).json(summary(order, courierUrl));
  });

  api.get("/orders/:id", (req, res) => {
    const order = db.get<SimOrder>("sim_orders", req.params.id);
    if (!order) {
      res.status(404).json({ message: "not found" });
      return;
    }
    res.json(summary(order, courierUrl));
  });

  api.post("/orders/:id/capture", (req, res) => {
    const order = db.get<SimOrder>("sim_orders", req.params.id);
    if (!order) {
      res.status(404).json({ message: "not found" });
      return;
    }
    if (order.status === "COMPLETED") {
      res.json(summary(order, courierUrl));
      return;
    }
    if (order.status !== "APPROVED" || order.intent !== "CAPTURE") {
      res.status(422).json({ message: `ORDER_NOT_APPROVED (status ${order.status})` });
      return;
    }
    const done = { ...order, status: "COMPLETED" as const, captureId: newId("CAP").replace("_", "-") };
    db.put("sim_orders", order.id, done);
    res.json(summary(done, courierUrl));
  });

  api.post("/orders/:id/authorize", (req, res) => {
    const order = db.get<SimOrder>("sim_orders", req.params.id);
    if (!order) {
      res.status(404).json({ message: "not found" });
      return;
    }
    if (order.status === "COMPLETED") {
      res.json(summary(order, courierUrl));
      return;
    }
    if (order.status !== "APPROVED" || order.intent !== "AUTHORIZE") {
      res.status(422).json({ message: `ORDER_NOT_APPROVED (status ${order.status})` });
      return;
    }
    const auth: SimAuthorization = {
      id: newId("AUTH").replace("_", "-"),
      orderId: order.id,
      amountCents: order.amountCents,
      status: "CREATED",
    };
    db.put("sim_authorizations", auth.id, auth);
    const done = { ...order, status: "COMPLETED" as const, authorizationId: auth.id };
    db.put("sim_orders", order.id, done);
    res.json(summary(done, courierUrl));
  });

  api.post("/authorizations/:id/void", (req, res) => {
    const auth = db.get<SimAuthorization>("sim_authorizations", req.params.id);
    if (auth?.status !== "CREATED") {
      res.status(422).json({ message: "AUTHORIZATION_ALREADY_FINALIZED" });
      return;
    }
    db.put("sim_authorizations", auth.id, { ...auth, status: "VOIDED" });
    res.json({ status: "VOIDED" });
  });

  api.post("/authorizations/:id/capture", (req, res) => {
    const auth = db.get<SimAuthorization>("sim_authorizations", req.params.id);
    if (auth?.status !== "CREATED") {
      res.status(422).json({ message: "AUTHORIZATION_ALREADY_FINALIZED" });
      return;
    }
    db.put("sim_authorizations", auth.id, { ...auth, status: "CAPTURED" });
    res.json({ captureId: newId("CAP").replace("_", "-"), status: "COMPLETED" });
  });

  api.post("/vault/setup-tokens", (req, res) => {
    const input = req.body as VaultSetupInput & { idempotencyKey?: string };
    const setup: SimSetupToken = {
      id: newId("SETUP").replace("_", "-"),
      description: input.description,
      brandName: input.brandName,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      status: "PAYER_ACTION_REQUIRED",
    };
    db.put("sim_setup_tokens", setup.id, setup);
    res.status(201).json({ id: setup.id, approveUrl: `${courierUrl}/sim-paypal/vault/${setup.id}` });
  });

  api.post("/vault/payment-tokens", (req, res) => {
    const setup = db.get<SimSetupToken>("sim_setup_tokens", req.body.setupTokenId);
    if (setup?.status !== "APPROVED") {
      res.status(422).json({ message: `SETUP_TOKEN_NOT_APPROVED (status ${setup?.status ?? "unknown"})` });
      return;
    }
    const token: SimPaymentToken = {
      id: newId("VT").replace("_", "-"),
      setupTokenId: setup.id,
      email: "buyer@sim-paypal.test",
      deleted: false,
    };
    db.put("sim_payment_tokens", token.id, token);
    db.put("sim_setup_tokens", setup.id, { ...setup, status: "VAULTED" });
    res.status(201).json({ id: token.id, email: token.email });
  });

  api.delete("/vault/payment-tokens/:id", (req, res) => {
    const token = db.get<SimPaymentToken>("sim_payment_tokens", req.params.id);
    if (token) db.put("sim_payment_tokens", token.id, { ...token, deleted: true });
    res.status(204).end();
  });

  /** Test hook: whether a saved PayPal still exists. */
  api.get("/vault/payment-tokens/:id", (req, res) => {
    const token = db.get<SimPaymentToken>("sim_payment_tokens", req.params.id);
    if (!token || token.deleted) {
      res.status(404).json({ message: "RESOURCE_NOT_FOUND" });
      return;
    }
    res.json({ id: token.id });
  });

  api.post("/vault/charge", (req, res) => {
    const input = req.body as Omit<CreateOrderInput, "returnUrl" | "cancelUrl" | "intent"> & {
      vaultId: string;
      idempotencyKey?: string;
    };
    const token = db.get<SimPaymentToken>("sim_payment_tokens", input.vaultId);
    if (!token || token.deleted) {
      res.status(422).json({ message: "PAYMENT_SOURCE_INFO_CANNOT_BE_VERIFIED" });
      return;
    }
    if (input.idempotencyKey) {
      const existing = db.get<{ orderId: string }>("sim_idempotency", input.idempotencyKey);
      if (existing) {
        res.json(summary(db.get<SimOrder>("sim_orders", existing.orderId)!, courierUrl));
        return;
      }
    }
    const order: SimOrder = {
      ...input,
      intent: "CAPTURE",
      returnUrl: "",
      cancelUrl: "",
      id: newId("SIM").replace("_", "-"),
      status: "COMPLETED",
      captureId: newId("CAP").replace("_", "-"),
      createdAt: new Date().toISOString(),
    };
    db.put("sim_orders", order.id, order);
    if (input.idempotencyKey) db.put("sim_idempotency", input.idempotencyKey, { orderId: order.id });
    res.status(201).json({ ...summary(order, courierUrl), approveUrl: null });
  });

  router.use("/api", api);
  router.use("/rest", restRouter());
  return router;
}

/* ---------- PayPal's own REST shapes, for the Agent Toolkit ---------- */

interface SimRefund {
  id: string;
  captureId: string;
  amountCents: number;
  currency: string;
  note: string | null;
  createdAt: string;
}

interface SimTracker {
  id: string;
  transactionId: string;
  trackingNumber: string;
  status: string;
  carrier: string;
  updatedAt: string;
}

const TRACKER_STATUSES = new Set(["SHIPPED", "ON_HOLD", "DELIVERED", "CANCELLED", "LOCAL_PICKUP"]);

/**
 * The shops' clerk runs PayPal's Agent Toolkit unchanged and only points it here, so these answer at PayPal's own
 * paths with PayPal's shapes: refunds on captures, shipment trackers, and the transaction report. Refunds can never add
 * up to more than was captured, as at PayPal.
 */
function restRouter(): Router {
  const rest = Router();
  rest.use(requireInternal);
  const value = (cents: number) => (cents / 100).toFixed(2);
  const problem = (res: express.Response, status: number, name: string, description: string) =>
    res.status(status).json({ name, message: description, details: [{ issue: name, description }] });
  const captured = (captureId: string) =>
    db.list<SimOrder>("sim_orders", (o) => o.status === "COMPLETED" && o.captureId === captureId, 1)[0];
  const refundsOf = (captureId: string) =>
    db.list<SimRefund>("sim_refunds", (r) => r.captureId === captureId, Number.POSITIVE_INFINITY);
  const refundView = (r: SimRefund) => ({
    id: r.id,
    status: "COMPLETED",
    amount: { currency_code: r.currency, value: value(r.amountCents) },
    ...(r.note ? { note_to_payer: r.note } : {}),
    create_time: r.createdAt,
    links: [],
  });

  rest.post("/v2/payments/captures/:id/refund", (req, res) => {
    const order = captured(req.params.id);
    if (!order) return void problem(res, 404, "RESOURCE_NOT_FOUND", "The specified capture ID does not exist.");
    const left = order.amountCents - refundsOf(req.params.id).reduce((s, r) => s + r.amountCents, 0);
    const asked = req.body?.amount;
    if (asked && asked.currency_code !== order.currency)
      return void problem(res, 422, "CURRENCY_MISMATCH", "Refund must be in the same currency as the capture.");
    const cents = asked ? Math.round(Number(asked.value) * 100) : left;
    if (!(cents > 0) || cents > left)
      return void problem(
        res,
        422,
        "REFUND_AMOUNT_EXCEEDED",
        "The refund amount must be less than or equal to the capture amount that has not yet been refunded.",
      );
    const refund: SimRefund = {
      id: newId("REF").replace("_", "-"),
      captureId: req.params.id,
      amountCents: cents,
      currency: order.currency,
      note: typeof req.body?.note_to_payer === "string" ? req.body.note_to_payer.slice(0, 255) : null,
      createdAt: new Date().toISOString(),
    };
    db.put("sim_refunds", refund.id, refund);
    res.status(201).json(refundView(refund));
  });

  rest.get("/v2/payments/refunds/:id", (req, res) => {
    const refund = db.get<SimRefund>("sim_refunds", req.params.id);
    if (!refund) return void problem(res, 404, "RESOURCE_NOT_FOUND", "The specified refund ID does not exist.");
    res.json(refundView(refund));
  });

  rest.post("/v1/shipping/trackers-batch", (req, res) => {
    const trackers = Array.isArray(req.body?.trackers) ? req.body.trackers : [];
    const added: { transaction_id: string; tracking_number: string; links: [] }[] = [];
    const errors: { name: string; message: string }[] = [];
    for (const t of trackers) {
      const status = String(t?.status ?? "SHIPPED");
      if (!captured(String(t?.transaction_id ?? "")) || !t?.tracking_number || !TRACKER_STATUSES.has(status)) {
        errors.push({ name: "INVALID_REQUEST", message: `Can't add a tracker to ${String(t?.transaction_id)}.` });
        continue;
      }
      const tracker: SimTracker = {
        id: `${t.transaction_id}-${t.tracking_number}`,
        transactionId: t.transaction_id,
        trackingNumber: t.tracking_number,
        status,
        carrier: String(t.carrier ?? "OTHER"),
        updatedAt: new Date().toISOString(),
      };
      db.put("sim_trackers", tracker.id, tracker);
      added.push({ transaction_id: tracker.transactionId, tracking_number: tracker.trackingNumber, links: [] });
    }
    res.json({ tracker_identifiers: added, errors, links: [] });
  });

  rest.get("/v1/shipping/trackers", (req, res) => {
    const id = String(req.query.transaction_id ?? "");
    const trackers = db.list<SimTracker>("sim_trackers", (t) => t.transactionId === id);
    res.json({
      trackers: trackers.map((t) => ({
        transaction_id: t.transactionId,
        tracking_number: t.trackingNumber,
        status: t.status,
        carrier: t.carrier,
        last_updated_time: t.updatedAt,
      })),
    });
  });

  rest.put("/v1/shipping/trackers/:id", (req, res) => {
    const tracker = db.get<SimTracker>("sim_trackers", req.params.id);
    if (!tracker) return void problem(res, 404, "RESOURCE_NOT_FOUND", "The specified tracker does not exist.");
    const status = String(req.body?.status ?? "");
    if (!TRACKER_STATUSES.has(status))
      return void problem(res, 400, "INVALID_PARAMETER_VALUE", "Unknown tracker status.");
    db.put<SimTracker>("sim_trackers", tracker.id, {
      ...tracker,
      status,
      ...(req.body?.carrier ? { carrier: String(req.body.carrier) } : {}),
      updatedAt: new Date().toISOString(),
    });
    res.status(204).end();
  });

  rest.get("/v1/reporting/transactions", (req, res) => {
    const from = Date.parse(String(req.query.start_date ?? "")) || Date.now() - 31 * 86_400_000;
    const to = Date.parse(String(req.query.end_date ?? "")) || Date.now();
    const only = req.query.transaction_id ? String(req.query.transaction_id) : null;
    const within = (at: string) => Date.parse(at) >= from && Date.parse(at) <= to;
    const sales = db
      .list<SimOrder>("sim_orders", (o) => o.status === "COMPLETED" && Boolean(o.captureId) && within(o.createdAt), 500)
      .map((o) => ({
        transaction_info: {
          transaction_id: o.captureId,
          transaction_event_code: "T0006",
          transaction_initiation_date: o.createdAt,
          transaction_amount: { currency_code: o.currency, value: value(o.amountCents) },
          transaction_status: "S",
          custom_field: o.customId,
        },
      }));
    const refunds = db
      .list<SimRefund>("sim_refunds", (r) => within(r.createdAt), 500)
      .map((r) => ({
        transaction_info: {
          transaction_id: r.id,
          paypal_reference_id: r.captureId,
          transaction_event_code: "T1107",
          transaction_initiation_date: r.createdAt,
          transaction_amount: { currency_code: r.currency, value: `-${value(r.amountCents)}` },
          transaction_status: "S",
        },
      }));
    const details = [...sales, ...refunds]
      .filter((t) => !only || t.transaction_info.transaction_id === only)
      .sort((a, b) =>
        b.transaction_info.transaction_initiation_date.localeCompare(a.transaction_info.transaction_initiation_date),
      );
    res.json({
      transaction_details: details,
      account_number: "SIMULATED",
      start_date: new Date(from).toISOString(),
      end_date: new Date(to).toISOString(),
      page: 1,
      total_items: details.length,
      total_pages: 1,
      links: [],
    });
  });

  return rest;
}
