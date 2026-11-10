import { ARROW, COURIER_RESOURCE, config, html, type RawHtml } from "@courier/shared";
import type { Human } from "../db.ts";
import { cpage } from "./shared.ts";

/* ---------------- for shops, install, and the bot test ---------------- */

/** The Courier connector as an agent adds it. */
const CONNECTOR = COURIER_RESOURCE;

/** MCP: what it's like first, one screen at a time, and how to add it last. */
export function installPage(human: Human | null): string {
  const step = (n: number, title: string, body: RawHtml | string) =>
    html`<li><span class="in-n">${n}</span><div><h3>${title}</h3><div class="in-b">${body}</div></div></li>`;
  const face = (avatar: string, bg: string) =>
    html`<img class="mc-face" src="/assets/avatars/${avatar}.svg" alt="" style="background:${bg}">`;
  const row = (id: string, solid: string, title: RawHtml, line: string, pic: RawHtml) =>
    html`<section class="mc-row" id="${id}">
      <div class="mc-rc"><h2>${title}</h2><p>${line}</p></div>
      <div class="mc-pic" style="--solid:${solid}">${pic}</div>
    </section>`;
  return cpage(
    "MCP",
    human,
    html`<main class="mc">
      <section class="mc-hero">
        <span class="mc-kick">Courier MCP</span>
        <h1 class="big">Let your agent do the&nbsp;shopping.</h1>
        <p class="lead">One connector, for any MCP&nbsp;agent.</p>
        <div class="mc-get"><code class="copy inp code">${CONNECTOR}</code><a class="btn acc" href="/start">Get a courier${ARROW}</a></div>
      </section>

      <div class="mc-pic mc-hero-pic" style="--solid:#FF6B2C">
        <div class="mc-win">
          <div class="mc-bar">New chat<small>Courier connected</small></div>
          <div class="mc-msgs">
            <p class="mc-you">Get me a burger on Floor Dash. I have about $15.</p>
            <p class="mc-tool"><code>search_shop</code></p>
            <p class="mc-said">A Double Smash Burger is $11.50. Want it?</p>
            <p class="mc-you">Yes please.</p>
            <p class="mc-tool"><code>start_errand</code><code>buy</code></p>
            <div class="mc-card">${face("shades", "#3D3AF5")}<span><b>Juno bought it</b><small>$11.50 of your $15 · PayPal</small></span></div>
          </div>
        </div>
      </div>

      ${row(
        "limit",
        "#3D3AF5",
        html`It can’t overspend.`,
        "Your limit lives in code. Past it, your courier stops and asks.",
        html`<div class="mc-win mc-lim">
          <div class="mc-bar">Juno<small>Floor Dash</small></div>
          <div class="mc-lb">
            <div class="mc-tot"><span>Total</span><b>$27.50</b></div>
            <div class="mc-meter"><i></i></div>
            <div class="mc-tot mc-sm"><span>Limit</span><span>$25.00</span></div>
            <div class="mc-ask"><b>Past your $25</b><span>Go up to $30?</span><div><em>Go up to $30</em><em>Keep $25</em></div></div>
          </div>
        </div>`,
      )}
      ${row(
        "private",
        "#FFC629",
        html`Shops never see your&nbsp;name.`,
        "Just your courier’s ID, verified by PayPal.",
        html`<div class="mc-win mc-sh">
          <div class="mc-col"><h4>Shared</h4><p>${face("shades", "#3D3AF5")}Juno</p><p><code>pp_7f3a…c91</code></p><p>A real person</p></div>
          <div class="mc-col mc-no"><h4>Withheld</h4><p>Your name</p><p>Your email</p><p>Your PayPal account</p></div>
        </div>`,
      )}
      ${row(
        "friends",
        "#FF5FA2",
        html`Bring your&nbsp;friends.`,
        "Your couriers split the bill. Each pays with its own PayPal.",
        html`<div class="mc-win mc-fr">
          <div class="mc-bar">Friday dinner<small>3 couriers</small></div>
          <div class="mc-split">
            <p>${face("shades", "#3D3AF5")}<span>Maya</span><b>$16.00</b></p>
            <p>${face("afro", "#FF6B2C")}<span>Sam</span><b>$15.00</b></p>
            <p>${face("bob", "#141414")}<span>Ana</span><b>$14.00</b></p>
            <p class="mc-sum"><span>One order</span><b>$45.00</b></p>
          </div>
        </div>`,
      )}

      <section class="mc-works">
        <h2>Works with your&nbsp;agent.</h2>
        <ul><li>Claude</li><li>ChatGPT</li><li>Cursor</li><li>Claude Code</li><li>Any MCP client</li></ul>
      </section>

      <section class="mc-setup" id="setup">
        <h2>Set up in a&nbsp;minute.</h2>
        <div class="in">
          <div class="in-pick" role="radiogroup" aria-label="Your agent">
            <label><input type="radio" name="agent" value="claude" checked><span>Claude</span></label>
            <label><input type="radio" name="agent" value="mcp"><span>Any MCP agent</span></label>
          </div>
          <ol class="in-steps" data-for="claude">
            ${step(1, "Add a custom connector", "Settings, then Connectors.")}
            ${step(2, "Paste the address", html`<code class="copy inp code">${CONNECTOR}</code>`)}
            ${step(3, "Sign in with PayPal", "Pick your courier. Nothing is bought.")}
          </ol>
          <ol class="in-steps" data-for="mcp">
            ${step(1, "Add a remote MCP server", html`<code class="copy inp code">${CONNECTOR}</code>`)}
            ${step(2, "Let it sign in", "It finds Courier over OAuth.")}
            ${step(3, "Sign in with PayPal", "Pick your courier. Nothing is bought.")}
          </ol>
        </div>
      </section>
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
