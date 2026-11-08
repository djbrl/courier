import {
  ARROW,
  CK,
  COURIER_RESOURCE,
  config,
  courierLayout,
  html,
  PP,
  type RawHtml,
  raw,
  SHOPS,
  shopLogo,
  VERIFIED,
} from "@courier/shared";
import type { Human } from "../db.ts";
import { assetUrl } from "./landing.ts";
import { cpage, navLinks } from "./shared.ts";

/* ---------------- for shops, install, and the bot test ---------------- */

/** The Courier connector as an agent adds it. */
const CONNECTOR = COURIER_RESOURCE;

/** A courier's face, as the landing page draws it. */
const face = (avatar: string) =>
  html`<span class="s-pt" aria-hidden="true"><img src="/assets/avatars/${avatar}.svg" alt=""></span>`;
const UNKNOWN = raw('<span class="s-pt fx-anon" aria-hidden="true">?</span>');

/**
 * For shops: the landing page's kind of story, told from the counter. Screens hold while their window fills in, so a
 * shop sees what it gets one thing at a time; the details for its developers come last, in the open.
 */
export function forShopsPage(human: Human | null): string {
  const issuer = config.courier.url;
  const store = config.store.url;
  const visitors: { name: string; avatar: string; at: string; doing: string }[] = [
    { name: "Juno", avatar: "shades", at: ".42", doing: "Ordering for Maya’s errand" },
    { name: "Otto", avatar: "afro", at: ".5", doing: "Comparing burgers, $20 budget" },
    { name: "Mika", avatar: "bob", at: ".58", doing: "Reordering last week’s fries" },
  ];
  const blocked = ["floor-dash", "amazoo", "beanbucks", "juniper", "bookworm", "itsy", "best-bye", "trader-moes"]
    .map((slug) => SHOPS.find((x) => x.slug === slug))
    .filter((x): x is (typeof SHOPS)[number] => !!x);
  const ep = (label: string, url: string) =>
    html`<li><span>${label}</span><button type="button" class="fx-ep" data-copy="${url}"><code>${url}</code><small>Copy</small></button></li>`;
  const claim = (at: string, line: string) => html`<span class="fx-ln" data-at="${at}">${line}</span>`;

  const body = html`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <symbol id="mk" viewBox="0 0 40 20"><path fill="currentColor" d="M15 0h25l-7 20H8z"/><path fill="currentColor" d="M5 0h6L4 20h-6z"/></symbol>
  <symbol id="arr" viewBox="0 0 16 16"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</defs></svg>
<header class="s-nav" id="nav"><a href="/" class="logo" aria-label="Courier"><svg><use href="#mk"/></svg>Courier</a><nav class="s-links" aria-label="Site">${navLinks(human, "/for-shops")}</nav></header>
<main class="fx">

<section class="s-sec" id="fx-open" data-track style="--h:170vh"><div class="s-stick">
  <div class="fx-opentx">
    <h1 class="s-h">Sell to agents you can&nbsp;trust.</h1>
    <p>Courier tells you a real person sent each agent, and what it may spend. Nothing&nbsp;else.</p>
    <div><span class="ppl">Powered by ${PP}</span></div>
  </div>
  <div class="fx-rise">
    <div class="s-win fx-order">
      <div class="s-bar">Floor Dash<small>New order · Just now</small></div>
      <div class="fx-ob">
        <div class="s-who"><span class="s-id">${face("shades")}<span><b>Juno</b><small>Courier agent</small></span></span>${VERIFIED}</div>
        <div class="s-row"><span>Double Smash Burger</span><span>$11.50</span></div>
        <div class="s-row"><span>Within its limit</span><span>$25.00</span></div>
        <div class="fx-accept">Accept order</div>
      </div>
    </div>
  </div>
</div></section>

<section class="s-sec" id="fx-door" data-track style="--h:240vh"><div class="s-stick"><div class="s-grid">
  <div class="s-copy s-swap">
    <div data-until=".38">
      <h2 class="s-h">Agents are already at your&nbsp;door.</h2>
      <p>They look like any other visitor. You can’t tell a person’s errand from a scraper, so you turn them all away, or let them all&nbsp;in.</p>
    </div>
    <div class="s-swapb" data-at=".38">
      <h2 class="s-h">Now each one shows a&nbsp;pass.</h2>
      <p>A courier carries an ID signed by Courier, and PayPal’s word that a real person sent it. The ones without a pass are easy to&nbsp;spot.</p>
    </div>
  </div>
  <div class="s-mock"><div class="s-win">
    <div class="s-bar">Floor Dash<small>Visitors right now</small></div>
    <div class="fx-list">
      ${visitors.map(
        (v) => html`<div class="fx-vis">
          <div class="fx-v" data-until="${v.at}">${UNKNOWN}<span><b>Unknown agent</b><small>No way to tell who sent it</small></span></div>
          <div class="fx-v" data-at="${v.at}">${face(v.avatar)}<span><b>${v.name}</b><small>${v.doing}</small></span>${VERIFIED}</div>
        </div>`,
      )}
      <div class="fx-vis">
        <div class="fx-v">${UNKNOWN}<span><b>Unknown agent</b><small>Scraping every price on the menu</small></span><em class="fx-no" data-at=".72">No pass · Turned away</em></div>
      </div>
    </div>
  </div></div>
</div></div></section>

<section class="s-sec" id="fx-who" data-track data-solid style="--h:240vh;--solid:#FF6B2C"><div class="s-stick"><div class="s-grid">
  <div class="s-copy">
    <h2 class="s-h">A real person behind every order, and never their&nbsp;name.</h2>
    <p>You get PayPal’s yes and an ID that’s yours alone. Nothing else to store, so nothing to leak or match up with other&nbsp;shops.</p>
  </div>
  <div class="s-mock"><div class="s-win">
    <div class="s-bar">Order from Juno<small>What your shop receives</small></div>
    <div class="fx-card">
      <div class="fx-shared">
        <div class="fx-f"><span>Agent</span><b>Juno</b></div>
        <div class="fx-f" data-at=".18"><span>Sent by</span><b class="fx-ok">${CK}A real person, checked by PayPal</b></div>
        <div class="fx-f" data-at=".34"><span>Shopper ID</span><b><code>pp_7f3a…c91</code><small>Different at every shop</small></b></div>
        <div class="fx-f" data-at=".48"><span>Budget</span><b>Up to $25.00</b></div>
      </div>
      <div class="fx-held" data-at=".64">
        <h4>Never sent to your shop</h4>
        <ul><li>Name</li><li>Email</li><li>PayPal account</li><li>Other shops it visits</li></ul>
      </div>
    </div>
  </div></div>
</div></div></section>

<section class="s-sec" id="fx-limit" data-track style="--h:260vh"><div class="s-stick"><div class="s-grid">
  <div class="s-copy">
    <h2 class="s-h">The limit is checked before you&nbsp;charge.</h2>
    <p>Every errand carries a signed budget. Courier says yes or no in code, so an agent can’t talk its way past it, and you never carry an order nobody&nbsp;approved.</p>
  </div>
  <div class="s-mock"><div class="s-win">
    <div class="s-bar">Checkout<small>Juno · Floor Dash</small></div>
    <div class="fx-co">
      <div class="fx-lines">
        <div class="s-food"><span class="s-pic">🍔</span><span>Double Smash Burger<small>Two patties, pickles, house sauce</small></span><span>$11.50</span></div>
        <div class="s-food" data-at=".14"><span class="s-pic">🍟</span><span>Skin-on Fries<small>Salted, crunchy and still hot</small></span><span>$4.50</span></div>
        <div class="s-food fx-over" data-at=".32" data-until=".7"><span class="s-pic">🍗</span><span>Family Bucket<small>Takes it to $34.00</small></span><span>$18.00</span></div>
        <div class="s-food" data-at=".7"><span class="s-pic">🍗</span><span>Family Bucket<small>Twelve pieces and three dips</small></span><span>$18.00</span></div>
      </div>
      <div class="fx-limit">
        <div class="s-row s-total"><span>Total</span><span data-until=".14">$11.50</span><span data-at=".14" data-until=".7">$16.00</span><span data-at=".7">$34.00</span></div>
        <div class="s-meter fx-meter"><i data-meter=".7:97,.32:100,.14:64,0:46"></i></div>
        <div class="fx-lim"><span>Limit</span><span data-until=".58">$25.00</span><span data-at=".58">$35.00</span></div>
        <div class="fx-say fx-bad" data-at=".32" data-until=".46">Over the limit. Courier said no.</div>
        <div class="fx-say" data-at=".46" data-until=".58">Juno asked Maya to raise it to $35…</div>
        <div class="fx-say fx-good" data-at=".58">Maya said yes. Courier signed the new limit.</div>
      </div>
    </div>
  </div></div>
</div></div></section>

<section class="s-sec" id="fx-stop" data-track data-solid style="--h:230vh;--solid:#FFC629"><div class="s-stick"><div class="s-grid">
  <div class="s-copy">
    <h2 class="s-h">One report, and a bad agent is out at every&nbsp;shop.</h2>
    <p>If a courier misbehaves at your shop, report it. Its pass is suspended at every shop that takes Courier, not just&nbsp;yours.</p>
  </div>
  <div class="s-mock"><div class="s-win">
    <div class="s-bar">Kit<small>Courier agent</small></div>
    <div class="fx-stopb">
      <div class="fx-kit">${face("cap")}<span><b>Kit</b><small>Tried 40 orders in a minute</small></span>
        <b class="fx-rep" data-until=".26">Report</b><b class="fx-rep on" data-at=".26">Reported</b></div>
      <div class="fx-shops">${blocked.map(
        (x, i) =>
          html`<div class="fx-shop">${shopLogo(x)}<span>${x.name}</span><i data-at="${(0.36 + i * 0.05).toFixed(2)}"></i><em>Suspended</em></div>`,
      )}</div>
    </div>
  </div></div>
</div></div></section>

<section class="s-sec" id="fx-dev" data-track style="--h:240vh"><div class="s-stick"><div class="s-grid">
  <div class="s-copy">
    <h2 class="s-h">It fits the checkout you already&nbsp;have.</h2>
    <p>Courier is standard OAuth for MCP. Your server checks one signed token, and PayPal takes the payment the way it always&nbsp;has.</p>
  </div>
  <div class="s-mock"><div class="fx-code">
    <div class="fx-tabs"><span data-until=".55">The token your shop receives</span><span data-at=".55">Your checkout</span></div>
    <div class="fx-pre" data-until=".55">${claim("0", "{")}
${claim("0", '  "sub": "pp_7f3a…c91",')}
${claim(".1", '  "human": { "verified": true },')}
${claim(".2", '  "visa": {')}
${claim(".26", '    "agent": "Juno",')}
${claim(".32", '    "intent": "Dinner from Floor Dash",')}
${claim(".38", '    "spend_limit": { "currency": "USD", "value": "25.00" }')}
${claim(".2", "  }")}
${claim("0", "}")}</div>
    <div class="fx-pre" data-at=".55">${claim(".55", "const { payload } = await jwtVerify(token, courierKeys, {")}
${claim(".55", `  issuer: "${issuer}",`)}
${claim(".55", "});")}
${claim(".7", "if (total > payload.visa.spend_limit.value)")}
${claim(".7", '  return refuse("over_limit");')}
${claim(".84", "await paypal.capture(order); // as you do today")}</div>
  </div></div>
</div></div></section>

<section class="fx-devs" id="install">
  <h2 class="s-h">Everything your developers&nbsp;need.</h2>
  <p>Point your MCP server at these, and couriers can shop with&nbsp;you.</p>
  <ul class="fx-eps">
    ${ep("Authorization server", `${issuer}/.well-known/oauth-authorization-server`)}
    ${ep("Signing keys", `${issuer}/jwks.json`)}
    ${ep("Example resource metadata", `${issuer}/.well-known/oauth-protected-resource/mcp`)}
  </ul>
  <p class="fx-fine">The <code>sub</code> differs for every shop, so two shops can never match up a shopper. Think it can be fooled? <a class="link" href="/bots">Release the bots</a>.</p>
</section>

<section class="fx-close">
  <h2 class="s-h">Open your shop to&nbsp;couriers.</h2>
  <div class="ctas"><a href="${store}/merchant" class="btn acc">See what a shop sees${ARROW}</a><span class="ppl">Powered by ${PP}</span></div>
</section>
</main>
<footer><div class="s-fw">
  <span class="logo"><svg><use href="#mk"/></svg>Courier</span>
  <nav aria-label="Footer"><a href="/">How it works</a><a href="/for-shops">For shops</a><a href="/install">Install</a><a href="${store}">The shops</a></nav>
  <span class="ppl">Powered by ${PP}</span>
  <small>Sandbox demo.</small>
</div></footer>`;

  return courierLayout({
    title: "For shops · Courier",
    head: raw(
      '<meta name="description" content="Courier tells your shop a real person sent each agent, and what it may spend.">',
    ),
    body,
    styles: [assetUrl("landing.css"), assetUrl("shops.css")],
    scripts: [assetUrl("story.js")],
  });
}

