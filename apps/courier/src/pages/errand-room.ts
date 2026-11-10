import { ARROW, config, courierVars, html, LOGO, MONEY, PP, paypalFor, portrait, raw, SHOPS } from "@courier/shared";
import type { Courier } from "../db.ts";
import { FREE_MESSAGES, messagesLeft } from "../room.ts";
import { invitesFor } from "../runs.ts";
import { type Desk, shell } from "./app.ts";
import { courierLook, firstName } from "./shared.ts";

/* ---------------- the errand room ---------------- */

/** Ideas to start from, each at a different kind of shop and asked a different way, so a first errand shows the range. */
export const ERRAND_IDEAS = [
  "A burger and fries",
  "Flowers for my mum, under $30",
  "Chip in with Djibril on something for the office party",
];
/** One errand can cover several things: the courier sends a helper for each. */
const SEVERAL = { label: "Several things at once", say: "A burger, flowers and a good novel, you choose, budget $60" };

export function errandRoom(d: Desk, courier: Courier, chat: unknown, list: unknown, draft?: string): string {
  const look = courierLook(d.human, courier);
  const connect = `/start/claude?c=${encodeURIComponent(courier.id)}`;
  const human = firstName(d.human) ?? "there";
  const boot = {
    courier: { ...look, id: courier.id, vars: courierVars(look.color) },
    human,
    welcome: `Hi ${human}, I’m ${look.name}. Tell me what you want and your budget, and I’ll take it from there.\n\nThis is the demo, with ${FREE_MESSAGES} free messages. For the real thing, [connect me to your agent](${config.courier.url}${connect}). To split a bill, try “chip in with Djibril on something for the office party”.`,
    free: FREE_MESSAGES,
    left: messagesLeft(d.human),
    origins: [new URL(config.courier.url).origin, new URL(config.store.url).origin],
    paypal: paypalFor(d.human).mode,
    ideas: ERRAND_IDEAS,
    several: SEVERAL,
    draft: draft ?? "",
    chat,
    list,
    invites: invitesFor(d.human.id),
    portrait: portrait(look).value,
    receiptParts: {
      logo: LOGO.value,
      pp: PP.value,
    },
  };
  // Side by side on a wide screen: the courier and its errands, then the chat. On a phone, each is a tab.
  const main = html`<section class="rm cc" data-view="chat" style="${courierVars(look.color)}" aria-label="Chat with ${look.name}">
      <nav class="rm-tabs" aria-label="Errand room">
        <button type="button" data-view="list">Errands<i class="dot" hidden></i></button>
        <button type="button" data-view="chat" aria-current="true">${look.name}<i class="dot" hidden></i></button>
        <button type="button" data-view="run" hidden>Group<i class="dot" hidden></i></button>
      </nav>
      <div class="rm-toast" id="toast" role="status" hidden></div>
      <aside class="rm-side">
        <header class="rm-h">
          ${portrait(look)}<div class="rm-who"><b>${look.name}</b><small>Your courier</small></div>
          <button type="button" class="btn sm rm-new" id="new-chat">New errand</button>
        </header>
        <div class="rm-invites" id="invites" aria-live="polite" hidden></div>
        <ul class="rm-tickets" id="tickets" aria-label="Your errands"></ul>
        <section class="rm-run" id="run" aria-label="The run, with the other couriers" hidden>
          <div class="run-body"></div>
          <form class="compose run-say" id="run-say"><input autocomplete="off" placeholder="Tell ${look.name} what to pass on…" aria-label="Message ${look.name}">
            <button type="submit" aria-label="Send"><svg viewBox="0 0 16 16"><use href="#arr"/></svg></button></form>
        </section>
      </aside>
      <div class="rm-main">
      <div class="rm-budget" id="budget" hidden></div>
      <div class="rm-shops"><a class="rm-shops-l" href="/app/shops">${SHOPS.length} shops ${look.name} can reach${ARROW}</a></div>
      <div class="log rm-log" id="log" aria-live="polite"></div>
      <div class="rm-foot">
        <div class="rm-over" id="over" hidden>
          <b>This errand is over.</b>
          <p>It stays here to read. Anything else is a new errand.</p>
          <div class="after"><button type="button" class="btn sm" data-new>New errand</button><button type="button" class="btn ghost sm" data-delete-this>Delete this chat</button></div>
        </div>
        <div class="sugs rm-sugs" id="sugs"></div>
        <form class="compose" id="compose"><input id="say" autocomplete="off" placeholder="Ask ${look.name} for anything…" aria-label="Message ${look.name}">
          <button type="submit" aria-label="Send"><svg viewBox="0 0 16 16"><use href="#arr"/></svg></button></form>
        <div class="rm-end" id="demo-end" hidden>
          <b>That’s the end of the demo.</b>
          <p>You’ve used your ${FREE_MESSAGES} free messages. Your chats and receipts stay here. To keep going, connect Courier to your own agent.</p>
          <div class="after"><a class="btn sm" href="${connect}">Connect to Claude${ARROW}</a><a class="btn ghost sm" href="/install">Use another agent</a></div>
        </div>
        <p class="demo-tag">${config.anthropicConfigured ? `${look.name} runs on Claude.` : `A scripted stand-in for Claude, using the real shop tools.`} ${MONEY[paypalFor(d.human).mode].note} <span id="left"></span></p>
      </div>
      </div>
    </section>
    ${raw(`<script type="application/json" id="boot">${JSON.stringify(boot).replace(/</g, "\\u003c")}</script>`)}`;
  return shell(`${look.name}’s errands`, d, "errands", main, { scripts: ["/assets/errand.js"] });
}
