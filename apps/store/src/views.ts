import fs from "node:fs";
import path from "node:path";
import {
  afterSaleOf,
  config,
  courierLayout,
  courierVars,
  findShop,
  html,
  JUNIPER,
  LOGO,
  money,
  PP,
  paypalFor,
  portrait,
  type RawHtml,
  ROOT_DIR,
  raw,
  returnsShort,
  SHOPS,
  type Shop,
  shopLogo,
  timeAgo,
} from "@courier/shared";
import { itemArt } from "./art.ts";
import type { RequestLogEntry } from "./auth.ts";
import { findItem, type Item } from "./catalog.ts";
import type { Order } from "./db.ts";
import { colorFor } from "./desk.ts";

/* The shops' pages, in the Courier design system: the logo grid, each shop's shelf, and what shops see of couriers. */

const NOT_REAL = "Demo shops with made-up names and products, not affiliated with any real brand.";

function storeNav(view: "shop" | "merchant", shop?: Shop): RawHtml {
  return html`<header class="cnav jr-nav">
    ${
      shop
        ? html`<a class="jr" href="/${shop.slug}">${shopLogo(shop, "sm")}<div><b>${shop.name}</b><small>${shop.sells}</small></div></a>`
        : html`<span class="jr jr-home"><a href="${config.courier.url}" aria-label="Courier home">${LOGO}</a><a class="jr-tag" href="/">Shops</a></span>`
    }
    <nav>
      ${
        // A shopper on a phone still needs a way back to the other shops, so this link stays when the nav folds.
        shop
          ? html`<a class="jr-all" href="/"><span aria-hidden="true">←</span> All shops</a>`
          : html`<a class="hide-sm" href="/" ${view === "shop" ? raw('aria-current="page"') : ""}>All shops</a>`
      }
      ${view === "merchant" ? html`<a class="hide-sm" href="/merchant" aria-current="page">Shop desk</a>` : ""}
      ${shop ? "" : html`<a class="hide-sm" href="/desk/sign-in">For shop owners</a><a class="welcome" href="${config.courier.url}">Get a courier</a>`}
      ${shop ? html`<a class="welcome" href="${config.courier.url}">${LOGO}<span>couriers welcome</span></a>` : ""}
    </nav>
  </header>`;
}

function storePage(
  title: string,
  view: "shop" | "merchant",
  body: RawHtml,
  opts: { scripts?: string[]; styles?: string[]; shop?: Shop } = {},
): string {
  return courierLayout({
    title: opts.shop && title !== opts.shop.name ? `${title} · ${opts.shop.name}` : `${title} · Courier shops`,
    nav: storeNav(view, opts.shop),
    body,
    bodyClass: `jr-page jr-${view}`,
    scripts: opts.scripts,
    styles: opts.styles,
  });
}

/** Every shop as a logo: the front door people recognise. */
export function shopGrid(): string {
  return storePage(
    "All shops",
    "shop",
    html`<main class="sx">
      <header class="sx-h">
        <h1>Shops that welcome couriers</h1>
        <p>${SHOPS.length} shops. Ask Claude for something and your courier shops here with a verified ID and your budget.</p>
      </header>
      <ul class="sx-grid" aria-label="Shops">${SHOPS.map(
        (s) =>
          html`<li><a class="sx-c" href="/${s.slug}" style="--tile:${s.tile}">
            <span class="sx-ph">${BANNERS.has(s.slug) ? html`<img src="/assets/banners/${s.slug}.jpg" alt="" loading="lazy">` : ""}</span>
            <span class="sx-id">${shopLogo(s, "sm")}<span><b>${s.name}</b><small>${s.sells}</small></span></span>
          </a></li>`,
      )}</ul>
      ${ownerLine("/desk/sign-in", "Run one of these shops? Open its desk")}
      <p class="fine">${NOT_REAL}</p>
    </main>`,
  );
}

/** The way into a shop's back office, kept out of the shopper's nav: it's for whoever runs the shop. */
const ownerLine = (href: string, label: string) =>
  html`<p class="sf-own"><a class="link" href="${href}">${label} →</a></p>`;

