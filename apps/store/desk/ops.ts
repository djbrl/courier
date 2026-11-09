import {
  AllCommunityModule,
  type ColDef,
  createGrid,
  type GridApi,
  type GridOptions,
  type ICellRendererParams,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import type {
  CourierFace,
  CourierRow,
  DoorRow,
  NeedRow,
  OrderRow,
  ParcelRow,
  ReasonRow,
  ShopDesk,
} from "../src/desk-ops.ts";

/*
 * The shop desk in the browser. The server draws every page as plain lists; on a wide screen this swaps them for AG Grid
 * tables that sort, filter and refresh every few seconds, and wires the buttons and the clerk. Everything a courier or a
 * customer wrote goes in as text, never as markup.
 */

ModuleRegistry.registerModules([AllCommunityModule]);

interface Boot {
  shop: string;
  view: "today" | "orders" | "door" | "couriers" | "reports";
  api: string;
  desk: ShopDesk;
}

const bootEl = document.getElementById("dk-boot");
const boot = bootEl ? (JSON.parse(bootEl.textContent ?? "{}") as Boot) : null;
const WIDE = matchMedia("(min-width: 900px)");
const POLL_MS = 8000;

/** Courier's look for the grids: paper header, hairlines, cobalt for focus, the app's fonts. */
const theme = themeQuartz.withParams({
  accentColor: "#3d3af5",
  backgroundColor: "#ffffff",
  foregroundColor: "#141414",
  borderColor: "#e6e1d8",
  headerBackgroundColor: "#f7f5f0",
  headerTextColor: "#4f4b45",
  headerFontWeight: 700,
  headerFontSize: 13,
  fontFamily: "'Instrument Sans', system-ui, sans-serif",
  fontSize: 14,
  rowHoverColor: "#f7f5f0",
  selectedRowBackgroundColor: "#ecebff",
  wrapperBorderRadius: 14,
  rowVerticalPaddingScale: 1.25,
  spacing: 7,
  oddRowBackgroundColor: "#ffffff",
});

/* ---------------- small DOM helpers: text in, never HTML ---------------- */

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: { className?: string; text?: string; title?: string; style?: string } = {},
  ...children: (Node | string | null | undefined)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props.className) node.className = props.className;
  if (props.text !== undefined) node.textContent = props.text;
  if (props.title) node.title = props.title;
  if (props.style) node.setAttribute("style", props.style);
  for (const child of children) if (child !== null && child !== undefined) node.append(child);
  return node;
}

function who(face: CourierFace | null, sub?: string | null): HTMLElement {
  const pt = el("span", { className: face ? "pt" : "pt dk-noid" });
  if (face) {
    pt.style.background = face.color;
    const img = el("img");
    img.src = `/assets/avatars/${encodeURIComponent(face.avatar)}.svg`;
    img.alt = "";
    pt.append(img);
  } else pt.textContent = "?";
  return el(
    "span",
    { className: "dk-who" },
    pt,
    el("span", {}, el("b", { text: face?.name ?? "Unknown bot" }), sub ? el("small", { text: sub }) : null),
  );
}

const pill = (text: string, kind = "") => el("span", { className: `dk-pill ${kind}`, text });

const pillKind = (text: string) => {
  const t = text.toLowerCase();
  if (/refund/.test(t)) return "s-refund";
  if (/deliver/.test(t)) return "s-done";
  if (/turned away|reported|failed|cancel/.test(t)) return "s-bad";
  if (/waiting|never/.test(t)) return "s-wait";
  if (/let in|good|paid/.test(t)) return "s-ok";
  return "s-move";
};

const ACTION_LABEL: Record<string, string> = {
  confirm: "Confirm refund",
  decline: "Decline",
  cancel: "Cancel order",
  refund_rest: "Refund the rest",
  refund_all: "Refund in full",
  ok: "Looks right",
  report: "Report courier",
  dismiss: "Dismiss",
  refund: "Refund",
};

function button(
  act: string,
  data: { need?: string; orderId?: string | null; visaId?: string | null; actionId?: string | null },
  primary = false,
): HTMLButtonElement {
  const b = el("button", {
    className: `btn sm ${primary ? (act === "report" ? "danger" : "") : "ghost"}`,
    text: ACTION_LABEL[act] ?? act,
  });
  b.type = "button";
  b.dataset.act = act;
  b.dataset.need = data.need ?? "";
  b.dataset.order = data.orderId ?? "";
  b.dataset.visa = data.visaId ?? "";
  b.dataset.actionId = data.actionId ?? "";
  return b;
}

