import { config, html, type RawHtml, raw } from "@courier/shared";
import type { Human } from "../db.ts";
import { cpage } from "./shared.ts";

/*
 * Developers: how a shop serves couriers with the Courier Shops SDK. Laid out like the docs people already know, a
 * menu on the left, the page in the middle and its sections on the right, in Courier's own type and colours.
 */

const REPO = "https://github.com/Djbrl/courier";
const SDK = `${REPO}/tree/main/sdk`;
const APIMATIC = "https://www.apimatic.io";

type Code = { ts?: string; py?: string; sh?: string; file?: string };

/** A code block. With both languages it gets tabs, and every block on the page follows the one you pick. */
function code(c: Code): RawHtml {
  const langs = (
    [
      ["ts", "TypeScript"],
      ["py", "Python"],
      ["sh", "Terminal"],
    ] as const
  ).filter(([k]) => c[k] !== undefined);
  const tabs = langs.length > 1;
  return html`<div class="dx-code" ${tabs ? raw("data-tabs") : ""}>
    <div class="dx-code-h">
      ${
        tabs
          ? html`<div role="tablist">${langs.map(
              ([k, label], i) =>
                html`<button type="button" role="tab" data-lang="${k}" aria-selected="${i === 0 ? "true" : "false"}">${label}</button>`,
            )}</div>`
          : html`<span>${c.file ?? langs[0]![1]}</span>`
      }
      <button type="button" class="dx-copy" aria-label="Copy code">Copy</button>
    </div>
    ${langs.map(
      ([k], i) => html`<pre data-lang="${k}" ${i === 0 ? "" : raw("hidden")}><code>${c[k]!.trim()}</code></pre>`,
    )}
  </div>`;
}

const h2 = (id: string, text: string) => html`<h2 id="${id}"><a href="#${id}">${text}</a></h2>`;
const note = (body: RawHtml | string) => html`<aside class="dx-note">${body}</aside>`;
const step = (n: number, title: string, body: RawHtml) =>
  html`<li class="dx-step"><span class="dx-step-n">${n}</span><div><h3>${title}</h3>${body}</div></li>`;

interface DocPage {
  slug: string;
  group: string;
  title: string;
  lead: string;
  toc: [string, string][];
  body: () => RawHtml;
}

const courier = () => config.courier.url;
const store = () => config.store.url;

