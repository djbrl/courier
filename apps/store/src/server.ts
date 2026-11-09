import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config, findShop, JUNIPER, paypal, ROOT_DIR, SHOPS, type Shop, SITE_ICONS } from "@courier/shared";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { claimsOf, ownerId, PRM_PATH, protectedResourceMetadata, type RequestLogEntry, requireVisa } from "./auth.ts";
import { CATALOG, shelfOf } from "./catalog.ts";
import { confirmAction, declineAction, type OwnerMessage, ownerClerk, proposeRefund } from "./clerk.ts";
import { db, type Order } from "./db.ts";
import { deskSnapshot } from "./desk.ts";
import { deskAgentNote, deskAgentOn, deskTurn } from "./desk-agent.ts";
import { dismiss, reportCourier, shopDesk } from "./desk-ops.ts";
import { couriersPage, type DeskView, doorPage, ordersPage, reportsPage, todayPage } from "./desk-views.ts";
import { cancelOrder, createMcpServer, settleOrder } from "./mcp.ts";
import { startDeliveries } from "./shipping.ts";
import { merchantDashboard, notFoundPage, paymentResult, receiptPage, shopGrid, storefront } from "./views.ts";

const app = express();
app.set("trust proxy", "loopback");
app.disable("x-powered-by");

app.use(
  "/assets",
  express.static(path.join(ROOT_DIR, "packages/shared/assets"), {
    maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
  }),
);
// Browsers, phones and Claude's connector list look for the logo at the root, not under /assets.
for (const file of SITE_ICONS) {
  app.get(`/${file}`, (_req, res) =>
    res.sendFile(path.join(ROOT_DIR, "packages/shared/assets", file), { maxAge: "1d" }),
  );
}

/* ---------------- OAuth Protected Resource Metadata (RFC 9728) ---------------- */

const sendPrm = (_req: express.Request, res: express.Response) => {
  res.set("Access-Control-Allow-Origin", "*").json(protectedResourceMetadata);
};
app.get(PRM_PATH, sendPrm);
app.get("/.well-known/oauth-protected-resource", sendPrm);

/* ---------------- MCP endpoint ---------------- */

const mcpPaths = SHOPS.map((shop) => (shop === JUNIPER ? "/mcp" : `/${shop.slug}/mcp`));
app.use(mcpPaths, (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type, Mcp-Session-Id, Mcp-Protocol-Version, X-Demo-Source",
  );
  res.set("Access-Control-Expose-Headers", "WWW-Authenticate, Mcp-Session-Id");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

/**
 * Sessions let the shop talk back mid-call: when Courier needs the person's OK, the tool asks them in their chat app
 * (an MCP elicitation), which needs a session and a streamed response. A client that initializes gets a session bound
 * to its connection or visa; anything else (raw one-off calls) is served statelessly.
 */
interface McpSession {
  transport: StreamableHTTPServerTransport;
  owner: string;
  lastSeen: number;
}
const sessions = new Map<string, McpSession>();
const SESSION_IDLE_MS = 30 * 60 * 1000;

setInterval(() => {
  for (const [id, sess] of sessions)
    if (Date.now() - sess.lastSeen > SESSION_IDLE_MS) void sess.transport.close().finally(() => sessions.delete(id));
}, 60_000).unref();

const ownerOf = (req: express.Request) => ownerId(claimsOf((req as express.Request & { auth?: AuthInfo }).auth));

/** The session this request belongs to, if it names one this caller owns. Replies with an error otherwise. */
function ownSession(shop: Shop, req: express.Request, res: express.Response): McpSession | null {
  const sess = sessions.get(String(req.headers["mcp-session-id"]));
  if (!sess || sess.owner !== `${shop.slug}:${ownerOf(req)}`) {
    res.status(404).json({ jsonrpc: "2.0", error: { code: -32001, message: "Session not found" }, id: null });
    return null;
  }
  sess.lastSeen = Date.now();
  return sess;
}

async function serve(
  transport: StreamableHTTPServerTransport,
  req: express.Request,
  res: express.Response,
  body?: unknown,
) {
  try {
    await transport.handleRequest(req, res, body);
  } catch (error) {
    console.error("[mcp] error", error);
    if (!res.headersSent)
      res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null });
  }
}