/* ---------------- toasts and actions ---------------- */

function toast(message: string, bad = false) {
  let box = document.querySelector<HTMLElement>(".dk-toasts");
  if (!box) {
    box = el("div", { className: "dk-toasts" });
    box.setAttribute("role", "status");
    document.body.append(box);
  }
  const t = el("div", { className: `dk-toast ${bad ? "bad" : ""}`, text: message });
  box.append(t);
  setTimeout(() => t.classList.add("out"), 3800);
  setTimeout(() => t.remove(), 4300);
}

/** What a button that moves money or suspends a courier says while it waits for a second click. */
const SURE: Record<string, string> = {
  confirm: "Click again to refund",
  report: "Click again to report",
  cancel: "Click again to cancel",
};

async function act(b: HTMLButtonElement) {
  const a = b.dataset.act!;
  // A second click on the same button within a few seconds, rather than a browser dialog that stops the page.
  if (SURE[a] && b.dataset.armed !== "1") {
    const label = b.textContent;
    b.dataset.armed = "1";
    b.textContent = SURE[a];
    b.classList.add("armed");
    setTimeout(() => {
      if (!b.isConnected || b.dataset.armed !== "1") return;
      b.dataset.armed = "";
      b.textContent = label;
      b.classList.remove("armed");
    }, 4000);
    return;
  }
  b.dataset.armed = "";
  b.disabled = true;
  try {
    const res = await fetch(`${boot!.api}/act`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        act: a,
        need: b.dataset.need,
        orderId: b.dataset.order,
        visaId: b.dataset.visa,
        actionId: b.dataset.actionId,
      }),
    });
    const out = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    if (!res.ok) toast(out.error ?? "That didn't work.", true);
    else toast(out.message ?? "Done.");
  } catch {
    toast("Couldn't reach the shop. Try again.", true);
  }
  await refresh(true);
  b.disabled = false;
}

document.addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-act]");
  if (b && boot) {
    e.preventDefault();
    e.stopPropagation();
    void act(b);
  }
});

/* ---------------- the grids ---------------- */

const base = <T>(rows: T[], cols: ColDef<T>[], extra: Partial<GridOptions<T>> = {}): GridOptions<T> => ({
  theme,
  rowData: rows,
  columnDefs: cols,
  domLayout: "autoHeight",
  rowHeight: 58,
  pagination: true,
  paginationPageSize: 12,
  paginationPageSizeSelector: false,
  suppressCellFocus: true,
  enableCellTextSelection: true,
  defaultColDef: { sortable: true, resizable: true, suppressMovable: true, wrapHeaderText: true },
  overlayNoRowsTemplate: '<span class="dk-none">Nothing here yet.</span>',
  ...extra,
});

const render =
  <T>(fn: (row: T) => Node | string) =>
  (p: ICellRendererParams<T>) =>
    p.data ? fn(p.data) : "";

const wrap = { wrapText: true, autoHeight: true, cellClass: "dk-wrap" } as const;

const grids = new Map<string, GridApi<any>>();

function mount<T>(key: string, opts: GridOptions<T>) {
  const host = document.querySelector<HTMLElement>(`[data-grid="${key}"]`);
  if (!host) return null;
  const box = el("div", { className: `dk-grid dk-grid-${key}` });
  host.replaceWith(box);
  const api = createGrid(box, opts);
  grids.set(key, api);
  return api;
}

