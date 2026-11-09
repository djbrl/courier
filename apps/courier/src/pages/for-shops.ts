import { ARROW, COURIER_RESOURCE, config, html, type RawHtml } from "@courier/shared";
import type { Human } from "../db.ts";
import { cpage } from "./shared.ts";

/* ---------------- for shops, install, and the bot test ---------------- */

/** The Courier connector as an agent adds it. */
const CONNECTOR = COURIER_RESOURCE;

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
