import { config, courierLayout, html, LOGO, PP, type RawHtml, raw, SHOPS, type Shop, shopLogo } from "@courier/shared";
import type { CourierFace, NeedRow, ShopDesk } from "./desk-ops.ts";

/*
 * A shop's desk: the owner's side of Courier, in the app's own frame (a cobalt rail, a page title, white cards). The
 * server draws every page whole, so it reads on a phone and without the script; on a wide screen the script swaps the
 * lists for AG Grid tables that refresh, sort, filter and act.
 */

export type DeskView = "today" | "orders" | "door" | "couriers" | "reports";

const LABEL: Record<DeskView, string> = {
  today: "Today",
  orders: "Orders",
  door: "Door",
  couriers: "Couriers",
  reports: "Reports",
};

const ICON: Record<DeskView, string> = {
  today:
    '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 6.4V10l2.4 1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  orders:
    '<svg viewBox="0 0 20 20"><path d="M4 6.5h12l-1.2 9.5H5.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  door: '<svg viewBox="0 0 20 20"><path d="M5 17V3.5h10V17M3 17h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><circle cx="12.3" cy="10.4" r="1.1" fill="currentColor"/></svg>',
  couriers:
    '<svg viewBox="0 0 20 20"><rect x="2.5" y="4" width="15" height="12" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="7.3" cy="9.3" r="1.9" fill="currentColor"/><path d="M11 9h4M11 12h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  reports:
    '<svg viewBox="0 0 20 20"><path d="M4 16V9M10 16V4M16 16v-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};

const base = (shop: Shop) => `/desk/${shop.slug}`;
const href = (shop: Shop, view: DeskView) => (view === "today" ? base(shop) : `${base(shop)}/${view}`);

/** A courier's portrait and name, the way the app draws them. */
const who = (c: CourierFace | null, sub?: string | null) =>
  c
    ? html`<span class="dk-who"><span class="pt" style="background:${c.color}" aria-hidden="true"><img src="/assets/avatars/${c.avatar}.svg" alt=""></span><span><b>${c.name}</b>${sub ? html`<small>${sub}</small>` : ""}</span></span>`
    : html`<span class="dk-who"><span class="pt dk-noid" aria-hidden="true">?</span><span><b>Unknown bot</b>${sub ? html`<small>${sub}</small>` : ""}</span></span>`;

const ACTION_LABEL: Record<NeedRow["actions"][number], string> = {
  confirm: "Confirm refund",
  decline: "Decline",
  cancel: "Cancel order",
  refund_rest: "Refund the rest",
  refund_all: "Refund in full",
  ok: "Looks right",
  report: "Report courier",
  dismiss: "Dismiss",
};

/** A need's buttons. The script sends them; each is checked again on the server. */
export const needButtons = (n: NeedRow) =>
  html`<span class="dk-acts">${n.actions.map(
    (a, i) =>
      html`<button type="button" class="btn sm ${i === 0 ? (a === "report" ? "danger" : "") : "ghost"}" data-act="${a}" data-need="${n.id}" data-order="${n.orderId ?? ""}" data-visa="${n.visaId ?? ""}" data-action-id="${n.actionId ?? ""}">${ACTION_LABEL[a]}</button>`,
  )}</span>`;

function frame(shop: Shop, view: DeskView, desk: ShopDesk, main: RawHtml, scripts: string[]): string {
  const item = (v: DeskView, n?: number) =>
    html`<a href="${href(shop, v)}" ${view === v ? raw('aria-current="page"') : ""}>${raw(ICON[v])}${LABEL[v]}${n ? html`<span class="n hot" data-count="needs">${n}</span>` : ""}</a>`;
  return courierLayout({
    title: `${LABEL[view]} · ${shop.name} desk`,
    bodyClass: "app-page dk-page",
    styles: ["/assets/desk.css"],
    scripts,
    body: html`<div class="app">
      <aside class="rail dk-rail">
        <a class="rail-logo" href="${config.courier.url}/for-shops" aria-label="Courier for shops">${LOGO}</a>
        <button type="button" class="rail-menu" aria-expanded="false" aria-controls="rail-drawer" aria-label="Menu: ${LABEL[view]}">
          <span>${shop.name} · ${LABEL[view]}</span>${desk.counts.needs ? html`<i class="rail-dot" aria-hidden="true"></i>` : ""}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5.5h14M3 10h14M3 14.5h14"/></svg>
        </button>
        <div class="rail-drawer" id="rail-drawer">
          <div class="dk-shop">${shopLogo(shop, "sm")}<span><b>${shop.name}</b><small>Shop desk</small></span></div>
          <nav aria-label="${shop.name} desk">
            ${item("today", desk.counts.needs)}
            ${item("orders")}
            ${item("door")}
            ${item("couriers")}
            ${item("reports")}
          </nav>
          <div class="dk-rail-f">
            <button type="button" class="dk-clerk-open" data-clerk-open>Ask the clerk</button>
            <a href="/${shop.slug}">Storefront ↗</a>
            <form class="dk-switch" method="get" action="/desk">
              <label for="dk-shop-pick">Demo: switch shop</label>
              <select id="dk-shop-pick" name="shop" data-autosubmit>${SHOPS.map(
                (s) => html`<option value="${s.slug}" ${s === shop ? raw("selected") : ""}>${s.name}</option>`,
              )}</select>
            </form>
          </div>
        </div>
      </aside>
      <main class="pane">${main}</main>
    </div>
    ${clerkDrawer(shop)}
    <script type="application/json" id="dk-boot">${raw(
      JSON.stringify({ shop: shop.slug, view, api: `${base(shop)}/api`, desk }).replace(/</g, "\\u003c"),
    )}</script>`,
  });
}

/** The owner's clerk, on every page: it reads the shop's records and can only propose a refund, which lands in Today. */
function clerkDrawer(shop: Shop): RawHtml {
  return html`<aside class="dk-clerk" id="dk-clerk" hidden aria-label="The clerk">
    <header><div><b>The clerk</b><small>Reads ${shop.name}'s orders, parcels, returns and ${PP} payments. It can propose a refund; you confirm it.</small></div><button type="button" class="dk-x" data-clerk-close aria-label="Close">×</button></header>
    <ol class="dk-chat" id="dk-chat"><li class="dk-msg them">What do you need? Try one of these, or ask your own.</li></ol>
    <div class="dk-starters">
      <button type="button" data-say="Which parcels are still on their way?">Parcels on their way</button>
      <button type="button" data-say="Any returns this week? What did you decide?">Returns this week</button>
      <button type="button" data-say="Show me the latest PayPal transactions.">Latest PayPal payments</button>
    </div>
    <form class="dk-ask" id="dk-ask"><input name="q" autocomplete="off" placeholder="Ask about an order, a parcel or a refund" maxlength="600" required><button class="btn sm" type="submit">Ask</button></form>
  </aside>`;
}

/** The page's title block, as in the app. */
const head = (title: string, sub: unknown, action?: unknown) =>
  html`<header class="pg-h"><div><h1 class="big">${title}</h1>${sub ? html`<p>${sub}</p>` : ""}</div>${action ?? ""}</header>`;

const section = (title: string, extra: unknown, body: RawHtml, id?: string) =>
  html`<section ${id ? raw(`id="${id}"`) : ""}><div class="pg-st"><h2>${title}</h2>${extra ?? ""}</div>${body}</section>`;

/* ---------------- Today ---------------- */

function needCard(n: NeedRow): RawHtml {
  return html`<li class="dk-need k-${n.kind}">
    <div class="dk-need-h"><span class="dk-tag">${n.what}</span><time datetime="${n.at}">${n.ago}</time></div>
    <div class="dk-need-b">${who(n.courier, n.pseudonym)}<span class="dk-need-i"><b>${n.item}</b>${n.amount ? html`<span class="pr">${n.amount}</span>` : ""}</span></div>
    <p>${n.why}</p>
    ${needButtons(n)}
  </li>`;
}

export function todayPage(shop: Shop, desk: ShopDesk): string {
  const { counts } = desk;
  // A number in the headline, kept current by the desk's script; its noun follows it into the plural.
  const n = (key: keyof ShopDesk["counts"], one?: string, many?: string) => {
    const value = counts[key];
    const word =
      one && many
        ? html` <span data-plural="${key}" data-one="${one}" data-many="${many}">${value === 1 ? one : many}</span>`
        : "";
    return html`<b data-count="${key}">${value}</b>${word}`;
  };
  const needs = desk.needs.length
    ? html`<ul class="dk-needs" data-grid="needs">${desk.needs.map(needCard)}</ul>`
    : html`<div class="card dk-empty" data-grid="needs"><b>Nothing needs you.</b><p>Couriers are shopping inside their limits. Refunds the clerk proposes, orders nobody paid and couriers that tried to trick the shop land here.</p></div>`;
  const parcels = desk.parcels.filter((p) => !p.delivered);
  const main = html`<div class="pg pg-wide"><div class="pg-in">
    <header class="pg-h dk-today-h">
      <div><span class="dk-kicker">Today at the shop</span><h1 class="big">${shop.name}</h1></div>
      <a class="btn sm ghost" href="${config.courier.url}/bots">Send some bots ↗</a>
    </header>
    <p class="dk-lede">
      <a href="#needs" class="dk-l-needs ${counts.needs ? "hot" : ""}">${n("needs", "thing needs", "things need")} you</a>.
      Couriers paid <a href="${href(shop, "orders")}">${n("paidToday")}</a> today across
      <a href="${href(shop, "orders")}">${n("ordersToday", "order", "orders")}</a>,
      <a href="#parcels">${n("parcels", "parcel is", "parcels are")}</a> on the road, and the door turned away
      <a href="${href(shop, "door")}">${n("turnedAwayToday", "bot", "bots")}</a>.
    </p>
    <p class="fine dk-lede-f">Every courier here shows a verified ID, never the person's name.</p>
    ${section("Needs you", html`<span class="fine">Each button is checked again in code before anything moves.</span>`, needs, "needs")}
    <div class="dk-two">
      ${section(
        "On their way",
        html`<a class="fine link" href="${href(shop, "orders")}">All orders</a>`,
        parcels.length
          ? html`<ul class="card dk-list" data-grid="parcels">${parcels
              .slice(0, 8)
              .map(
                (p) =>
                  html`<li>${who(p.courier)}<span class="dk-li-m"><b>${p.item}</b><small>${p.carrier} · ${p.tracking}</small></span><span class="dk-pill">${p.step}</span></li>`,
              )}</ul>`
          : html`<div class="card dk-empty sm"><p>No parcels on the road. ${desk.policy.delivery}.</p></div>`,
        "parcels",
      )}
      ${section(
        "Turned away, and why",
        html`<a class="fine link" href="${href(shop, "door")}">The door</a>`,
        desk.reasons.length
          ? html`<ul class="card dk-list" data-grid="reasons">${desk.reasons
              .slice(0, 8)
              .map(
                (r) =>
                  html`<li><span class="dk-count">${r.count}</span><span class="dk-li-m"><b>${r.reason}</b><small>Last: ${r.lastCourier}, ${r.lastAgo}</small></span></li>`,
              )}</ul>`
          : html`<div class="card dk-empty sm"><p>No one has been turned away yet.</p></div>`,
      )}
    </div>
    <p class="fine">Returns policy: ${desk.policy.returns}</p>
  </div></div>`;
  return frame(shop, "today", desk, main, ["/assets/desk/desk-ops.js"]);
}

/* ---------------- Orders ---------------- */

export function ordersPage(shop: Shop, desk: ShopDesk): string {
  const main = html`<div class="pg pg-wide"><div class="pg-in">
    ${head(
      "Orders",
      `${desk.orders.length} ${desk.orders.length === 1 ? "order" : "orders"} from couriers. Open one for its proof: the errand, the limits and PayPal's check.`,
    )}
    <div class="dk-tools"><input type="search" class="dk-filter" data-filter="orders" placeholder="Find a courier, an item, an order" aria-label="Filter orders"><button type="button" class="btn sm ghost" data-export="orders">Download CSV</button></div>
    ${
      desk.orders.length
        ? html`<ul class="card dk-list dk-orders" data-grid="orders">${desk.orders
            .slice(0, 40)
            .map(
              (o) =>
                html`<li>${who(o.courier, o.pseudonym)}<span class="dk-li-m"><b>${o.item}</b><small>${o.placed} · ${o.stage}</small></span><span class="pr">${o.amount}</span></li>`,
            )}</ul>`
        : html`<div class="card dk-empty"><b>No orders yet.</b><p>Ask Claude to buy something from ${shop.name}, and it shows up here.</p></div>`
    }
    <div class="dk-detail card" id="dk-detail" hidden></div>
  </div></div>`;
  return frame(shop, "orders", desk, main, ["/assets/desk/desk-ops.js"]);
}

/* ---------------- Door ---------------- */

export function doorPage(shop: Shop, desk: ShopDesk): string {
  const refused = desk.door.filter((d) => !d.allowed).length;
  const main = html`<div class="pg pg-wide"><div class="pg-in">
    ${head(
      "The door",
      "Every agent that knocked: couriers with a valid ID come in; anything else is turned away, with the reason.",
      html`<a class="btn sm ghost" href="${config.courier.url}/bots">Send some bots ↗</a>`,
    )}
    ${
      desk.reasons.length
        ? html`<div class="dk-reasons">${desk.reasons.map(
            (r) =>
              html`<button type="button" class="dk-reason" data-reason="${r.reason}"><b>${r.count}</b><span>${r.reason}</span></button>`,
          )}</div>`
        : ""
    }
    <div class="dk-tools"><input type="search" class="dk-filter" data-filter="door" placeholder="Find a courier or a reason" aria-label="Filter the door"><label class="dk-check"><input type="checkbox" data-show-let-in> Show couriers let in</label></div>
    ${
      desk.door.length
        ? html`<ul class="card dk-list" data-grid="door">${desk.door
            .filter((d) => !d.allowed)
            .slice(0, 40)
            .map(
              (d) =>
                html`<li>${who(d.face, d.pseudonym)}<span class="dk-li-m"><b>${d.reason}</b><small>${d.action} · ${d.detail}</small></span><time datetime="${d.at}">${d.ago}</time></li>`,
            )}</ul>`
        : html`<div class="card dk-empty"><b>No one has knocked yet.</b></div>`
    }
    <p class="fine">${refused} turned away in all. Couriers polling for news fold into one row.</p>
  </div></div>`;
  return frame(shop, "door", desk, main, ["/assets/desk/desk-ops.js"]);
}

/* ---------------- Couriers ---------------- */

export function couriersPage(shop: Shop, desk: ShopDesk): string {
  const main = html`<div class="pg pg-wide"><div class="pg-in">
    ${head(
      "Couriers",
      `${desk.couriers.length} ${desk.couriers.length === 1 ? "courier has" : "couriers have"} come to ${shop.name}. Each is a pseudonym for this shop alone: you can't link it to a person or to another shop.`,
    )}
    <div class="dk-tools"><input type="search" class="dk-filter" data-filter="couriers" placeholder="Find a courier" aria-label="Filter couriers"></div>
    ${
      desk.couriers.length
        ? html`<ul class="card dk-list" data-grid="couriers">${desk.couriers.map(
            (c) =>
              html`<li>${who(c.courier, c.pseudonym)}<span class="dk-li-m"><b>${c.orders} ${c.orders === 1 ? "order" : "orders"} · ${c.paid}</b><small>${c.turnedAway ? `${c.turnedAway} turned away · ` : ""}Last seen ${c.lastAgo}</small></span><span class="dk-pill s-${c.standing.toLowerCase().replace(/ /g, "-")}">${c.standing}</span></li>`,
          )}</ul>`
        : html`<div class="card dk-empty"><b>No couriers yet.</b></div>`
    }
  </div></div>`;
  return frame(shop, "couriers", desk, main, ["/assets/desk/desk-ops.js"]);
}

/* ---------------- Reports: AG Studio, loaded only here ---------------- */

export interface StudioBoot {
  api: string;
  shop: string;
  licenseKey: string | null;
  agent: { enabled: boolean; note: string };
}

export function reportsPage(shop: Shop, desk: ShopDesk, boot: StudioBoot, bundle: string | null): string {
  const main = html`<div class="pg pg-wide dk-reports"><div class="pg-in">
    ${head(
      "Reports",
      "Build your own charts from this shop's orders, door and couriers. Ask the report assistant for one, or drag your own.",
    )}
    <div id="desk" class="dk-root" data-boot="${JSON.stringify(boot)}">
      ${
        bundle
          ? html`<p class="dk-wait">Opening the report builder…</p>`
          : html`<p class="dk-wait">The report builder isn't built yet. Run <code>npm run build:desk</code>.</p>`
      }
    </div>
  </div></div>`;
  return frame(shop, "reports", desk, main, ["/assets/desk/desk-ops.js", ...(bundle ? [bundle] : [])]);
}
