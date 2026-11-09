import { ARROW, COURIER_RESOURCE, config, html, type RawHtml } from "@courier/shared";
import type { Human } from "../db.ts";
import { cpage } from "./shared.ts";

/* ---------------- for shops, install, and the bot test ---------------- */

/** The Courier connector as an agent adds it. */
const CONNECTOR = COURIER_RESOURCE;

/** What the connector gives an agent, in the groups a person would think of them. */
const TOOLS: { group: string; line: string; tools: [string, string][] }[] = [
  {
    group: "Find",
    line: "Look around every shop that takes couriers.",
    tools: [
      ["list_shops", "The shops that welcome couriers"],
      ["search_shop", "Search a shop’s menu or catalogue"],
      ["get_item", "An item’s details and price"],
    ],
  },
  {
    group: "Buy",
    line: "Pay with your PayPal, inside the budget you set.",
    tools: [
      ["start_errand", "Send a courier out with a budget"],
      ["buy", "Buy on the errand, never past its limit"],
      ["track_order", "Check and track an order"],
    ],
  },
  {
    group: "Together",
    line: "Shop with friends, and let the couriers split it.",
    tools: [
      ["list_contacts", "Who you can chip in with"],
      ["chip_in", "Split an order with friends’ couriers"],
    ],
  },
  {
    group: "Stay in control",
    line: "You can stop or undo it at any point.",
    tools: [
      ["wait_for_errand", "Wait for you to set the budget"],
      ["call_back", "Call a purchase back"],
      ["request_return", "Ask the shop for a return"],
    ],
  },
];

const PROMPTS = [
  "Get me a burger on Floor Dash. I have about $15.",
  "Find a book for my sister on Bookworm, under $25.",
  "Order dinner for me and Sam, and ask Sam’s courier to chip in.",
  "Where’s my order from Juniper Records?",
  "Reorder last week’s coffee beans from Beanbucks.",
  "Return the mug I bought yesterday.",
];

/** MCP: what the connector does for you first, and how to add it last. */
export function installPage(human: Human | null): string {
  const step = (n: number, title: string, body: RawHtml | string) =>
    html`<li><span class="in-n">${n}</span><div><h3>${title}</h3><div class="in-b">${body}</div></div></li>`;
  const face = (avatar: string) => html`<img class="mc-face" src="/assets/avatars/${avatar}.svg" alt="">`;
  return cpage(
    "MCP",
    human,
    html`<main class="mc">
      <section class="mc-hero">
        <div class="mc-copy">
          <span class="mc-kick">Courier MCP</span>
          <h1 class="big">Let your agent do the&nbsp;shopping.</h1>
          <p class="lead">One connector gives Claude, ChatGPT and any MCP agent a courier: an ID shops trust, your PayPal, and a limit it can’t go&nbsp;past.</p>
          <div class="mc-url"><code class="copy inp code">${CONNECTOR}</code></div>
          <div class="ctas"><a class="btn acc" href="/start">Get a courier${ARROW}</a><a class="btn ghost" href="#setup">Set it up</a></div>
          <ul class="mc-works" aria-label="Works with"><li>Claude</li><li>ChatGPT</li><li>Cursor</li><li>Claude Code</li><li>Any MCP client</li></ul>
        </div>
        <div class="mc-chat" aria-label="An example chat">
          <div class="mc-bar">New chat<small>Courier connected</small></div>
          <div class="mc-msgs">
            <p class="mc-you">Get me a burger on Floor Dash. I have about $15.</p>
            <p class="mc-tool"><code>search_shop</code></p>
            <p class="mc-said">A Double Smash Burger is $11.50, and fries take it to $16. Just the burger?</p>
            <p class="mc-you">Just the burger.</p>
            <p class="mc-tool"><code>start_errand</code><code>buy</code></p>
            <div class="mc-card">${face("shades")}<span><b>Juno bought it</b><small>$11.50 of your $15 · Paid with PayPal</small></span></div>
          </div>
        </div>
      </section>

      <section class="mc-sec">
        <h2>What your agent can&nbsp;do.</h2>
        <p class="mc-sub">One sign-in, and your agent picks the right tool. You just ask.</p>
        <div class="mc-tools">${TOOLS.map(
          (g) =>
            html`<div class="mc-tg"><h3>${g.group}</h3><p>${g.line}</p><ul>${g.tools.map(
              ([name, what]) => html`<li><code>${name}</code><span>${what}</span></li>`,
            )}</ul></div>`,
        )}</div>
      </section>

      <section class="mc-sec">
        <h2>Try&nbsp;asking.</h2>
        <ul class="mc-prompts">${PROMPTS.map((q) => html`<li><q>${q}</q></li>`)}</ul>
      </section>

      <section class="mc-sec mc-safe">
        <h2>Safe by&nbsp;default.</h2>
        <ul>
          <li><b>Nothing is bought until you say yes.</b>Your courier tells you the price first, and asks before going past your limit.</li>
          <li><b>The limit lives in code.</b>No prompt can talk it past what you set. Courier checks before PayPal charges.</li>
          <li><b>Shops never learn your name.</b>They get your courier’s ID and PayPal’s word that a real person sent it.</li>
        </ul>
      </section>

      <section class="mc-sec mc-setup" id="setup">
        <h2>Set up in a&nbsp;minute.</h2>
        <div class="in">
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
        </div>
      </section>

      <section class="mc-end">
        <h2 class="big">Give your agent a&nbsp;badge.</h2>
        <div class="ctas"><a class="btn acc" href="/start">Get a courier${ARROW}</a><a class="btn ghost" href="/docs">Read the docs</a></div>
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
