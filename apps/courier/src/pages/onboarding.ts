import {
  ARROW,
  avatarFor,
  avatarPicker,
  COURIER_COLORS,
  COURIER_NAME_HINT,
  COURIER_NAME_MAX,
  COURIER_NAME_PATTERN,
  COURIER_RESOURCE,
  type CourierColor,
  config,
  courierVars,
  escapeHtml,
  html,
  idCard,
  LOGO,
  PP,
  paypal,
  type RawHtml,
  raw,
} from "@courier/shared";
import { type Courier, type Human, listCouriers } from "../db.ts";
import { courierLook, cpage, dots, firstName, hasClaude, OK, progress } from "./shared.ts";

/* ---------------- onboarding ---------------- */

/**
 * Every onboarding step is the whole window: the words on the left, the courier's card standing still on a quiet stage
 * on the right. The progress lines say which step this is, so nothing else does.
 */
function stagePage(
  title: string,
  opts: {
    step?: number;
    left: RawHtml;
    card: RawHtml;
    form?: RawHtml;
    attrs?: RawHtml;
    scripts?: string[];
    after?: RawHtml;
  },
): string {
  const tag = opts.form ? "form" : "main";
  const inner = html`<section class="ob2-l">
      <header class="ob2-top"><a href="/" aria-label="Courier home">${LOGO}</a></header>
      ${opts.step ? progress(opts.step) : ""}
      ${opts.left}
    </section>
    <section class="ob2-r" aria-hidden="true"><div class="wiz-id" id="preview" ${opts.attrs ?? ""}>${opts.card}</div></section>`;
  return cpage(
    title,
    null,
    html`${raw(`<${tag} class="ob2" ${opts.form?.value ?? ""}>`)}${inner}${raw(`</${tag}>`)}${opts.after ?? ""}`,
    { bodyClass: "onb ob2-page", nav: false, scripts: opts.scripts },
  );
}

export function welcomePage(asShop = false): string {
  return stagePage("Welcome", {
    left: html`<div class="ob2-body">
        <h1 class="ob2-h">Welcome to Courier.</h1>
        <p class="ob2-lead">Give your AI agent a face and let it shop for you. You set the budget, and it can’t go over.</p>
        <p class="ob2-q">How do you want to try it?</p>
        <div class="ob2-pick">
          <form method="post" action="/auth/demo"><input type="hidden" name="next" value="/start/courier"><button class="ob2-opt${asShop ? "" : " on"}" type="submit"><b>I’m shopping</b><small>Make your courier and send it on an errand.</small>${ARROW}</button></form>
          <a class="ob2-opt${asShop ? " on" : ""}" href="${config.store.url}/desk/sign-in"><b>I run a shop</b><small>See the couriers that buy from you, on the shop desk.</small>${ARROW}</a>
        </div>
        ${
          // With sandbox keys, a PayPal sandbox account can sign in instead of the made-up demo person.
          paypal.mode === "sandbox"
            ? html`<p class="ob2-alt"><a class="link" href="/auth/paypal/start?next=%2Fstart%2Fcourier">Shop with a PayPal sandbox account instead</a></p>`
            : ""
        }
      </div>`,
    card: idCard({ ...courierLook(null), idNo: "CR-0000-JU" }, null),
  });
}

const COLORS = Object.keys(COURIER_COLORS) as CourierColor[];

// Everyone starting with "Juno" made group runs read as Juno talking to Juno. A name picked from the person's id
// keeps it steady across reloads and makes friends' couriers look like different agents.
const FIRST_NAMES = ["Juno", "Otto", "Mika", "Pip", "Lou", "Ivy", "Kit", "Nell", "Ari", "Zed", "Bo", "Remy"];

function firstCourierName(humanId: string): string {
  let n = 0;
  for (const ch of humanId) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  return FIRST_NAMES[n % FIRST_NAMES.length]!;
}