/** What a courier can count on here, folded into the shop's one line of details. */
function promiseLine(shop: Shop, count: number): RawHtml {
  const policy = afterSaleOf(shop.slug);
  return html`<p class="sf-meta"><span class="sf-open">Open now</span> · ${count} items · ${returnsShort(policy)} · Pays with ${PP}</p>`;
}

/** A styled page for an address that isn't a shop, an item or a receipt. */
export function notFoundPage(): string {
  return storePage(
    "Not found",
    "shop",
    html`<main class="solo"><div class="solo-card">
      <h1 class="big">No shop here.</h1>
      <p class="lead">This address doesn’t match any of the shops. The name may be spelled differently.</p>
      <div class="acts-row"><a class="btn" href="/">See all shops</a></div>
      <p class="fine" style="margin-top:22px">${NOT_REAL}</p>
    </div></main>`,
  );
}

/* A shop with a photo in assets/banners shows it across its banner; the others keep their drawn shelf. */
const BANNER_DIR = path.join(ROOT_DIR, "packages/shared/assets/banners");
const BANNERS = new Set(
  fs.existsSync(BANNER_DIR)
    ? fs
        .readdirSync(BANNER_DIR)
        .filter((f) => f.endsWith(".jpg"))
        .map((f) => f.slice(0, -4))
    : [],
);

function banner(shop: Shop, items: Item[]): RawHtml {
  if (BANNERS.has(shop.slug))
    return html`<div class="sf-banner sf-photo" aria-hidden="true"><img src="/assets/banners/${shop.slug}.jpg" alt="" fetchpriority="high"></div>`;
  return html`<div class="sf-banner" aria-hidden="true"><div class="sf-peek">${items.slice(0, 3).map((i) => html`<span class="sf-cv">${itemArt(i, shop.slug)}</span>`)}</div></div>`;
}

const labelFor = (category: string) => category[0]!.toUpperCase() + category.slice(1);

/** A shop front in the shape people know from delivery apps: a banner, the shop's card, a menu, then the shelves. */
export function storefront(shop: Shop, items: Item[], category = ""): string {
  const categories = [...new Set(items.map((i) => i.category))];
  const shown = categories.filter((c) => !category || c === category);
  // A picture, a name and a price: the rest is for the item's own page and the courier's questions.
  const card = (i: Item) =>
    html`<li class="sf-c" title="${i.blurb}"><span class="sf-cv">${itemArt(i, shop.slug)}</span><b>${i.title}</b><span class="pr">${money(i.priceCents)}</span></li>`;
  return storePage(
    shop.name,
    "shop",
    html`<main class="sf" style="--tile:${shop.tile}">
      <section class="sf-hero">
        ${banner(shop, items)}
        <div class="sf-id">${shopLogo(shop, "lg")}
          <div><h1>${shop.name}</h1><p>${shop.sells}</p>${promiseLine(shop, items.length)}</div>
          <a class="sf-owner" href="/desk/sign-in?shop=${shop.slug}"><small>Are you the owner?</small><b>Open the shop desk <span aria-hidden="true">→</span></b></a>
        </div>
      </section>
      <div class="sf-body">
        <nav class="sf-menu" aria-label="Menu">
          <a href="/${shop.slug}" ${category ? "" : raw('aria-current="true"')}>Everything</a>
          ${categories.map((c) => html`<a href="/${shop.slug}?c=${encodeURIComponent(c)}" ${c === category ? raw('aria-current="true"') : ""}>${labelFor(c)}</a>`)}
        </nav>
        <div class="sf-secs">
          ${shown.map(
            (c) =>
              html`<section><h2>${labelFor(c)}</h2><ul class="sf-cards">${items.filter((i) => i.category === c).map(card)}</ul></section>`,
          )}
          <p class="fine">${NOT_REAL}</p>
        </div>
      </div>
    </main>`,
    { shop },
  );
}