for (const shop of SHOPS) {
  const path = shop === JUNIPER ? "/mcp" : `/${shop.slug}/mcp`;
  const guard = requireVisa(shop);

  app.post(path, express.json({ limit: "1mb" }), guard, async (req, res) => {
    if (req.headers["mcp-session-id"]) {
      const sess = ownSession(shop, req, res);
      if (sess) await serve(sess.transport, req, res, req.body);
      return;
    }
    const server = createMcpServer(shop);
    if (isInitializeRequest(req.body)) {
      const owner = `${shop.slug}:${ownerOf(req)}`;
      const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => void sessions.set(id, { transport, owner, lastSeen: Date.now() }),
      });
      transport.onclose = () => {
        if (transport.sessionId) sessions.delete(transport.sessionId);
        void server.close();
      };
      await server.connect(transport);
      await serve(transport, req, res, req.body);
      return;
    }
    // Stateless: a fresh server and transport for this one request.
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await serve(transport, req, res, req.body);
  });

  // The session's own stream (GET) and its end (DELETE).
  app.get(path, guard, async (req, res) => {
    const sess = ownSession(shop, req, res);
    if (sess) await serve(sess.transport, req, res);
  });
  app.delete(path, guard, async (req, res) => {
    const sess = ownSession(shop, req, res);
    if (sess) await serve(sess.transport, req, res);
  });
}

/* ---------------- human-facing shop ---------------- */

app.get("/", (_req, res) => {
  res.send(shopGrid());
});

/** The public shelf, as humans see it (the Courier errand room renders its shop front from this). */
app.get("/catalog.json", (_req, res) => {
  res.set("Access-Control-Allow-Origin", "*").json({
    store: JUNIPER.name,
    items: CATALOG.map((i) => ({
      id: i.id,
      title: i.title,
      artist: i.artist,
      category: i.category,
      genre: i.genre,
      priceCents: i.priceCents,
      stock: i.stock,
      blurb: i.blurb,
      hue: i.hue,
    })),
  });
});

const DESK_BUNDLE = path.join(ROOT_DIR, "packages/shared/assets/desk/desk.js");

/* ---------------- the shop desk: one shop's back office ---------------- */

// The desk used to be one page for every shop. Now each shop has its own; the demo opens Juniper Records'.
app.get("/merchant", (_req, res) => res.redirect(302, "/desk/juniper"));
app.get("/desk", (req, res) => {
  const shop = findShop(typeof req.query.shop === "string" ? req.query.shop : "") ?? JUNIPER;
  res.redirect(302, `/desk/${shop.slug}`);
});

const DESK_PAGES = { today: todayPage, orders: ordersPage, door: doorPage, couriers: couriersPage } as const;

app.get(["/desk/:slug", "/desk/:slug/:view"], (req, res, next) => {
  const params = req.params as { slug: string; view?: string };
  const shop = findShop(params.slug);
  const view = (params.view ?? "today") as DeskView;
  if (!shop || !(view in DESK_PAGES || view === "reports")) {
    next();
    return;
  }
  const desk = shopDesk(shop);
  if (view === "reports") {
    const boot = {
      api: `/desk/${shop.slug}/api`,
      shop: shop.slug,
      // A browser licence key is meant to ship to the browser. Without one the builder runs as AG Studio's evaluation.
      licenseKey: process.env.AG_STUDIO_LICENSE_KEY?.trim() || null,
      agent: { enabled: deskAgentOn(), note: deskAgentNote() },
    };
    res.send(reportsPage(shop, desk, boot, fs.existsSync(DESK_BUNDLE) ? "/assets/desk/desk.js" : null));
    return;
  }
  res.send(DESK_PAGES[view as keyof typeof DESK_PAGES](shop, desk));
});

app.get("/desk/:slug/api", (req, res, next) => {
  const shop = findShop(req.params.slug);
  if (!shop) {
    next();
    return;
  }
  res.set("Cache-Control", "no-store").json(shopDesk(shop));
});

/** The report builder's data, for this shop only. */
app.get("/desk/:slug/api/desk", (req, res, next) => {
  const shop = findShop(req.params.slug);
  if (!shop) {
    next();
    return;
  }
  res.set("Cache-Control", "no-store").json(deskSnapshot(shop.slug));
});
app.post("/desk/:slug/api/llm", express.json({ limit: "2mb" }), deskTurn);

/**
 * The desk's buttons. Each is checked again here, whatever the page showed: a refund only through the clerk's checked
 * path, a cancel only for this shop's unpaid order, a report only for a pass seen at this shop.
 */
