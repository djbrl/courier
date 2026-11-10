/** Partner shops: the landing page's look, so the list feels like part of Courier rather than another site. */
import fs from "node:fs";
import path from "node:path";
import { config, courierLayout, html, PP, ROOT_DIR, raw, SHOPS, shopLogo } from "@courier/shared";
import type { Human } from "../db.ts";
import { assetUrl } from "./landing.ts";
import { navLinks } from "./shared.ts";

/* Shops with a photo in assets/banners show it; the rest keep their colour. */
const BANNER_DIR = path.join(ROOT_DIR, "packages/shared/assets/banners");
const BANNERS = new Set(
  fs.existsSync(BANNER_DIR)
    ? fs
        .readdirSync(BANNER_DIR)
        .filter((f) => f.endsWith(".jpg"))
        .map((f) => f.slice(0, -4))
    : [],
);

/** The ones most people try first get the big tiles. */
const FEATURED = ["floor-dash", "juniper", "beanbucks"];

const MARK = raw(
  '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><symbol id="mk" viewBox="0 0 40 20"><path fill="currentColor" d="M15 0h25l-7 20H8z"/><path fill="currentColor" d="M5 0h6L4 20h-6z"/></symbol><symbol id="arr" viewBox="0 0 16 16"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol></defs></svg>',
);

export function partnerShopsPage(human: Human | null): string {
  const store = config.store.url;
  const tile = (s: (typeof SHOPS)[number], big: boolean) =>
    html`<a class="ps-t${big ? " big" : ""}" href="${store}/${s.slug}" style="--tile:${s.tile}">
      <span class="ps-ph">${BANNERS.has(s.slug) ? html`<img src="/assets/banners/${s.slug}.jpg" alt="" loading="lazy">` : ""}</span>
      <span class="ps-id">${shopLogo(s)}<span><b>${s.name}</b><small>${s.sells}</small></span><svg class="ps-go" aria-hidden="true"><use href="#arr"/></svg></span>
    </a>`;
  const featured = FEATURED.map((slug) => SHOPS.find((s) => s.slug === slug)).filter(
    (s): s is (typeof SHOPS)[number] => !!s,
  );
  const rest = SHOPS.filter((s) => !FEATURED.includes(s.slug));

  const body = html`${MARK}
<header class="s-nav" id="nav"><a href="/" class="logo" aria-label="Courier"><svg><use href="#mk"/></svg>Courier</a><nav class="s-links" aria-label="Site">${navLinks(human, "/shops")}</nav></header>
<main class="ps">
  <header class="ps-h">
    <h1 class="s-h">${SHOPS.length} shops. One&nbsp;courier.</h1>
    <p>Every one of them knows yours on&nbsp;sight.</p>
  </header>
  <div class="ps-feat">${featured.map((s) => tile(s, true))}</div>
  <div class="ps-grid">${rest.map((s) => tile(s, false))}</div>
  <section class="ps-join">
    <div><h2 class="s-h">Run a shop? Join&nbsp;them.</h2><p>Every agent shows a pass, and PayPal takes the&nbsp;payment.</p></div>
    <div class="ctas"><a href="/start?as=shop" class="btn acc">Try the shop desk<span class="go"><svg><use href="#arr"/></svg></span></a><a href="/docs" class="btn ghost">Read the docs</a></div>
  </section>
  <p class="ps-fine">These are demo shops. Nothing real is sold or delivered.</p>
</main>
<footer><div class="s-fw">
  <span class="logo"><svg><use href="#mk"/></svg>Courier</span>
  <nav aria-label="Footer"><a href="/shops">Shops</a><a href="/docs">Developers</a><a href="/install">MCP</a><a href="/start">Try the demo</a></nav>
  <span class="ppl">Powered by ${PP}</span>
  <small>Sandbox demo.</small>
</div></footer>`;

  return courierLayout({
    title: "Shops · Courier",
    head: raw('<meta name="description" content="The partner shops that welcome Courier agents.">'),
    body,
    styles: [assetUrl("landing.css")],
    scripts: [assetUrl("page.js")],
  });
}