function needsGrid(rows: NeedRow[]) {
  return mount<NeedRow>(
    "needs",
    base(
      rows,
      [
        {
          headerName: "What",
          field: "at",
          width: 160,
          sort: "desc",
          cellRenderer: render<NeedRow>((r) =>
            el("span", { className: "dk-stack" }, pill(r.what, `k-${r.kind}`), el("small", { text: r.ago })),
          ),
        },
        {
          headerName: "Courier",
          field: "courier.name",
          flex: 1,
          minWidth: 160,
          cellRenderer: render<NeedRow>((r) => who(r.courier, r.pseudonym)),
        },
        {
          headerName: "Item",
          field: "item",
          flex: 1,
          minWidth: 150,
          cellRenderer: render<NeedRow>((r) =>
            el(
              "span",
              { className: "dk-stack" },
              el("b", { text: r.item }),
              r.amount ? el("small", { text: r.amount }) : null,
            ),
          ),
          ...wrap,
        },
        { headerName: "Why it's here", field: "why", flex: 2.2, minWidth: 240, ...wrap },
        {
          headerName: "",
          colId: "acts",
          width: 250,
          sortable: false,
          cellRenderer: render<NeedRow>((r) =>
            el(
              "span",
              { className: "dk-acts" },
              ...r.actions.map((a, i) =>
                button(a, { need: r.id, orderId: r.orderId, visaId: r.visaId, actionId: r.actionId }, i === 0),
              ),
            ),
          ),
        },
      ],
      {
        getRowId: (p) => p.data.id,
        pagination: false,
        overlayNoRowsTemplate:
          '<span class="dk-none"><b>Nothing needs you.</b> Couriers are shopping inside their limits.</span>',
      },
    ),
  );
}

function parcelsGrid(rows: ParcelRow[]) {
  return mount<ParcelRow>(
    "parcels",
    base(
      rows,
      [
        {
          headerName: "Courier",
          field: "courier.name",
          flex: 1,
          minWidth: 140,
          cellRenderer: render<ParcelRow>((r) => who(r.courier)),
        },
        { headerName: "Item", field: "item", flex: 1.2, ...wrap },
        {
          headerName: "Where",
          field: "step",
          width: 150,
          cellRenderer: render<ParcelRow>((r) => pill(r.step, pillKind(r.step))),
          enableCellChangeFlash: true,
        },
      ],
      { getRowId: (p) => p.data.orderId, pagination: false },
    ),
  );
}

function ordersGrid(rows: OrderRow[]) {
  const api = mount<OrderRow>(
    "orders",
    base(
      rows,
      [
        {
          headerName: "Placed",
          field: "placedAt",
          width: 150,
          sort: "desc",
          valueFormatter: (p) => p.data?.placed ?? "",
        },
        {
          headerName: "Courier",
          field: "courier.name",
          width: 210,
          cellRenderer: render<OrderRow>((r) => who(r.courier, r.pseudonym)),
          getQuickFilterText: (p) => `${p.data?.courier.name} ${p.data?.pseudonym}`,
        },
        { headerName: "Item", field: "item", flex: 1, minWidth: 220, ...wrap },
        {
          headerName: "Amount",
          field: "amountCents",
          width: 110,
          type: "rightAligned",
          valueFormatter: (p) => p.data?.amount ?? "",
        },
        {
          headerName: "Where it is",
          field: "stage",
          width: 170,
          enableCellChangeFlash: true,
          cellRenderer: render<OrderRow>((r) => pill(r.stage, pillKind(r.stage))),
        },
        { headerName: "Paid with", field: "paidWith", width: 150 },
        { headerName: "Order", field: "orderId", flex: 1, minWidth: 150, cellClass: "dk-mono" },
      ],
      {
        getRowId: (p) => p.data.orderId,
        rowSelection: { mode: "singleRow", checkboxes: false, enableClickSelection: true },
        onSelectionChanged: (e) => showOrder(e.api.getSelectedRows()[0] ?? null, true),
      },
    ),
  );
  return api;
}

