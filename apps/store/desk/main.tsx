import {
  AgStudioAiModule,
  createAiHarness,
  directLlmRunner,
  enableStudioDevValidations,
  singleColumnLayout,
  studioTheme,
} from "ag-studio";
import { AgStudio, AgStudioProvider, createWidgets } from "ag-studio-react";
import { StrictMode, useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { deskAdapter } from "./adapter.ts";
import { type DeskJson, sourceKey, toStudioData } from "./data.ts";
import { DEFAULT_REPORT } from "./report.ts";
import { deskWidgetTypes } from "./widgets.tsx";

/* The desk's report builder (the Reports page). The server sends the frame and a boot record; this draws the rest. */

interface Boot {
  api: string;
  shop?: string;
  licenseKey: string | null;
  agent: { enabled: boolean; note: string };
}

if (process.env.NODE_ENV !== "production") enableStudioDevValidations();

/*
 * Studio formats numbers in the browser's language, so a French browser showed "$243,00" under a "$243.00" the rest of
 * Courier prints. The shop's money is US dollars, so numbers here default to US English. Only this page loads this.
 */
{
  const Native = Intl.NumberFormat;
  // A function declaration, not an arrow (which the formatter would turn a function expression into): Studio calls
  // `new Intl.NumberFormat(…)`, and an arrow can't be called with `new`.
  function UsNumberFormat(locales?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
    return new Native(locales ?? "en-US", options);
  }
  const usd = UsNumberFormat as unknown as typeof Intl.NumberFormat;
  Object.defineProperty(usd, "prototype", { value: Native.prototype });
  Object.defineProperty(usd, "supportedLocalesOf", { value: Native.supportedLocalesOf });
  Intl.NumberFormat = usd;
  const toLocale = Number.prototype.toLocaleString;
  Number.prototype.toLocaleString = function (
    this: number,
    locales?: Intl.LocalesArgument,
    options?: Intl.NumberFormatOptions,
  ) {
    return toLocale.call(this, locales ?? "en-US", options);
  };
}

const POLL_MS = 20_000;
const PHONE = "(max-width: 700px)";

/** Courier's look: paper canvas, white cards, cobalt accent, Archivo for titles. Mirrors courier.css's tokens. */
const theme = studioTheme.withParams({
  accentColor: "#3d3af5",
  backgroundColor: "#ffffff",
  foregroundColor: "#141414",
  textColor: "#141414",
  borderColor: "#e6e1d8",
  fontFamily: "'Instrument Sans', system-ui, sans-serif",
  fontSize: 14,
  borderRadius: 8,
  studioMinWidth: 0,
  studioCanvasBackgroundColor: "#f2efe9",
  studioWidgetBackgroundColor: "#ffffff",
  studioWidgetBorderRadius: 14,
  studioWidgetShadow: "none",
  studioWidgetTitleFontFamily: "'Archivo', system-ui, sans-serif",
  studioWidgetTitleFontWeight: 800,
  studioWidgetTitleFontSize: 15,
  studioWidgetTitleTextColor: "#141414",
  studioPanelHeaderFontFamily: "'Archivo', system-ui, sans-serif",
  chartPaletteFills1Color: "#3d3af5",
  chartPaletteFills2Color: "#ff5a1f",
  chartPaletteFills3Color: "#141414",
  chartPaletteFills4Color: "#ffc629",
  chartPaletteFills5Color: "#0a7a4a",
  chartPaletteFills6Color: "#0070e0",
  chartPaletteFills7Color: "#e8352a",
  chartPaletteFills8Color: "#9a958c",
  chartPaletteStrokes1Color: "#3d3af5",
  chartPaletteStrokes2Color: "#ff5a1f",
  chartPaletteStrokes3Color: "#141414",
  chartPaletteStrokes4Color: "#ffc629",
  chartPaletteStrokes5Color: "#0a7a4a",
  chartPaletteStrokes6Color: "#0070e0",
  chartPaletteStrokes7Color: "#e8352a",
  chartPaletteStrokes8Color: "#9a958c",
} as any);

const CLERK = `You are the shop's clerk at its desk. The shopkeeper asks about the couriers (AI shopping agents) that shop here, and you answer with numbers or change the dashboard.
- Tables: orders (one row per order; "revenue" is the paid total), door (who was let in or turned away, with a reason), couriers (totals per courier).
- To answer a question, query the data yourself (execute_query) and reply in a sentence or two with the numbers.
- When they ask to see, show or chart something, build it on the page: delegate to planning, page and widget as usual. Group couriers by "Top courier" rather than "Courier" so a chart stays readable.
- "This week" means placedAt (orders) or at (door) within the last 7 days.
- For courier ID cards or the PayPal proof of an order, use add_desk_card.
- Couriers are known by name and pseudonym only. Never guess who is behind one.`;

const PROMPT_STARTERS = [
  { label: "Revenue by courier this week", prompt: "Show revenue by courier this week." },
  { label: "Bots turned away", prompt: "Which bots got turned away and why?" },
  { label: "Orders by day", prompt: "Chart orders by day for the last two weeks." },
];

function Desk({ boot }: { boot: Boot }) {
  const [desk, setDesk] = useState<DeskJson | null>(null);
  const [failed, setFailed] = useState(false);
  const [phone, setPhone] = useState(() => matchMedia(PHONE).matches);

  useEffect(() => {
    const media = matchMedia(PHONE);
    const onChange = () => setPhone(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let live = true;
    const load = () =>
      fetch(`${boot.api}/desk`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((json: DeskJson) => {
          if (!live) return;
          setDesk(json);
          setFailed(false);
        })
        .catch(() => live && setFailed(true));
    load();
    const timer = setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [boot.api]);

  const data = useMemo(() => (desk ? toStudioData(desk) : undefined), [desk]);
  const widgets = useCallback(
    (defaults: any) =>
      createWidgets<any>({
        additionalTypes: deskWidgetTypes() as any,
        menu: [...defaults.menu, { label: "Courier", widgetIds: ["courier-cards", "paypal-proof"] }],
      }),
    [],
  );

  const ai = useMemo(() => {
    if (!boot.agent.enabled) return undefined;
    const adapter = deskAdapter(`${boot.api}/llm`);
    return ({ api }: any) =>
      createAiHarness(api, ({ builtIn }: any) => {
        const addCard = api.defineAiTool({
          name: "add_desk_card",
          description:
            "Add one of the desk's own widgets below the others on the page: courier ID cards or PayPal proof.",
          params: (s: any) =>
            s.object({
              card: s.enum(["courier-cards", "paypal-proof"]),
              title: s.string({ description: "The widget's title." }).optional(),
            }),
          execute: (args: { card: string; title?: string }, ctx: any) => {
            const state = api.getState();
            const page = state.pages.find((p: any) => p.id === state.selectedPageId) ?? state.pages[0];
            const bottom = Math.max(0, ...Object.values(page.widgetLayout ?? {}).map((l: any) => l.yTrack + l.ySpan));
            const id = `${args.card}-${Date.now().toString(36)}`;
            const wide = args.card === "courier-cards";
            api.setState({
              ...state,
              pages: state.pages.map((p: any) =>
                p !== page
                  ? p
                  : {
                      ...p,
                      widgets: {
                        ...p.widgets,
                        [id]: {
                          type: args.card,
                          dataMapping: {},
                          format: {
                            title: { enabled: true, text: args.title ?? (wide ? "Top couriers" : "Latest payment") },
                          },
                        },
                      },
                      widgetLayout: {
                        ...p.widgetLayout,
                        [id]: { xTrack: 0, yTrack: bottom, xSpan: wide ? 16 : 8, ySpan: 14 },
                      },
                    },
              ),
            });
            return ctx.success(`Added ${args.card} as widget ${id}.`, { id });
          },
        });
        const { lead, ...helpers } = builtIn;
        const clerk = directLlmRunner({
          ...lead,
          id: "clerk",
          name: "Clerk",
          description: "The shop's clerk: answers questions about couriers and orders, and builds charts.",
          adapter,
          // The lead's own instructions and tools, so the clerk still plans and delegates the way Studio expects.
          instructions: (ctx: any, params: any) => `${CLERK}\n\n${lead.instructions?.(ctx, params) ?? ""}`,
          tools: (ctx: any, params: any) => [
            ...(lead.tools?.(ctx, params) ?? []),
            api.getAiTools().executeQuery(),
            addCard,
          ],
        } as any);
        return {
          agents: [
            clerk,
            ...Object.values(helpers).map((definition: any) => directLlmRunner({ ...definition, adapter })),
          ],
          primary: "clerk",
          promptStarters: PROMPT_STARTERS,
        };
      });
  }, [boot]);

  if (!desk || !data)
    return <p className="dk-wait">{failed ? "Couldn’t load the desk. Retrying…" : "Opening the desk…"}</p>;

  return (
    <AgStudio<any>
      // Studio can't take a new source while running, so one arriving (refunds, say) starts it afresh.
      key={`${sourceKey(desk)}|${phone ? "phone" : "desk"}`}
      className="dk-studio"
      data={data as any}
      mode={phone ? "view" : "edit"}
      initialState={DEFAULT_REPORT}
      widgets={widgets as any}
      theme={theme}
      layout={{ minWidth: 250 } as any}
      responsiveLayoutBreakpoints={[{ maxWidth: 700, layout: singleColumnLayout }] as any}
      ai={phone ? undefined : (ai as any)}
    />
  );
}

const root = document.getElementById("desk");
if (root) {
  const boot = JSON.parse(root.dataset.boot ?? "{}") as Boot;
  createRoot(root).render(
    <StrictMode>
      <AgStudioProvider
        modules={boot.agent?.enabled ? [AgStudioAiModule] : []}
        licenseKey={boot.licenseKey ?? undefined}
      >
        <Desk boot={boot} />
      </AgStudioProvider>
    </StrictMode>,
  );
}