/** Name, colour and your name. Also used to edit a courier or add another one. */
export function courierSetupPage(
  human: Human,
  courier: Courier | undefined,
  opts: { error?: string; adding?: boolean; name?: string; reqId?: string } = {},
): string {
  const firstRun = !courier && !opts.adding;
  const used = new Set(listCouriers(human.id).map((c) => c.color));
  const suggested = firstCourierName(human.id);
  const look = courier
    ? courierLook(human, courier)
    : {
        ...courierLook(human),
        name: opts.adding ? "" : suggested,
        // Juno keeps the shades from the landing; any other name gets a face from its name.
        avatar: opts.adding ? undefined : suggested === "Juno" ? ("shades" as const) : avatarFor(suggested),
        color:
          (opts.adding ? COLORS.find((c) => !used.has(c)) : COLORS[FIRST_NAMES.indexOf(suggested) % COLORS.length]) ??
          "cobalt",
      };
  if (opts.name !== undefined) look.name = opts.name;
  const you = firstName(human);
  const swatch = (c: CourierColor, label: string) =>
    html`<label title="${label}"><input type="radio" name="color" value="${c}" ${look.color === c ? raw("checked") : ""} aria-label="${label}"><span style="--c:${COURIER_COLORS[c].ac}"></span></label>`;
  const backTo = courier ? `/app?c=${courier.id}` : "/app";
  return stagePage(courier ? `Edit ${courier.name}` : "Meet your courier", {
    step: firstRun && !opts.reqId ? 2 : undefined,
    form: raw('method="post" action="/start/courier" id="setup"'),
    attrs: raw(`data-vars="${escapeHtml(JSON.stringify(Object.fromEntries(COLORS.map((c) => [c, courierVars(c)]))))}"`),
    scripts: ["/assets/onboard.js"],
    left: html`<div class="ob2-body">
        <h1 class="ob2-h">${courier ? html`Edit <span class="hfit" data-fit>${courier.name}.</span>` : opts.adding ? "Add a courier." : "Meet your courier."}</h1>
        ${opts.error ? html`<p class="err">${opts.error}</p>` : ""}
        ${opts.reqId ? html`<input type="hidden" name="req" value="${opts.reqId}">` : ""}
        ${courier ? html`<input type="hidden" name="c" value="${courier.id}">` : opts.adding ? html`<input type="hidden" name="new" value="1">` : ""}
        <div class="ob2-fields">
          <label class="fld"><span>Your first name</span><input class="inp" name="human" value="${you ?? ""}" maxlength="24" required autocomplete="given-name" data-live="human" ${you ? "" : raw("autofocus")}><small class="hint">Only your friends will see this name.</small></label>
          <label class="fld"><span>Courier name</span><input class="inp" name="name" value="${look.name}" placeholder="e.g. Otto" minlength="2" maxlength="${COURIER_NAME_MAX}" pattern="${COURIER_NAME_PATTERN}" title="${COURIER_NAME_HINT}" required autocomplete="off" autocapitalize="words" spellcheck="false" data-live="name"><small class="hint" id="name-hint">${COURIER_NAME_HINT}</small></label>
        </div>
        ${avatarPicker(look.avatar ?? avatarFor(look.name || "Juno"))}
        <div class="fld wiz-sw"><span>Colour</span><div class="sw">${swatch("cobalt", "Cobalt")}${swatch("tang", "Orange")}${swatch("ink", "Ink")}${swatch("hivis", "Hi-vis")}</div></div>
      </div>
      <div class="ob2-foot">
        ${firstRun || opts.reqId ? "" : html`<a class="btn ghost" href="${backTo}">Back</a>`}
        <button class="btn" type="submit">${courier ? "Save" : html`Next${ARROW}`}</button>
      </div>`,
    card: idCard({ ...look, name: look.name || "Name" }, you),
  });
}

/**
 * The last step: start using the courier from the dashboard, or add Courier to your own Claude first. The Claude route
 * is two short steps, and only the second waits for Claude.
 */