/** Install: one path at a time. Pick the agent, then four steps. */
export function installPage(human: Human | null): string {
  const step = (n: number, title: string, body: RawHtml | string) =>
    html`<li><span class="in-n">${n}</span><div><h3>${title}</h3><div class="in-b">${body}</div></div></li>`;
  return cpage(
    "Install",
    human,
    html`<main class="in">
      <header><h1 class="big">Install Courier in your&nbsp;agent.</h1>
        <p class="lead">One connector, and every courier you make goes with it.</p></header>
      <div class="in-pick" role="radiogroup" aria-label="Your agent">
        <label><input type="radio" name="agent" value="claude" checked><span>Claude</span></label>
        <label><input type="radio" name="agent" value="mcp"><span>Any MCP agent</span></label>
      </div>
      <ol class="in-steps" data-for="claude">
        ${step(1, "Open Claude’s connectors", "Settings, then Connectors, then Add custom connector.")}
        ${step(2, "Paste the address", html`<code class="copy inp code">${CONNECTOR}</code>`)}
        ${step(3, "Connect and pick your courier", "Sign in with PayPal and say yes. Nothing is bought.")}
        ${step(4, "Ask in any chat", html`<q>Get me a burger on Floor Dash. I have about $15.</q>`)}
      </ol>
      <ol class="in-steps" data-for="mcp">
        ${step(1, "Add a remote MCP server", html`<code class="copy inp code">${CONNECTOR}</code>`)}
        ${step(2, "Let it sign in", "It finds Courier with OAuth and registers itself.")}
        ${step(3, "Pick your courier", "Sign in with PayPal and say yes. Nothing is bought.")}
        ${step(4, "Send it on an errand", "It gets the same tools: shops, errands, and calling back.")}
      </ol>
      <div class="in-foot"><a class="btn" href="/start">Get a courier${ARROW}</a><a class="link fine" href="/start">Not ready? Try the demo first</a></div>
    </main>`,
    { here: "/install" },
  );
}

export function botsPage(human: Human | null): string {
  return cpage(
    "Release the bots",
    human,
    html`<main class="bots-pg">
      <header class="bots-h">
        <div><h1 class="big">Release the&nbsp;bots.</h1>
          <p class="lead">Eight attacks on ${config.store.name}’s courier lane: no ID, forged and stolen IDs, overspending, prompt injection, a flood.</p></div>
        <button class="btn danger" type="button" id="run-bots">Run 8 attacks</button>
      </header>
      <ol class="bot-grid" id="bot-results" aria-live="polite"><li class="bot-empty">The bots are waiting outside.</li></ol>
      <p class="fine">Real requests against the real shop. The shop’s side is on <a href="${config.store.url}/merchant">its dashboard</a>.</p>
    </main>`,
    { scripts: ["/assets/bots.js"] },
  );
}