app.post("/desk/:slug/api/act", express.json({ limit: "8kb" }), async (req, res) => {
  const shop = findShop(req.params.slug);
  if (!shop) {
    res.status(404).json({ error: "No such shop." });
    return;
  }
  const body = (req.body ?? {}) as Record<string, unknown>;
  const str = (key: string) => (typeof body[key] === "string" ? (body[key] as string).slice(0, 200) : "");
  const order = str("orderId") ? db.get<Order>("orders", str("orderId")) : undefined;
  const ours = order && (order.shop ?? "juniper") === shop.slug ? order : undefined;
  const fail = (status: number, error: string) => void res.status(status).json({ error });
  switch (str("act")) {
    case "confirm": {
      const out = await confirmAction(str("actionId"), shop.slug).catch(() => ({
        ok: false as const,
        status: 500,
        error: "The refund didn't go through.",
      }));
      if (!out.ok) return fail(out.status, out.error);
      res.json({ ok: true, message: `Refunded $${out.refund.amount}. The courier sees it on its errand.` });
      return;
    }
    case "decline":
      if (!declineAction(str("actionId"), shop.slug)) return fail(404, "That proposal is gone.");
      res.json({ ok: true, message: "Declined. Nothing was refunded." });
      return;
    case "cancel":
      if (ours?.status !== "awaiting_approval") return fail(409, "Only an unpaid order at this shop can be cancelled.");
      await cancelOrder(ours);
      res.json({ ok: true, message: "Cancelled. The errand has its budget back." });
      return;
    case "refund_rest":
    case "refund_all": {
      if (!ours) return fail(404, "No such order at this shop.");
      // Either way it's what's left of the payment; only the note to the customer differs.
      const made = proposeRefund(
        ours.id,
        shop.slug,
        ours.refundedCents ? "We've refunded the rest of your order." : "We've refunded your order in full.",
      );
      if ("problem" in made) return fail(409, made.problem);
      dismiss(shop.slug, `return:${ours.id}`);
      res.json({ ok: true, message: `The clerk proposes refunding $${made.amount}. Confirm it to send it.` });
      return;
    }
    case "report": {
      const visaId = str("visaId");
      const here = (row: { shop?: string; visaId?: string | null }) =>
        row.visaId === visaId && (row.shop ?? "juniper") === shop.slug;
      const seen =
        db.list<Order>("orders", here, 1).length > 0 || db.list<RequestLogEntry>("requests", here, 1).length > 0;
      if (!visaId || !seen) return fail(404, "That courier hasn't been to this shop.");
      const out = await reportCourier(visaId, shop, "desk");
      if (!out.ok) return fail(502, "Courier didn't take the report. Try again.");
      res.json({ ok: true, message: "Reported. Its pass is suspended at every shop." });
      return;
    }
    case "ok":
    case "dismiss": {
      const need = str("need");
      if (!/^(unpaid|return|door):/.test(need)) return fail(400, "Nothing to dismiss.");
      dismiss(shop.slug, need);
      res.json({ ok: true, message: "Done." });
      return;
    }
    default:
      fail(400, "Unknown action.");
  }
});

/** The owner's clerk, for this shop alone. Its refunds are proposals that land in Needs you. */
app.post("/desk/:slug/api/clerk", express.json({ limit: "64kb" }), async (req, res) => {
  const shop = findShop(req.params.slug);
  const messages = ownerMessages(req.body);
  if (!shop || messages.at(-1)?.role !== "user") {
    res.status(400).json({ error: "Send messages: [{role, content}], ending with the owner's." });
    return;
  }
  try {
    res.json(await ownerClerk(messages, shop.slug));
  } catch (error) {
    console.error("[clerk] owner chat failed", error);
    res.status(500).json({ error: "The clerk couldn't answer that." });
  }
});

app.get("/merchant/api/desk", (_req, res) => {
  res.set("Cache-Control", "no-store").json(deskSnapshot());
});

app.post("/merchant/api/llm", express.json({ limit: "2mb" }), deskTurn);

app.get("/merchant/ledger", (_req, res) => {
  const orders = db.list<Order>("orders").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const requests = db.list<RequestLogEntry>("requests", undefined, 300).sort((a, b) => b.at.localeCompare(a.at));
  res.send(merchantDashboard(orders, requests));
});

app.post("/merchant/report/:visaId", express.urlencoded({ extended: false }), async (req, res) => {
  const order = db.list<Order>("orders", (o) => o.visaId === req.params.visaId, 1)[0];
  await reportCourier(req.params.visaId, findShop(order?.shop) ?? JUNIPER, "ledger");
  res.redirect(303, "/merchant/ledger");
});

/** The last 30 turns of an owner's chat, as the clerk takes them. */
function ownerMessages(body: unknown): OwnerMessage[] {
  const raw = (body as { messages?: unknown })?.messages;
  return Array.isArray(raw)
    ? raw
        .slice(-30)
        .filter(
          (m): m is OwnerMessage =>
            Boolean(m) &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string" &&
            m.content.trim(),
        )
        .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    : [];
}