export function paymentResult(order: Order | undefined, ok: boolean, message: string): string {
  // Opened as a popup from the Courier errand room: tell it, then close. Otherwise it's a normal page.
  const handoff = order
    ? `<script>(function(){var popup=false;try{if(window.opener){window.opener.postMessage(${JSON.stringify({ type: "courier:payment", orderId: order.id, ok })},${JSON.stringify(config.courier.url)});popup=true;setTimeout(function(){window.close()},1400)}}catch(e){}
        if(!popup){document.getElementById("back").hidden=false;document.getElementById("closing").hidden=true}})()</script>`
    : "";
  return courierLayout({
    title: `${ok ? "Paid" : "Not paid"} · ${(findShop(order?.shop) ?? JUNIPER).name}`,
    bodyClass: "store-pay",
    body: html`<main class="solo"><div class="solo-card">
      <div class="big-ic" aria-hidden="true" style="background:${ok ? "var(--hivis)" : "var(--paper)"}">${ok ? "✓" : "↩"}</div>
      <h1 class="big">${ok ? "Paid." : "Not paid."}</h1>
      <p class="lead">${message}</p>
      ${
        order
          ? html`<div class="paycard" style="margin-top:26px;text-align:left">
            ${order.items.map((i) => html`<div class="li"><span>${i.title}</span><span>${money(i.priceCents)}</span></div>`)}
            <div class="tot" style="margin-bottom:0"><span>${(findShop(order.shop) ?? JUNIPER).name}</span><b>${money(order.totalCents)}</b></div></div>
            ${ok && order.receiptKey ? html`<p class="fine" style="margin-top:14px"><a class="link" href="${receiptUrl(order)}">See your receipt</a></p>` : ""}`
          : ""
      }
      <p class="fine" style="margin-top:22px" id="closing">You can close this window and go back to your courier.</p>
      ${order ? html`<div class="acts-row" id="back" hidden><a class="btn" href="${config.courier.url}/errand?order=${encodeURIComponent(order.id)}">Back to your courier${raw('<span class="go"><svg><use href="#arr"/></svg></span>')}</a></div>` : ""}
    </div></main>
    ${raw(handoff)}`,
  });
}

export const receiptUrl = (order: Order) => `${config.store.url}/receipts/${order.receiptKey}`;

/** What a person sees after their courier buys something: proof it happened, without opening anything else. */
export function receiptPage(order: Order | undefined): string {
  if (!order)
    return storePage(
      "Receipt",
      "shop",
      html`<main class="solo"><div class="solo-card"><h1 class="big">No receipt here.</h1><p class="lead">This link doesn’t match an order.</p></div></main>`,
    );
  const paid = order.status === "paid";
  const shop = findShop(order.shop) ?? JUNIPER;
  return storePage(
    paid ? "Receipt" : STATUS[order.status],
    "shop",
    html`<main class="solo"><article class="solo-card rcpt">
      <p class="rcpt-st ${paid ? "paid" : ""}">${paid ? "✓ Paid" : STATUS[order.status]}</p>
      <h1 class="big">${paid ? `${order.agent} got it.` : "Not paid yet."}</h1>
      <ul class="rcpt-items">${order.items.map((line) => {
        const item = findItem(line.id);
        return html`<li>${item ? html`<div class="cv">${itemArt(item, order.shop)}</div>` : ""}
          <div><b>${line.title}</b>${item ? html`<small>${item.artist} · ${item.category}</small>` : ""}</div>
          <span class="pr">${money(line.priceCents)}</span></li>`;
      })}</ul>
      <dl class="rcpt-facts">
        <dt>Total</dt><dd><b>${money(order.totalCents)}</b></dd>
        <dt>Paid with</dt><dd>${order.paidWith === "saved_paypal" ? html`Saved ${PP}` : PP}</dd>
        <dt>Shop</dt><dd>${shop.name}</dd>
        <dt>Bought by</dt><dd>${order.agent}, ${order.simulated ? "a demo courier" : "a verified courier"}</dd>
        <dt>Order</dt><dd><code>${order.id}</code></dd>
        ${order.paidAt ? html`<dt>When</dt><dd><time datetime="${order.paidAt}">${new Date(order.paidAt).toUTCString()}</time></dd>` : ""}
      </dl>
      <div class="acts-row">
        ${!paid && order.status === "awaiting_approval" && order.approveUrl ? html`<a class="btn" href="${order.approveUrl}">Pay with PayPal</a>` : ""}
        <a class="btn ghost" href="${config.courier.url}/app/errands?e=${order.visaId}">See it in Courier</a>
      </div>
      <p class="fine" style="margin-top:18px">${paypalNote(order)}</p>
    </article></main>`,
    { shop },
  );
}