const PAGES: DocPage[] = [
  {
    slug: "",
    group: "Getting started",
    title: "Introduction",
    lead: "The Courier Shops SDK lets a shop serve AI shopping agents: check who sent them, what they may spend, and take the payment through PayPal.",
    toc: [
      ["what", "What a courier is"],
      ["flow", "How a purchase works"],
      ["sdk", "The SDK"],
      ["next", "Next steps"],
    ],
    body: () => html`
      ${h2("what", "What a courier is")}
      <p>A courier is an AI agent shopping for a real person. Before it reaches your shop, the person signs in with PayPal and gives it an <b>errand</b>: what to buy, a budget, a per-item limit and an end date. Courier signs that into a token the courier shows you.</p>
      <p>You never learn who the person is. Each shop sees a different pseudonym for them (<code>sub</code>), the courier's name and the errand's limits.</p>
      ${h2("flow", "How a purchase works")}
      <ol class="dx-flow">
        <li><b>Verify</b><span>Check the courier's token against Courier's public keys.</span></li>
        <li><b>Ask</b><span>Call <code>checkSpend</code> before a hold or a checkout. Courier answers approve, deny or ask the person.</span></li>
        <li><b>Charge</b><span>Charge the person's saved PayPal, or send them PayPal's approval link.</span></li>
        <li><b>Record</b><span>Call <code>commitSpend</code> with the paid order.</span></li>
        <li><b>Follow up</b><span>Tell the errand about the parcel and any return.</span></li>
      </ol>
      <p>Courier enforces the limits in code. A model only judges whether the basket fits what the person asked for, and anything unclear goes to the person.</p>
      ${h2("sdk", "The SDK")}
      <p>The SDK covers the 13 calls a shop makes to Courier, typed for <b>TypeScript</b> and <b>Python</b>. Both are generated from one OpenAPI description of the API, so they always match the server.</p>
      <a class="dx-apimatic" href="${APIMATIC}" rel="noopener">
        <span class="dx-apimatic-k">Built with</span><b>APIMatic</b>
        <span>APIMatic generates both SDKs, their reference and their typed errors from our OpenAPI spec. One command regenerates them when the API changes.</span>
      </a>
      ${h2("next", "Next steps")}
      <div class="dx-cards">
        <a href="/docs/installation"><b>Installation</b><span>Add the SDK to a TypeScript or Python project.</span></a>
        <a href="/docs/quickstart"><b>Quickstart</b><span>Take your first courier order in five steps.</span></a>
        <a href="/docs/templates"><b>Templates</b><span>Start from a working Express or FastAPI shop.</span></a>
        <a href="/docs/reference"><b>API reference</b><span>Every call, its route and its SDK method.</span></a>
      </div>`,
  },
  {
    slug: "installation",
    group: "Getting started",
    title: "Installation",
    lead: "Add the Courier Shops SDK to your project and create a client.",
    toc: [
      ["install", "Install the SDK"],
      ["client", "Create a client"],
      ["key", "Your shop key"],
      ["regenerate", "Regenerate the SDK"],
    ],
    body: () => html`
      ${h2("install", "Install the SDK")}
      <p>The SDK lives in the <a class="link" href="${SDK}" rel="noopener">Courier repository</a>. Clone it, then install the folder for your language.</p>
      ${code({
        ts: `git clone ${REPO}.git
cd courier/sdk/typescript && npm install && npm run build
cd your-shop && npm install ../courier/sdk/typescript`,
        py: `git clone ${REPO}.git
pip install ./courier/sdk/python`,
      })}
      ${h2("client", "Create a client")}
      <p>Create one client and reuse it. Point it at Courier's shop API.</p>
      ${code({
        ts: `import { CourierShopsClient } from "courier-shops";

export const courier = new CourierShopsClient({
  shopKey: process.env.COURIER_SHOP_KEY,
  serverOptions: { baseUrl: "${courier()}/internal" },
});`,
        py: `import os
from courier_shops import CourierShopsClient

courier = CourierShopsClient(
    shop_key=os.environ["COURIER_SHOP_KEY"],
    base_url="${courier()}/internal",
)`,
      })}
      ${note(html`The Python SDK also has <code>AsyncCourierShopsClient</code> with the same methods, for asyncio servers.`)}
      ${h2("key", "Your shop key")}
      <p>Every call sends your shop key in the <code>X-Internal-Secret</code> header; the client adds it for you. Keep it on your server, in an environment variable, and never send it to a browser or an agent.</p>
      ${h2("regenerate", "Regenerate the SDK")}
      <p>The SDKs are generated by <a class="link" href="${APIMATIC}" rel="noopener">APIMatic</a> from <code>sdk/src/spec/openapi.json</code>. After a change to the API, validate the spec and generate both languages again.</p>
      ${code({
        sh: `npx @apimatic/cli auth login
npm run sdk:validate
npm run sdk`,
      })}
      <p>A unit test fails if the spec and the routes Courier serves drift apart.</p>`,
  },
  {
    slug: "quickstart",
    group: "Getting started",
    title: "Quickstart",
    lead: "Take a courier's order from token to paid, in five steps.",
    toc: [
      ["steps", "Steps"],
      ["decisions", "The three decisions"],
    ],
    body: () => html`
      ${h2("steps", "Steps")}
      <ol class="dx-steps">
        ${step(
          1,
          "Verify the courier",
          html`<p>The courier sends a bearer token. Verify it against Courier's keys, with your shop's resource URL as the audience.</p>
          ${code({
            ts: `import { createRemoteJWKSet, jwtVerify } from "jose";

const keys = createRemoteJWKSet(new URL("${courier()}/jwks.json"));

const { payload } = await jwtVerify(token, keys, {
  issuer: "${courier()}",
  audience: "${store()}/your-shop/mcp",
  typ: "at+jwt",
});
const { sub, visa } = payload; // a pseudonym and the errand`,
            py: `import jwt

keys = jwt.PyJWKClient("${courier()}/jwks.json")
claims = jwt.decode(
    token,
    keys.get_signing_key_from_jwt(token).key,
    algorithms=["ES256", "RS256"],
    issuer="${courier()}",
    audience="${store()}/your-shop/mcp",
)
sub, visa = claims["sub"], claims["visa"]  # a pseudonym and the errand`,
          })}`,
        )}
        ${step(
          2,
          "Ask before you charge",
          html`<p>Send the basket to <code>checkSpend</code>. Courier checks the limits and the fit with the errand.</p>
          ${code({
            ts: `const decision = await courier.spending.checkSpend({
  body: {
    visaId: visa.id,
    sub,
    resource: "${store()}/your-shop/mcp",
    action: "checkout",
    items: [{ title: "Double Smash Burger", category: "food", priceCents: 1150 }],
    totalCents: 1150,
  },
});`,
            py: `decision = courier.spending.check_spend({
    "visa_id": visa["id"],
    "sub": sub,
    "resource": "${store()}/your-shop/mcp",
    "action": "checkout",
    "items": [{"title": "Double Smash Burger", "category": "food", "price_cents": 1150}],
    "total_cents": 1150,
})`,
          })}`,
        )}
        ${step(
          3,
          "Charge the person",
          html`<p>When the decision is <code>approve</code> and says <code>autopay</code>, charge the person's saved PayPal. Otherwise create a PayPal order and give the courier its approval link.</p>
          ${code({
            ts: `if (decision.decision === "approve" && decision.autopay) {
  await courier.spending.chargeSavedPaypal({
    body: { visaId: visa.id, holdId: decision.holdId, description: "Order 1042", brandName: "Your Shop" },
  });
}`,
            py: `if decision.decision == "approve" and decision.autopay:
    courier.spending.charge_saved_paypal({
        "visa_id": visa["id"],
        "hold_id": decision.hold_id,
        "description": "Order 1042",
        "brand_name": "Your Shop",
    })`,
          })}`,
        )}
        ${step(
          4,
          "Record the order",
          html`<p>Once paid, commit the spend so the errand's budget goes down and the person sees the order.</p>
          ${code({
            ts: `await courier.spending.commitSpend({
  body: { visaId: visa.id, holdId: decision.holdId, orderId: "1042", amountCents: 1150, summary: "Double Smash Burger" },
});`,
            py: `courier.spending.commit_spend({
    "visa_id": visa["id"],
    "hold_id": decision.hold_id,
    "order_id": "1042",
    "amount_cents": 1150,
    "summary": "Double Smash Burger",
})`,
          })}`,
        )}
        ${step(
          5,
          "Tell the errand what happens next",
          html`<p>As the parcel moves, update it. The person follows it in their chat.</p>
          ${code({
            ts: `await courier.afterSale.updateParcel({
  body: { visaId: visa.id, orderId: "1042", stage: 1, labels: ["Packed", "On its way", "Delivered"] },
});`,
            py: `courier.after_sale.update_parcel({
    "visa_id": visa["id"],
    "order_id": "1042",
    "stage": 1,
    "labels": ["Packed", "On its way", "Delivered"],
})`,
          })}`,
        )}
      </ol>
      ${h2("decisions", "The three decisions")}
      <table class="dx-table">
        <thead><tr><th>Decision</th><th>What it means</th><th>What you do</th></tr></thead>
        <tbody>
          <tr><td><code>approve</code></td><td>Within the limits and on the errand. Comes with a <code>holdId</code>.</td><td>Charge, then commit.</td></tr>
          <tr><td><code>ask_human</code></td><td>Courier isn't sure it fits. Comes with an <code>approvalUrl</code>.</td><td>Give the courier the link and wait with <code>getApproval</code>.</td></tr>
          <tr><td><code>deny</code></td><td>Over a limit, off the errand or called back. Comes with a <code>code</code>.</td><td>Refuse the order and pass the reason on.</td></tr>
        </tbody>
      </table>`,
  },
  {
    slug: "guides",
    group: "Guides",
    title: "After the sale",
    lead: "Keep the person in the loop on parcels and returns, and report a courier that misbehaves.",
    toc: [
      ["parcels", "Parcels"],
      ["returns", "Returns"],
      ["release", "Give a hold back"],
      ["report", "Report a courier"],
    ],
    body: () => html`
      ${h2("parcels", "Parcels")}
      <p>Send each step of the delivery. <code>labels</code> names every step; <code>stage</code> is the one you're at.</p>
      ${code({
        ts: `await courier.afterSale.updateParcel({
  body: { visaId, orderId, stage: 2, labels: ["Packed", "On its way", "Delivered"] },
});`,
        py: `courier.after_sale.update_parcel({
    "visa_id": visa_id, "order_id": order_id, "stage": 2,
    "labels": ["Packed", "On its way", "Delivered"],
})`,
      })}
      ${h2("returns", "Returns")}
      <p>Tell the errand what you decided: a full refund, a partial one or a decline, with a note for the person.</p>
      ${code({
        ts: `await courier.afterSale.updateReturn({
  body: { visaId, orderId, decision: "full", note: "Sorry about that. We've refunded the order." },
});`,
        py: `courier.after_sale.update_return({
    "visa_id": visa_id, "order_id": order_id, "decision": "full",
    "note": "Sorry about that. We've refunded the order.",
})`,
      })}
      ${h2("release", "Give a hold back")}
      <p>If an approved order doesn't go through, release its hold so the budget comes back.</p>
      ${code({
        ts: "await courier.spending.releaseHold({ body: { holdId } });",
        py: 'courier.spending.release_hold({"hold_id": hold_id})',
      })}
      ${h2("report", "Report a courier")}
      <p>A courier that floods your shop or tries to buy around its limits can be reported. Courier suspends its errand at once, for every shop.</p>
      ${code({
        ts: `await courier.reports.reportCourier({ body: { visaId, reason: "Flooding the catalog" } });`,
        py: 'courier.reports.report_courier({"visa_id": visa_id, "reason": "Flooding the catalog"})',
      })}`,
  },
  {
    slug: "templates",
    group: "Guides",
    title: "Templates",
    lead: "Working starting points: a shop server in each language, and the demo shops that run on the SDK.",
    toc: [
      ["express", "Express shop (TypeScript)"],
      ["fastapi", "FastAPI shop (Python)"],
      ["demo", "The demo shops"],
    ],
    body: () => html`
      ${h2("express", "Express shop (TypeScript)")}
      <p>A checkout endpoint that verifies the courier, asks Courier and charges the saved PayPal.</p>
      ${code({
        file: "server.ts",
        ts: `import express from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { CourierShopsClient } from "courier-shops";

const COURIER = "${courier()}";
const RESOURCE = "${store()}/your-shop/mcp";
const keys = createRemoteJWKSet(new URL(\`\${COURIER}/jwks.json\`));
const courier = new CourierShopsClient({
  shopKey: process.env.COURIER_SHOP_KEY,
  serverOptions: { baseUrl: \`\${COURIER}/internal\` },
});

const app = express();
app.use(express.json());

app.post("/checkout", async (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer /, "") ?? "";
  const { payload } = await jwtVerify(token, keys, { issuer: COURIER, audience: RESOURCE, typ: "at+jwt" });
  const visa = payload.visa as { id: string };
  const { items, totalCents } = req.body;

  const decision = await courier.spending.checkSpend({
    body: { visaId: visa.id, sub: payload.sub!, resource: RESOURCE, action: "checkout", items, totalCents },
  });
  if (decision.decision === "deny") return res.status(403).json({ error: decision.reason });
  if (decision.decision === "ask_human") return res.status(202).json({ approve: decision.approvalUrl });

  const orderId = crypto.randomUUID();
  await courier.spending.chargeSavedPaypal({
    body: { visaId: visa.id, holdId: decision.holdId!, description: \`Order \${orderId}\`, brandName: "Your Shop" },
  });
  await courier.spending.commitSpend({
    body: { visaId: visa.id, holdId: decision.holdId!, orderId, amountCents: totalCents, summary: "Your order" },
  });
  res.json({ orderId });
});

app.listen(3000);`,
      })}
      ${h2("fastapi", "FastAPI shop (Python)")}
      <p>The same endpoint in Python.</p>
      ${code({
        file: "main.py",
        py: `import os, uuid
import jwt
from fastapi import FastAPI, Header, HTTPException
from courier_shops import CourierShopsClient

COURIER = "${courier()}"
RESOURCE = "${store()}/your-shop/mcp"
keys = jwt.PyJWKClient(f"{COURIER}/jwks.json")
courier = CourierShopsClient(shop_key=os.environ["COURIER_SHOP_KEY"], base_url=f"{COURIER}/internal")
app = FastAPI()

@app.post("/checkout")
def checkout(body: dict, authorization: str = Header()):
    token = authorization.removeprefix("Bearer ")
    claims = jwt.decode(token, keys.get_signing_key_from_jwt(token).key,
                        algorithms=["ES256", "RS256"], issuer=COURIER, audience=RESOURCE)
    visa_id = claims["visa"]["id"]

    decision = courier.spending.check_spend({
        "visa_id": visa_id, "sub": claims["sub"], "resource": RESOURCE, "action": "checkout",
        "items": body["items"], "total_cents": body["total_cents"],
    })
    if decision.decision == "deny":
        raise HTTPException(403, decision.reason)
    if decision.decision == "ask_human":
        return {"approve": decision.approval_url}

    order_id = str(uuid.uuid4())
    courier.spending.charge_saved_paypal({
        "visa_id": visa_id, "hold_id": decision.hold_id,
        "description": f"Order {order_id}", "brand_name": "Your Shop",
    })
    courier.spending.commit_spend({
        "visa_id": visa_id, "hold_id": decision.hold_id, "order_id": order_id,
        "amount_cents": body["total_cents"], "summary": "Your order",
    })
    return {"order_id": order_id}`,
      })}
      ${h2("demo", "The demo shops")}
      <p>Every demo shop runs on the TypeScript SDK, through one client. Read it for a full shop: browsing, holds, PayPal, parcels, returns and the shop desk.</p>
      <div class="dx-cards">
        <a href="${REPO}/blob/main/apps/store/src/courier-api.ts" rel="noopener"><b>courier-api.ts</b><span>The demo shops' one client for every call to Courier.</span></a>
        <a href="${store()}" rel="noopener"><b>Try the shops</b><span>20 demo shops that welcome couriers.</span></a>
      </div>`,
  },
  {
    slug: "reference",
    group: "Reference",
    title: "API reference",
    lead: "Every call a shop makes to Courier, with its route and its method in each SDK.",
    toc: [
      ["calls", "Calls"],
      ["errors", "Errors"],
      ["full", "Full reference"],
    ],
    body: () => html`
      ${h2("calls", "Calls")}
      <table class="dx-table dx-ref">
        <thead><tr><th>Call</th><th>Route</th><th>TypeScript</th><th>Python</th></tr></thead>
        <tbody>${REFERENCE.map(
          ([group, label, method, path, ts, py]) =>
            html`<tr><td><b>${label}</b><small>${group}</small></td><td><span class="dx-verb ${method.toLowerCase()}">${method}</span> <code>${path}</code></td><td><code>${ts}</code></td><td><code>${py}</code></td></tr>`,
        )}</tbody>
      </table>
      ${h2("errors", "Errors")}
      <p>A call that fails throws a typed error. In TypeScript, read <code>err.payload.kind</code>, or call <code>.asApiResult()</code> to get a result instead of an exception. In Python, catch <code>ApiError</code> and read <code>e.error</code>.</p>
      ${code({
        ts: `const result = await courier.errands.getErrand({ visaId }).asApiResult();
if (!result.ok) console.warn(result.payload.kind, result.message);`,
        py: `from courier_shops.core.exceptions import ApiError

try:
    errand = courier.errands.get_errand(visa_id)
except ApiError as e:
    print(e.error)`,
      })}
      ${h2("full", "Full reference")}
      <p>Each SDK ships a generated reference with every parameter, model and error type.</p>
      <div class="dx-cards">
        <a href="${REPO}/blob/main/sdk/typescript/api-reference.md" rel="noopener"><b>TypeScript reference</b><span>Generated by APIMatic.</span></a>
        <a href="${REPO}/blob/main/sdk/python/api-reference.md" rel="noopener"><b>Python reference</b><span>Generated by APIMatic.</span></a>
        <a href="${REPO}/blob/main/sdk/src/spec/openapi.json" rel="noopener"><b>OpenAPI spec</b><span>The one description both SDKs come from.</span></a>
      </div>`,
  },
];

const REFERENCE: [string, string, string, string, string, string][] = [
  ["Errands", "Get an errand", "GET", "/visas/{visaId}", "errands.getErrand", "errands.get_errand"],
  [
    "Connections",
    "Get a connection",
    "GET",
    "/connections/{id}",
    "connections.getConnection",
    "connections.get_connection",
  ],
  [
    "Connections",
    "Ask for an errand",
    "POST",
    "/connections/{id}/ticket",
    "connections.requestTicket",
    "connections.request_ticket",
  ],
  ["Spending", "Check a spend", "POST", "/spend/check", "spending.checkSpend", "spending.check_spend"],
  [
    "Spending",
    "Charge saved PayPal",
    "POST",
    "/spend/charge",
    "spending.chargeSavedPaypal",
    "spending.charge_saved_paypal",
  ],
  ["Spending", "Commit a spend", "POST", "/spend/commit", "spending.commitSpend", "spending.commit_spend"],
  ["Spending", "Release a hold", "POST", "/spend/release", "spending.releaseHold", "spending.release_hold"],
  ["Approvals", "Get an approval", "GET", "/approvals/{id}", "approvals.getApproval", "approvals.get_approval"],
  [
    "Approvals",
    "Record an approval",
    "POST",
    "/approvals/{id}/decide",
    "approvals.recordApproval",
    "approvals.record_approval",
  ],
  ["After sale", "Add a step", "POST", "/stamps", "afterSale.addStep", "after_sale.add_step"],
  ["After sale", "Update a parcel", "POST", "/shipments", "afterSale.updateParcel", "after_sale.update_parcel"],
  ["After sale", "Update a return", "POST", "/returns", "afterSale.updateReturn", "after_sale.update_return"],
  ["Reports", "Report a courier", "POST", "/report", "reports.reportCourier", "reports.report_courier"],
];

export const docSlugs = new Set(PAGES.map((p) => p.slug));

export function docsPage(human: Human | null, slug: string): string {
  const at = PAGES.findIndex((p) => p.slug === slug);
  const page = PAGES[at]!;
  const prev = PAGES[at - 1];
  const next = PAGES[at + 1];
  const href = (p: DocPage) => (p.slug ? `/docs/${p.slug}` : "/docs");
  const groups = [...new Set(PAGES.map((p) => p.group))];
  const menu = html`${groups.map(
    (g) =>
      html`<div class="dx-group"><b>${g}</b>${PAGES.filter((p) => p.group === g).map(
        (p) => html`<a href="${href(p)}" ${p === page ? raw('aria-current="page"') : ""}>${p.title}</a>`,
      )}</div>`,
  )}`;
  return cpage(
    `${page.title} · Developers`,
    human,
    html`<div class="dx">
      <nav class="dx-side" aria-label="Developers">
        <details class="dx-menu"><summary>${page.group} <span>/</span> ${page.title}</summary>${menu}</details>
        <div class="dx-menu-wide">${menu}</div>
        <a class="dx-side-am" href="${APIMATIC}" rel="noopener">SDKs built with <b>APIMatic</b></a>
      </nav>
      <main class="dx-main">
        <p class="dx-eyebrow">${page.group}</p>
        <h1>${page.title}</h1>
        <p class="dx-lead">${page.lead}</p>
        <div class="dx-body">${page.body()}</div>
        <nav class="dx-pn" aria-label="Previous and next">
          ${prev ? html`<a href="${href(prev)}"><small>Previous</small><b>← ${prev.title}</b></a>` : html`<span></span>`}
          ${next ? html`<a class="next" href="${href(next)}"><small>Next</small><b>${next.title} →</b></a>` : ""}
        </nav>
      </main>
      <aside class="dx-toc" aria-label="On this page">
        <b>On this page</b>
        ${page.toc.map(([id, label]) => html`<a href="#${id}">${label}</a>`)}
      </aside>
    </div>`,
    { here: "/docs", bodyClass: "dx-page", scripts: ["/assets/docs.js"] },
  );
}