/**
 * The owner's clerk over HTTP: it reads orders, parcels, returns and PayPal transactions, and can only propose a refund.
 * The owner confirms it with the second route, where the limits are checked again. `shop` scopes it to one shop.
 */
app.post("/merchant/api/clerk", express.json({ limit: "64kb" }), async (req, res) => {
  const shop = typeof req.body?.shop === "string" && findShop(req.body.shop) ? (req.body.shop as string) : undefined;
  const messages = ownerMessages(req.body);
  if (messages.at(-1)?.role !== "user") {
    res.status(400).json({ error: "Send messages: [{role, content}], ending with the owner's." });
    return;
  }
  try {
    res.json(await ownerClerk(messages, shop));
  } catch (error) {
    console.error("[clerk] owner chat failed", error);
    res.status(500).json({ error: "The clerk couldn't answer that." });
  }
});

app.post("/merchant/api/clerk/confirm", express.json({ limit: "8kb" }), async (req, res) => {
  const shop = typeof req.body?.shop === "string" && findShop(req.body.shop) ? (req.body.shop as string) : undefined;
  const out = await confirmAction(String(req.body?.actionId ?? ""), shop).catch((error) => {
    console.error("[clerk] confirm failed", error);
    return { ok: false as const, status: 500, error: "The refund didn't go through." };
  });
  if (!out.ok) {
    res.status(out.status).json({ error: out.error });
    return;
  }
  res.json(out);
});

/** A receipt the person can open from their chat. The key is the only credential, and it shows no personal data. */
app.get("/receipts/:key", async (req, res) => {
  const found = db.list<Order>("orders", (o) => o.receiptKey === req.params.key, 1)[0];
  res.set("X-Robots-Tag", "noindex").set("Referrer-Policy", "no-referrer");
  if (!found) {
    res.status(404).send(receiptPage(undefined));
    return;
  }
  const order = found.status === "awaiting_approval" ? await settleOrder(found.id).catch(() => found) : found;
  res.send(receiptPage(order));
});

/* ---------------- PayPal return / cancel / webhooks ---------------- */

app.get("/paypal/return", async (req, res) => {
  const orderId = String(req.query.token ?? "");
  try {
    const order = await settleOrder(orderId);
    res.send(
      paymentResult(
        order,
        order.status === "paid",
        order.status === "paid"
          ? "Your courier's purchase is paid, and it's in your Courier home."
          : `The order is ${order.status}.`,
      ),
    );
  } catch (error) {
    console.error("[store] settle failed", error);
    res
      .status(400)
      .send(paymentResult(db.get<Order>("orders", orderId), false, "We couldn't confirm this payment with PayPal."));
  }
});

app.get("/paypal/cancel", async (req, res) => {
  const orderId = String(req.query.token ?? "");
  const order = db.get<Order>("orders", orderId);
  if (order && order.status === "awaiting_approval") await cancelOrder(order);
  res.send(
    paymentResult(order, false, "You cancelled the payment. Nothing was charged, and your errand's budget is back."),
  );
});

app.post("/webhooks/paypal", express.json({ limit: "1mb" }), async (req, res) => {
  const headers = Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const valid = await paypal.verifyWebhook(headers, req.body).catch(() => false);
  if (!valid) {
    res.status(400).json({ error: "invalid signature" });
    return;
  }
  const event = req.body as { event_type: string; resource: any };
  // Handlers are idempotent: PayPal may deliver an event more than once.
  try {
    if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
      await settleOrder(event.resource.id);
    } else if (event.event_type === "CUSTOMER.DISPUTE.CREATED") {
      const customId = event.resource?.disputed_transactions?.[0]?.custom;
      const order = db.list<Order>("orders", (o) => o.visaId === customId)[0];
      if (order) db.put("orders", order.id, { ...order, disputed: true });
    }
  } catch (error) {
    console.warn("[webhook] handler failed", (error as Error).message);
  }
  res.json({ ok: true });
});

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, paypal: paypal.mode });
});

// Last, so a shop's address can't shadow the routes above.
app.get("/:slug", (req, res, next) => {
  const shop = findShop(req.params.slug);
  if (!shop) {
    next();
    return;
  }
  res.send(storefront(shop, shelfOf(shop.slug), typeof req.query.c === "string" ? req.query.c : ""));
});

// A page a person can read for any address nothing above answered; machines still get a 404 status.
app.get("/{*rest}", (_req, res) => {
  res.status(404).send(notFoundPage());
});

app.listen(config.store.port, config.bindHost, () => {
  console.log(`${SHOPS.length} shops → ${config.store.url}`);
});
startDeliveries();