const paypalNote = (order?: Order) =>
  ({
    live: "Live PayPal: real money moved.",
    sandbox: "PayPal sandbox: no real money moved.",
    simulated: "Simulated PayPal: no real money moved.",
  })[paypalFor(order).mode];

const STATUS: Record<Order["status"], string> = {
  awaiting_approval: "Waiting to pay",
  paid: "Paid",
  cancelled: "Cancelled",
  failed: "Failed",
};

/**
 * Demo or sandbox, by the payment path: an order for a demo person, or any order while the shop has no PayPal sandbox,
 * only ever reaches the PayPal simulator. Sandbox orders move PayPal test money. Neither is real money.
 */
const isDemoOrder = (order: Order) => paypalFor(order).mode === "simulated";

const sum = (orders: Order[]) => orders.filter((o) => o.status === "paid").reduce((s, o) => s + o.totalCents, 0);

export function merchantDashboard(orders: Order[], requests: RequestLogEntry[]): string {
  const blocked = requests.filter((r) => r.outcome === "blocked");
  const accepted = requests.filter((r) => r.outcome === "accepted");
  const demoOrders = orders.filter(isDemoOrder);
  const sandboxOrders = orders.filter((o) => !isDemoOrder(o));
  const couriers = new Set(accepted.flatMap((r) => (r.sub ? [r.sub] : [])).concat(orders.map((o) => o.sub)));
  const summary = [
    `${couriers.size} ${couriers.size === 1 ? "courier" : "couriers"}`,
    `${orders.length} ${orders.length === 1 ? "order" : "orders"}`,
    `${money(sum(sandboxOrders))} in PayPal sandbox`,
    demoOrders.length ? `${money(sum(demoOrders))} simulated` : "",
    `${blocked.length} turned away`,
  ].filter(Boolean);
  return storePage(
    "Shop ledger",
    "merchant",
    html`<main class="jr-main mdash" data-autorefresh="6000">
      <header class="md-h">
        <p class="md-back"><a href="/merchant">← Shop desk</a></p>
        <h1 class="big">Who’s shopping here?</h1>
        <p class="lead">Every courier shows a signed ID and its limits. Never the person’s name.</p>
        <p class="md-sum">${summary.join(" · ")}</p>
      </header>
      <div class="md-g">
        <section aria-label="Orders">
          <h2 class="md-t">Orders</h2>
          ${
            orders.length
              ? html`<div class="card md-list">${[...sandboxOrders, ...demoOrders].map(orderRow)}</div>
                ${demoOrders.length ? html`<p class="fine"><span class="md-demo">Demo</span> orders were paid at the PayPal simulator. No money moved.</p>` : ""}`
              : html`<div class="card pad"><p class="fine">No courier orders yet.</p></div>`
          }
        </section>
        <section aria-label="Request log">
          <h2 class="md-t">At the door</h2>
          <ul class="card md-door">${requests
            .slice(0, 14)
            .map(
              (r) =>
                html`<li class="${r.outcome === "blocked" ? "no" : ""}"><i aria-hidden="true">${r.outcome === "blocked" ? "×" : "✓"}</i><span><b>${r.agent ?? "No ID"}${r.demo ? html` <span class="md-demo">Demo</span>` : ""}</b><small>${r.reason}</small></span><time>${timeAgo(r.at)}</time></li>`,
            )}</ul>
        </section>
      </div>
    </main>`,
  );
}