/** The proof behind one order: what the errand was for, its limits, PayPal's check, the parcel and any return. */
function showOrder(o: OrderRow | null, scroll = false) {
  const box = document.getElementById("dk-detail");
  if (!box) return;
  box.replaceChildren();
  box.hidden = !o;
  if (!o) return;
  const dl = el("dl", { className: "dk-facts" });
  const fact = (k: string, v: string | Node | null | undefined) => {
    if (!v) return;
    dl.append(el("dt", { text: k }), el("dd", {}, v));
  };
  fact("For", o.errand ? `“${o.errand}”` : "Anything within the limits");
  fact("Limits", o.limits);
  fact("Person", o.verified);
  fact("Pseudonym", el("code", { text: o.pseudonym }));
  fact("Paid with", o.paidWith || o.status);
  fact("PayPal capture", o.captureId ? el("code", { text: o.captureId }) : null);
  fact("Pass", el("code", { text: o.visaId }));
  if (o.refunded) fact("Refunded", o.refunded);
  const parts: (Node | null)[] = [
    el(
      "header",
      { className: "dk-detail-h" },
      who(o.courier, o.pseudonym),
      el("span", {}, el("b", { text: o.item }), el("small", { text: `${o.placed} · ${o.amount}` })),
      pill(o.stage, pillKind(o.stage)),
    ),
    dl,
  ];
  if (o.parcel) {
    const steps = el("ol", { className: "dk-steps" });
    for (const s of o.parcel.steps) steps.append(el("li", { className: s.done ? "done" : "", text: s.label }));
    parts.push(
      el("div", { className: "dk-parcel" }, el("small", { text: `${o.parcel.carrier} · ${o.parcel.tracking}` }), steps),
    );
  }
  if (o.returned) {
    parts.push(
      el(
        "div",
        { className: "dk-return" },
        el("b", { text: `${o.returned.decision}: ${o.returned.amount}` }),
        el("p", { text: `The courier said: “${o.returned.reason}”` }),
        el("p", { text: `${o.returned.by} replied: “${o.returned.note}”` }),
      ),
    );
  }
  const acts = el("div", { className: "dk-acts" });
  if (o.status === "Paid" && o.stage !== "Refunded")
    acts.append(button(o.refunded ? "refund_rest" : "refund_all", { orderId: o.orderId }, true));
  if (o.status === "Waiting to pay") acts.append(button("cancel", { orderId: o.orderId }, true));
  if (!o.reported) acts.append(button("report", { orderId: o.orderId, visaId: o.visaId }));
  else acts.append(pill("Reported", "s-bad"));
  parts.push(acts);
  box.append(...(parts.filter(Boolean) as Node[]));
  if (scroll) box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function doorGrid(rows: DoorRow[]) {
  return mount<DoorRow>(
    "door",
    base(
      rows,
      [
        { headerName: "When", field: "at", width: 150, sort: "desc", valueFormatter: (p) => p.data?.when ?? "" },
        {
          headerName: "Who",
          field: "courier",
          width: 200,
          cellRenderer: render<DoorRow>((r) => who(r.face, r.pseudonym)),
          getQuickFilterText: (p) => `${p.data?.courier} ${p.data?.pseudonym ?? ""}`,
        },
        { headerName: "Tried to", field: "action", width: 130 },
        {
          headerName: "Outcome",
          field: "reason",
          width: 190,
          cellRenderer: render<DoorRow>((r) => pill(r.allowed ? "Let in" : r.reason, r.allowed ? "s-ok" : "s-bad")),
        },
        { headerName: "In detail", field: "detail", flex: 1, minWidth: 260, ...wrap },
        {
          headerName: "",
          colId: "acts",
          width: 160,
          sortable: false,
          cellRenderer: render<DoorRow>((r) =>
            !r.allowed && r.visaId
              ? r.reported
                ? pill("Reported", "s-bad")
                : button("report", { visaId: r.visaId })
              : "",
          ),
        },
      ],
      {
        getRowId: (p) => p.data.id,
        isExternalFilterPresent: () => true,
        doesExternalFilterPass: (node) =>
          Boolean(node.data) &&
          (showLetIn || !node.data!.allowed) &&
          (!reasonFilter || node.data!.reason === reasonFilter),
      },
    ),
  );
}
let showLetIn = false;
let reasonFilter = "";

function couriersGrid(rows: CourierRow[]) {
  return mount<CourierRow>(
    "couriers",
    base(
      rows,
      [
        {
          headerName: "Courier",
          field: "courier.name",
          width: 220,
          cellRenderer: render<CourierRow>((r) => who(r.courier, r.pseudonym)),
          getQuickFilterText: (p) => `${p.data?.courier.name} ${p.data?.pseudonym}`,
        },
        { headerName: "Orders", field: "orders", width: 100, type: "rightAligned" },
        {
          headerName: "Paid, after refunds",
          field: "paidCents",
          width: 160,
          type: "rightAligned",
          sort: "desc",
          valueFormatter: (p) => p.data?.paid ?? "",
        },
        { headerName: "Refunds", field: "refunds", width: 100, type: "rightAligned" },
        { headerName: "Turned away", field: "turnedAway", width: 120, type: "rightAligned" },
        { headerName: "Last seen", field: "lastSeen", width: 130, valueFormatter: (p) => p.data?.lastAgo ?? "" },
        {
          headerName: "Standing",
          field: "standing",
          width: 130,
          cellRenderer: render<CourierRow>((r) => pill(r.standing, pillKind(r.standing))),
        },
        {
          headerName: "",
          colId: "acts",
          flex: 1,
          minWidth: 150,
          sortable: false,
          cellRenderer: render<CourierRow>((r) =>
            r.standing === "Reported" || !r.visaIds.length ? "" : button("report", { visaId: r.visaIds.at(-1) }),
          ),
        },
      ],
      { getRowId: (p) => p.data.pseudonym },
    ),
  );
}

/* ---------------- the page's plain parts ---------------- */

function updateCounts(desk: ShopDesk) {
  for (const node of document.querySelectorAll<HTMLElement>("[data-count]")) {
    const key = node.dataset.count as keyof ShopDesk["counts"];
    const value = String(desk.counts[key] ?? "");
    // The needs badges (rail and section title) hide at zero rather than show a 0.
    if (key === "needs" && (node.closest(".rail") || node.classList.contains("dk-badge"))) {
      node.hidden = desk.counts.needs === 0;
      node.textContent = value;
      continue;
    }
    if (node.textContent !== value) {
      node.textContent = value;
      node.classList.remove("bump");
      void node.offsetWidth;
      node.classList.add("bump");
    }
  }
}

function updateReasons(rows: ReasonRow[]) {
  const list = document.querySelector<HTMLElement>('[data-grid="reasons"]');
  if (!list) return;
  list.replaceChildren(
    ...rows
      .slice(0, 8)
      .map((r) =>
        el(
          "li",
          {},
          el("span", { className: "dk-count", text: String(r.count) }),
          el(
            "span",
            { className: "dk-li-m" },
            el("b", { text: r.reason }),
            el("small", { text: `Last: ${r.lastCourier}, ${r.lastAgo}` }),
          ),
        ),
      ),
  );
}

/* ---------------- refresh ---------------- */

let busy = false;
async function refresh(now = false) {
  if (!boot || busy || (!now && document.visibilityState !== "visible")) return;
  busy = true;
  try {
    const res = await fetch(boot.api, { cache: "no-store" });
    if (!res.ok) return;
    const desk = (await res.json()) as ShopDesk;
    boot.desk = desk;
    updateCounts(desk);
    updateReasons(desk.reasons);
    grids.get("needs")?.setGridOption("rowData", desk.needs);
    grids.get("parcels")?.setGridOption(
      "rowData",
      desk.parcels.filter((p) => !p.delivered),
    );
    grids.get("door")?.setGridOption("rowData", desk.door);
    grids.get("couriers")?.setGridOption("rowData", desk.couriers);
    const orders = grids.get("orders");
    if (orders) {
      orders.setGridOption("rowData", desk.orders);
      const picked = orders.getSelectedRows()[0] as OrderRow | undefined;
      if (picked) showOrder(desk.orders.find((o) => o.orderId === picked.orderId) ?? null);
    }
    // On a phone the lists are the server's; a fresh page is the simplest way to show what changed.
    if (!WIDE.matches && now) location.reload();
  } catch {
    // The next poll tries again.
  } finally {
    busy = false;
  }
}

/* ---------------- filters and export ---------------- */

function wireTools() {
  for (const input of document.querySelectorAll<HTMLInputElement>("[data-filter]")) {
    input.addEventListener("input", () =>
      grids.get(input.dataset.filter!)?.setGridOption("quickFilterText", input.value),
    );
  }
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-export]")) {
    b.addEventListener("click", () =>
      grids.get(b.dataset.export!)?.exportDataAsCsv({
        fileName: `${boot!.shop}-${b.dataset.export}.csv`,
        columnKeys: ["placedAt", "courier.name", "item", "amountCents", "stage", "paidWith", "orderId"],
        processCellCallback: (p) =>
          p.column.getColId() === "amountCents" ? ((p.value as number) / 100).toFixed(2) : String(p.value ?? ""),
      }),
    );
  }
  const letIn = document.querySelector<HTMLInputElement>("[data-show-let-in]");
  letIn?.addEventListener("change", () => {
    showLetIn = letIn.checked;
    grids.get("door")?.onFilterChanged();
  });
  for (const chip of document.querySelectorAll<HTMLButtonElement>("[data-reason]")) {
    chip.addEventListener("click", () => {
      reasonFilter = reasonFilter === chip.dataset.reason ? "" : chip.dataset.reason!;
      for (const c of document.querySelectorAll<HTMLElement>("[data-reason]"))
        c.setAttribute("aria-pressed", String(c.dataset.reason === reasonFilter));
      grids.get("door")?.onFilterChanged();
    });
  }
  const pick = document.querySelector<HTMLSelectElement>("select[data-autosubmit]");
  pick?.addEventListener("change", () => {
    location.href = `/desk/${encodeURIComponent(pick.value)}${boot && boot.view !== "today" ? `/${boot.view}` : ""}`;
  });
}

