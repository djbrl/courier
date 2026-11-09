import { config, courierLayout, html, LOGO, PP, type RawHtml, raw, SHOPS, type Shop, shopLogo } from "@courier/shared";
import type { CourierFace, NeedRow, ShopDesk } from "./desk-ops.ts";

/*
 * A shop's desk: the owner's side of Courier, in the app's own frame (a cobalt rail, a page title, white cards). The
 * server draws every page whole, so it reads on a phone and without the script; on a wide screen the script swaps the
 * lists for AG Grid tables that refresh, sort, filter and act.
 */

export type DeskView = "today" | "orders" | "access" | "couriers" | "reports";

const LABEL: Record<DeskView, string> = {
  today: "Today",
  orders: "Orders",
  access: "Access log",
  couriers: "Couriers",
  reports: "Reports",
};

const ICON: Record<DeskView, string> = {
  today:
    '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 6.4V10l2.4 1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  orders:
    '<svg viewBox="0 0 20 20"><path d="M4 6.5h12l-1.2 9.5H5.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  access:
    '<svg viewBox="0 0 20 20"><path d="M5 17V3.5h10V17M3 17h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><circle cx="12.3" cy="10.4" r="1.1" fill="currentColor"/></svg>',
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
    html`<a href="${href(shop, v)}" data-tour="rail-${v}" ${view === v ? raw('aria-current="page"') : ""}>${raw(ICON[v])}${LABEL[v]}${n ? html`<span class="n hot" data-count="needs">${n}</span>` : ""}</a>`;
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
            ${item("access")}
            ${item("couriers")}
            ${item("reports")}
          </nav>
          <div class="dk-rail-f">
            <button type="button" class="dk-clerk-open" data-clerk-open>Ask the clerk</button>
            <a href="/${shop.slug}">Storefront ↗</a>
            <a href="${base(shop)}?tour=1">Show me around</a>
            <form class="dk-switch" method="get" action="/desk">
              <label for="dk-shop-pick">Demo: switch shop</label>
              <select id="dk-shop-pick" name="shop" data-autosubmit>${SHOPS.map(
                (s) => html`<option value="${s.slug}" ${s === shop ? raw("selected") : ""}>${s.name}</option>`,
              )}</select>
            </form>
            <form method="post" action="/desk/sign-out"><button type="submit" class="dk-out">Sign out</button></form>
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

/** Says where the tables come from, under each one on a wide screen (a phone gets plain lists instead). */
const AG_CREDIT = html`<p class="dk-credit">Table powered by <a href="https://www.ag-grid.com" target="_blank" rel="noopener">AG Grid</a></p>`;

/** The page's title block, as in the app. */
const head = (title: string, sub: unknown, action?: unknown) =>
  html`<header class="pg-h"><div><h1 class="big">${title}</h1>${sub ? html`<p>${sub}</p>` : ""}</div>${action ?? ""}</header>`;

const section = (title: unknown, extra: unknown, body: RawHtml, id?: string) =>
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

/** The first look around the desk, ending on the clerk. Says plainly which rows are made up. */
function tourSteps(desk: ShopDesk) {
  const sample = desk.orders.some((o) => o.sample);
  return [
    {
      target: "pulse",
      title: "Today",
      body: "Orders, payments, refunds and parcels for today.",
    },
    {
      target: "orders",
      title: "Latest orders",
      body: sample
        ? "Rows tagged Sample are demo data. Your own demo orders appear here too. Click a row to see its details."
        : "Click a row to see its details.",
    },
    {
      target: "rail-access",
      title: "Access log",
      body: "Every agent request to the shop, and the ones Courier blocked.",
    },
    {
      target: "rail-reports",
      title: "Reports",
      body: "Charts of orders, couriers and access. Add your own.",
    },
    {
      target: "clerk",
      title: "Clerk",
      body: "Ask about orders, parcels or payments. It can propose a refund; you confirm it.",
      cta: { label: "Ask the clerk", href: "#clerk" },
    },
  ];
}

export function todayPage(shop: Shop, desk: ShopDesk, opts: { tour?: boolean } = {}): string {
  const { counts } = desk;
  const top = Math.max(1, ...desk.week.map((d) => d.orders));
  const bars = desk.week.map(
    (d, i) =>
      html`<li class="${i === desk.week.length - 1 ? "now" : ""}" title="${d.day}: ${d.orders} ${d.orders === 1 ? "order" : "orders"}, ${d.amount}"><i style="--h:${Math.max(4, Math.round((d.orders / top) * 100))}%"></i><span>${i === desk.week.length - 1 ? "Today" : d.day.slice(0, 1)}</span></li>`,
  );
  const stat = (key: keyof ShopDesk["counts"], label: string, to: string) =>
    html`<li><a href="${to}"><span>${label}</span><b data-count="${key}">${counts[key]}</b></a></li>`;
  const latest = desk.orders.slice(0, 8);
  const main = html`<div class="pg pg-wide"><div class="pg-in">
    ${head(
      shop.name,
      "Today at your shop. Every courier shows a verified ID, never the person's name.",
      html`<button type="button" class="btn sm" data-clerk-open data-tour="clerk">Ask the clerk</button>`,
    )}
    <section class="dk-needs-s" id="needs" ${desk.needs.length ? "" : raw("hidden")}>
      <div class="pg-st"><h2>Needs you <span class="dk-badge" data-count="needs">${counts.needs}</span></h2><span class="fine">Each button is checked again in code before anything moves.</span></div>
      <ul class="dk-needs" data-grid="needs">${desk.needs.map(needCard)}</ul>
    </section>
    <section class="card dk-pulse" aria-label="Today" data-tour="pulse">
      <div class="dk-hero">
        <span class="dk-k">Orders today</span>
        <b class="dk-big" data-count="ordersToday">${counts.ordersToday}</b>
        <span class="dk-sub"><b data-count="ordersWeek">${counts.ordersWeek}</b> in the last 7 days</span>
        <ol class="dk-bars" aria-hidden="true">${bars}</ol>
      </div>
      <ul class="dk-mini">
        ${stat("paidToday", "Paid today", href(shop, "orders"))}
        ${stat("refundsWeek", "Refunds this week", href(shop, "orders"))}
        ${stat("parcels", "Parcels on the road", href(shop, "orders"))}
        ${stat("turnedAwayToday", "Turned away today", href(shop, "access"))}
      </ul>
    </section>
    ${section(
      "Latest orders",
      html`<a class="fine link" href="${href(shop, "orders")}">All orders</a>`,
      latest.length
        ? html`<div data-tour="orders"><ul class="card dk-list dk-orders" data-grid="latest">${latest.map(
            (o) =>
              html`<li>${who(o.courier, o.pseudonym)}<span class="dk-li-m"><b>${o.item}${o.sample ? html` <span class="dk-sample">Sample</span>` : ""}</b><small>${o.placed} · ${o.stage}</small></span><span class="pr">${o.amount}</span></li>`,
          )}</ul>${AG_CREDIT}</div>`
        : html`<div class="card dk-empty"><b>No orders yet.</b><p>Ask Claude to buy something from ${shop.name}, and it shows up here.</p></div>`,
    )}
  </div></div>${
    opts.tour
      ? raw(
          `<script type="application/json" id="tour">${JSON.stringify(tourSteps(desk)).replace(/</g, "\\u003c")}</script>`,
        )
      : ""
  }`;
  return frame(shop, "today", desk, main, ["/assets/desk/desk-ops.js", ...(opts.tour ? ["/assets/tour.js"] : [])]);
}

/* ---------------- Orders ---------------- */

export function ordersPage(shop: Shop, desk: ShopDesk): string {
  const main = html`<div class="pg pg-wide"><div class="pg-in">
    ${head(
      "Orders",
      `${desk.orders.length} ${desk.orders.length === 1 ? "order" : "orders"} from couriers. Open one for its proof: the errand, the limits and PayPal's check.${desk.orders.some((o) => o.sample) ? " Rows marked Sample are made up, so the desk isn't empty; orders from your own errands land here too." : ""}`,
    )}
    <div class="dk-tools"><input type="search" class="dk-filter" data-filter="orders" placeholder="Find a courier, an item, an order" aria-label="Filter orders"><button type="button" class="btn sm ghost" data-export="orders">Download CSV</button></div>
    ${
      desk.orders.length
        ? html`<ul class="card dk-list dk-orders" data-grid="orders">${desk.orders
            .slice(0, 40)
            .map(
              (o) =>
                html`<li>${who(o.courier, o.pseudonym)}<span class="dk-li-m"><b>${o.item}${o.sample ? html` <span class="dk-sample">Sample</span>` : ""}</b><small>${o.placed} · ${o.stage}</small></span><span class="pr">${o.amount}</span></li>`,
            )}</ul>${AG_CREDIT}`
        : html`<div class="card dk-empty"><b>No orders yet.</b><p>Ask Claude to buy something from ${shop.name}, and it shows up here.</p></div>`
    }
    <div class="dk-detail card" id="dk-detail" hidden></div>
  </div></div>`;
  return frame(shop, "orders", desk, main, ["/assets/desk/desk-ops.js"]);
}

/* ---------------- Access log: every agent that tried to shop here ---------------- */

export function doorPage(shop: Shop, desk: ShopDesk): string {
  const refused = desk.door.filter((d) => !d.allowed).length;
  const seg = (show: string, label: string, n: number) =>
    html`<button type="button" data-door-show="${show}" aria-pressed="${show === "all" ? "true" : "false"}">${label} <b>${n}</b></button>`;
  const main = html`<div class="pg pg-wide"><div class="pg-in">
    ${head(
      "Access log",
      "Every agent request to this shop. Couriers with a valid ID get in; Courier blocks the rest and says why.",
    )}
    <div class="dk-tools">
      <div class="dk-seg" role="group" aria-label="Show">${seg("all", "All", desk.door.length)}${seg("in", "Let in", desk.door.length - refused)}${seg("out", "Turned away", refused)}</div>
      <input type="search" class="dk-filter" data-filter="door" placeholder="Find a courier or a reason" aria-label="Filter the access log">
    </div>
    ${
      desk.reasons.length
        ? html`<div class="dk-reasons" data-reasons hidden>${desk.reasons.map(
            (r) =>
              html`<button type="button" class="dk-reason" data-reason="${r.reason}"><span>${r.reason}</span><b>${r.count}</b></button>`,
          )}</div>`
        : ""
    }
    ${
      desk.door.length
        ? html`<ul class="card dk-list" data-grid="door">${desk.door
            .slice(0, 40)
            .map(
              (d) =>
                html`<li>${who(d.face, d.pseudonym)}<span class="dk-li-m"><b>${d.allowed ? "Let in" : d.reason}${d.sample ? html` <span class="dk-sample">Sample</span>` : ""}</b><small>${d.action} · ${d.detail}</small></span><time datetime="${d.at}">${d.ago}</time></li>`,
            )}</ul>${AG_CREDIT}`
        : html`<div class="card dk-empty"><b>No agent has tried to shop here yet.</b></div>`
    }
    <p class="fine">${refused} turned away in all. Couriers polling for news fold into one row.</p>
  </div></div>`;
  return frame(shop, "access", desk, main, ["/assets/desk/desk-ops.js"]);
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
          )}</ul>${AG_CREDIT}`
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
      "Charts of this shop's orders, access log and couriers. Edit the report to add your own, or ask for one in words.",
    )}
    <div id="desk" class="dk-root" data-boot="${JSON.stringify(boot)}">
      ${
        bundle
          ? html`<div class="dk-skel" role="status" aria-busy="true" aria-label="Loading the reports"><i></i><i></i><i></i><i class="wide"></i><i class="wide"></i></div>`
          : html`<p class="dk-wait">The report builder isn't built yet. Run <code>npm run build:desk</code>.</p>`
      }
    </div>
  </div></div>`;
  return frame(shop, "reports", desk, main, ["/assets/desk/desk-ops.js", ...(bundle ? [bundle] : [])]);
}

/* ---------------- sign-in ---------------- */

/** The owner's way in. The demo has no passwords: picking a shop signs you in as its owner. */
export function signInPage(shop: Shop, signedIn: Shop | undefined): string {
  return courierLayout({
    title: "Sign in · Shop desk",
    bodyClass: "dk-in-page",
    styles: ["/assets/desk.css"],
    body: html`<main class="dk-in">
      <a class="dk-in-logo" href="${config.courier.url}/for-shops" aria-label="Courier for shops">${LOGO}</a>
      <section class="dk-in-card" aria-labelledby="dk-in-h">
        <span class="dk-in-tag">Shop desk</span>
        <h1 id="dk-in-h">Sign in to your shop.</h1>
        <p>See today’s orders, the couriers that shop with you and every ${PP} payment, and answer what needs you.</p>
        ${
          signedIn
            ? html`<a class="btn dk-in-go" href="/desk/${signedIn.slug}">Open ${signedIn.name}’s desk</a><p class="dk-in-or">or sign in to another shop</p>`
            : ""
        }
        <form method="post" action="/desk/sign-in" class="dk-in-f">
          <label for="dk-in-shop">Your shop</label>
          <div class="dk-in-pick"><select id="dk-in-shop" name="shop">${SHOPS.map(
            (s) => html`<option value="${s.slug}" ${s === shop ? raw("selected") : ""}>${s.name}</option>`,
          )}</select></div>
          <button class="btn ${signedIn ? "ghost" : ""}" type="submit">Sign in as the owner</button>
        </form>
        <p class="dk-in-fine">A demo: there’s no password, and every shop is made up. A real shop signs in with its own account.</p>
      </section>
      <p class="dk-in-alt">Shopping instead? <a href="${config.courier.url}/start/sign-in">Try Courier as a buyer</a></p>
    </main>`,
  });
}