export function claudeSetupPage(human: Human, courier: Courier, opts: { onboarding: boolean; step: number }): string {
  const local = /localhost|127\.0\.0\.1/.test(config.courier.url);
  const cmd = `claude mcp add --transport http courier ${COURIER_RESOURCE}`;
  const connected = hasClaude(human);
  const look = courierLook(human, courier);
  const done = `/app?c=${courier.id}${opts.onboarding ? "&welcome=1" : ""}`;
  // Onboarding opens on the choice; from Settings, straight to the Claude steps.
  const step = Math.min(2, Math.max(opts.onboarding ? 0 : 1, Number.isFinite(opts.step) ? opts.step : 0));
  const stepUrl = (n: number) => `/start/claude?c=${courier.id}&step=${n}${opts.onboarding ? "&first=1" : ""}`;
  const leave = opts.onboarding ? done : "/app/settings";
  const left =
    step === 0
      ? html`<div class="ob2-body">
          <h1 class="ob2-h">Take <span class="hfit" data-fit>${courier.name}</span> for a&nbsp;spin.</h1>
          <p class="ob2-lead">Ask for anything, with a budget. ${courier.name} finds it, asks if it’s unsure, and never spends past your limit.</p>
          <div class="ob2-pick">
            <a class="ob2-opt" href="${done}"><b>Try it here</b><span>Start from your dashboard. No setup.</span>${ARROW}</a>
            <a class="ob2-opt" href="${stepUrl(1)}"><b>Use your own Claude</b><span>Send ${courier.name} from any chat. About a minute.</span>${ARROW}</a>
          </div>
        </div>`
      : html`<div class="ob2-body">${
          step === 1
            ? html`<h1 class="ob2-h">Add Courier to Claude.</h1>
          <ol class="wiz-list">
            <li>Open <a class="link" href="https://claude.ai/settings/connectors" target="_blank" rel="noopener">Claude’s connector settings ↗</a></li>
            <li>Choose <b>Add custom connector</b>.</li>
            <li>Name it <b>Courier</b> and paste this:</li>
          </ol>
          <code class="copy inp code sm">${COURIER_RESOURCE}</code>
          ${local ? html`<p class="warn"><b>Running on localhost.</b> Claude on the web can’t reach it. Start the tunnel first.</p>` : ""}
          <details class="wiz-alt"><summary>Using Claude Code?</summary>
            <p class="fine">Run this in your terminal instead.</p>
            <code class="copy inp code sm">${cmd}</code>
          </details>`
            : html`<h1 class="ob2-h">Connect it.</h1>
          <p class="ob2-lead">In Claude, click <b>Connect</b> and approve it. Nothing is bought or charged.</p>
          <p class="fine">In Claude Code, run <code>/mcp</code> in an interactive session, choose <b>courier</b> and sign in.</p>
          <div class="live ${connected ? "on" : ""}" id="live" data-courier="${courier.id}" aria-live="polite">
            <span class="dot" aria-hidden="true"></span>
            <span class="txt">${connected ? html`<b>Connected.</b> Claude can send ${courier.name} now.` : html`<b>Waiting for Claude…</b>`}</span>
          </div>`
        }</div>
        <div class="ob2-foot">
          <a class="btn ghost" href="${step > 1 || opts.onboarding ? stepUrl(step - 1) : "/app/settings"}">Back</a>
          ${
            step < 2
              ? html`<a class="btn" href="${stepUrl(step + 1)}">Next${ARROW}</a>`
              : html`<a class="${connected ? "btn" : "btn ghost"}" id="next" href="${connected ? done : leave}">${connected ? "Continue" : opts.onboarding ? "Skip for now" : "Done"}</a>`
          }
        </div>`;
  return stagePage(`Add ${courier.name} to Claude`, {
    step: opts.onboarding ? 3 : undefined,
    left,
    card: idCard(look, firstName(human)),
    after:
      step === 2
        ? raw(
            `<script>(()=>{const el=document.getElementById("live");if(el.classList.contains("on"))return;const t=setInterval(async()=>{if(document.hidden)return;try{const s=await (await fetch("/app/api/status")).json();const c=(s.couriers||[]).find(c=>c.id===el.dataset.courier);if(c&&c.claude){clearInterval(t);el.classList.add("on");el.querySelector(".txt").innerHTML="<b>Connected.</b> Claude can send "+c.name.replace(/[<&>]/g,"")+" now.";const n=document.getElementById("next");n.className="btn";n.textContent="Continue";n.href=${JSON.stringify(done)};setTimeout(()=>{location.href=n.href},2500);}}catch{}},2500)})()</script>`,
          )
        : undefined,
  });
}

export function connectingPage(human: Human, courier: Courier): string {
  const look = courierLook(human, courier);
  return cpage(
    "Setting up",
    human,
    html`<main class="ob">
      <div class="ob-txt">
        ${progress(3)}
        <h1 class="big">Opening <span class="hfit" data-fit>${courier.name}’s</span> errand&nbsp;room.</h1>
        <ul class="chk">
          <li style="--d:.2s">${OK}${human.simulated ? html`Demo: simulated&nbsp;${PP}` : html`Verified by&nbsp;${PP}`}</li>
          <li style="--d:.9s">${OK}${courier.name} got its ID</li>
          <li style="--d:1.6s">${OK}${config.anthropicConfigured ? `Runs on Claude` : "Runs on a demo stand-in for Claude"}</li>
        </ul>
        <div class="acts-row" style="margin-top:40px"><a class="btn" href="/app?welcome=1&c=${courier.id}">Continue${ARROW}</a></div>
      </div>
      <div class="stage c">${dots()}<div class="card-wrap">${idCard(look, firstName(human))}</div></div>
    </main>
    ${raw(`<script>setTimeout(()=>{location.href="/app?welcome=1&c=${encodeURIComponent(courier.id)}"},3000)</script>`)}`,
    { bodyClass: "onb" },
  );
}