/* ---------------- the clerk ---------------- */

interface ClerkReply {
  reply?: string;
  error?: string;
  actions?: { id: string; order_id: string; amount: string; note: string }[];
}

function wireClerk() {
  const drawer = document.getElementById("dk-clerk");
  const chat = document.getElementById("dk-chat");
  const form = document.getElementById("dk-ask") as HTMLFormElement | null;
  if (!drawer || !chat || !form || !boot) return;
  const history: { role: "user" | "assistant"; content: string }[] = [];
  const open = (on: boolean) => {
    drawer.hidden = !on;
    document.body.classList.toggle("dk-clerk-on", on);
    // On a phone the clerk opens from the menu, so fold the menu away under it.
    if (on) {
      document.querySelector(".rail")?.classList.remove("open");
      document.querySelector(".rail-menu")?.setAttribute("aria-expanded", "false");
      form.querySelector("input")?.focus();
    }
  };
  for (const b of document.querySelectorAll("[data-clerk-open]")) b.addEventListener("click", () => open(true));
  for (const b of document.querySelectorAll("[data-clerk-close]")) b.addEventListener("click", () => open(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && open(false));

  const say = async (text: string) => {
    history.push({ role: "user", content: text });
    chat.append(el("li", { className: "dk-msg me", text }));
    const thinking = el("li", { className: "dk-msg them wait", text: "Looking…" });
    chat.append(thinking);
    chat.scrollTop = chat.scrollHeight;
    try {
      const res = await fetch(`${boot.api}/clerk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const out = (await res.json().catch(() => ({}))) as ClerkReply;
      const reply = out.reply ?? out.error ?? "The clerk couldn't answer that.";
      history.push({ role: "assistant", content: reply });
      thinking.replaceWith(el("li", { className: "dk-msg them", text: reply }));
      for (const a of out.actions ?? []) {
        chat.append(
          el(
            "li",
            { className: "dk-msg them dk-prop" },
            el("b", { text: `Refund $${a.amount} on ${a.order_id}?` }),
            el("small", { text: `“${a.note}” Also waiting in Needs you.` }),
            el(
              "span",
              { className: "dk-acts" },
              button("confirm", { actionId: a.id }, true),
              button("decline", { actionId: a.id }),
            ),
          ),
        );
      }
      if (out.actions?.length) void refresh(true);
    } catch {
      thinking.replaceWith(el("li", { className: "dk-msg them", text: "Couldn't reach the clerk. Try again." }));
    }
    chat.scrollTop = chat.scrollHeight;
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input")!;
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    void say(text);
  });
  for (const b of drawer.querySelectorAll<HTMLButtonElement>("[data-say]"))
    b.addEventListener("click", () => void say(b.dataset.say!));
}

/* ---------------- start ---------------- */

if (boot) {
  const d = boot.desk;
  if (WIDE.matches) {
    if (boot.view === "today") {
      needsGrid(d.needs);
      parcelsGrid(d.parcels.filter((p) => !p.delivered));
    }
    if (boot.view === "orders") ordersGrid(d.orders);
    if (boot.view === "door") doorGrid(d.door);
    if (boot.view === "couriers") couriersGrid(d.couriers);
  }
  wireTools();
  wireClerk();
  if (boot.view !== "reports") setInterval(() => void refresh(), POLL_MS);
}