/** Who stands behind the order, as far as the shop can tell from the signed ID. */
function personLine(order: Order): string {
  if (order.simulated) return "Demo person, nothing checked by PayPal";
  if (!order.evidence.humanVerified) return "Not verified";
  return isDemoOrder(order) ? "Verified at the PayPal simulator" : "Verified by PayPal sandbox";
}

function orderRow(order: Order): RawHtml {
  const visa = order.evidence.visa as {
    id: string;
    intent: string | null;
    spend_limit: { value: string };
    per_purchase_limit: { value: string };
  };
  const intent = order.evidence.intent as { model?: string; reason?: string; probability?: number } | null;
  const demo = isDemoOrder(order);
  return html`<details class="mo2${demo ? " mo-demo" : ""}">
    <summary class="cc" style="${courierVars(colorFor(order.agent))}">${portrait({ name: order.agent })}
      <span class="mo2-t"><b>${order.items.map((i) => i.title).join(", ")}</b><small>${order.agent}${demo ? html` <span class="md-demo" title="Paid at the PayPal simulator">Demo</span>` : ""} · ${(findShop(order.shop) ?? JUNIPER).name} · ${timeAgo(order.createdAt)}</small></span>
      <span class="mo2-m"><b>${money(order.totalCents)}</b><small class="s-${order.status}">${STATUS[order.status]}</small></span>
    </summary>
    <div class="mo-ev">
      <dl>
        ${visa.intent ? html`<dt>For</dt><dd>“${visa.intent}”</dd>` : ""}
        <dt>Person</dt><dd>${personLine(order)} · <code>${order.sub.slice(0, 14)}…</code></dd>
        <dt>Limits</dt><dd>$${visa.spend_limit.value} in total · $${visa.per_purchase_limit.value} each</dd>
        ${intent ? html`<dt>Check</dt><dd>${intent.model ?? "?"}${intent.probability !== undefined ? ` (${Math.round(intent.probability * 100)}%)` : ""}: ${intent.reason ?? ""}</dd>` : ""}
        <dt>Paid at</dt><dd>${demo ? "PayPal simulator: no money moved" : paypalFor(order).mode === "live" ? "Live PayPal: real money" : "PayPal sandbox: test money only"}</dd>
        <dt>Pass</dt><dd><code>${visa.id}</code></dd>
      </dl>
      <form method="post" action="/merchant/report/${visa.id}"><button class="btn danger sm" type="submit" title="Suspends this courier's pass and claims its bond, if any">Report this courier</button></form>
    </div>
  </details>`;
}

/** What the shop desk's script needs before its first fetch. Nothing in it is about a person. */
export interface DeskBoot {
  api: string;
  licenseKey: string | null;
  agent: { enabled: boolean; note: string };
}

/**
 * The shop desk: one dashboard, drawn in the browser from /merchant/api/desk. The server draws the frame, a summary
 * that reads without the script, and the way to the ledger, which keeps the "Report this courier" buttons.
 */
export function deskPage(boot: DeskBoot, bundle: string | null, summary: string[]): string {
  return storePage(
    "Shop desk",
    "merchant",
    html`<main class="dk">
      <header class="dk-h">
        <div>
          <h1>Shop desk</h1>
          <p>Every courier that came to the door, what it bought and who got turned away. A courier shows a signed ID, never the person’s name.</p>
        </div>
        <a class="btn sm" href="/merchant/ledger">Ledger and reports</a>
      </header>
      <p class="dk-sum">${summary.join(" · ")}</p>
      <div id="desk" class="dk-root" data-boot="${JSON.stringify(boot)}">
        ${
          bundle
            ? html`<p class="dk-wait">Opening the desk…</p>`
            : html`<p class="dk-wait">The desk’s script isn’t built yet. Run <code>npm run build:desk</code>, or open the <a href="/merchant/ledger">ledger</a>.</p>`
        }
      </div>
      <noscript><p class="dk-wait">The desk needs JavaScript. The <a href="/merchant/ledger">ledger</a> works without it.</p></noscript>
    </main>`,
    { scripts: bundle ? [bundle] : [] },
  );
}
