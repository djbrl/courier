import type { AgSort, AgWidgetApi, AgWidgetField, AgWidgetRowsResult } from "ag-studio";
import { AgNoDataOverlay } from "ag-studio-react";
import { useEffect, useState } from "react";

/*
 * The desk's own widgets: a strip of courier ID cards, and the PayPal proof behind an order. Both read through
 * Studio's data API, so page filters and cross filters (clicking a bar, a row) narrow them like any other widget.
 */

/** Band and text colours of each courier colour, as on the Courier ID card (packages/shared/src/courier.ts). */
const BANDS: Record<string, { band: string; ink: string; slash: string }> = {
  cobalt: { band: "#3D3AF5", ink: "#FFFFFF", slash: "#D6FF2E" },
  tang: { band: "#FF6B2C", ink: "#141414", slash: "#FFFFFF" },
  ink: { band: "#141414", ink: "#FFFFFF", slash: "#D6FF2E" },
  hivis: { band: "#D6FF2E", ink: "#141414", slash: "#141414" },
};

type Rows = Record<string, any>[] | null;

/** The fields of one source, by id ("couriers.revenue" → field). */
function fieldsOf(widgetApi: AgWidgetApi, table: string): Map<string, AgWidgetField> {
  const found = widgetApi.getSchema().find((t) => t.id === table);
  return new Map((found?.fields ?? []).map((f) => [String(f.fieldId).split(".").pop()!, f]));
}

/** Rows from one source, kept up to date as data, filters and cross filters change. */
function useRows(widgetApi: AgWidgetApi, table: string, names: string[], sortBy: string, limit: number): Rows {
  const [rows, setRows] = useState<Rows>(null);
  const key = `${table}:${names.join(",")}:${sortBy}:${limit}`;
  useEffect(() => {
    const byName = fieldsOf(widgetApi, table);
    const fields = names.map((n) => byName.get(n)).filter((f): f is AgWidgetField => Boolean(f));
    const sortField = byName.get(sortBy);
    if (!fields.length) {
      setRows([]);
      return;
    }
    let live = true;
    const keyed = (result: AgWidgetRowsResult) =>
      result.rows.map((row) => Object.fromEntries(fields.map((f, i) => [names[i], row[f.key]])));
    const sort: AgSort[] = sortField ? [{ field: sortField, direction: "desc" }] : [];
    widgetApi
      .getData(
        { fields, sort, limit: { count: limit } },
        {
          queryId: "rows",
          onDataUpdated: (newer) => {
            if (live && !newer.replaced) setRows(keyed(newer.results));
          },
        },
      )
      .then((response) => {
        if (live && !response.replaced) setRows(keyed(response.results));
      })
      .catch(() => live && setRows([]));
    return () => {
      live = false;
    };
    // `key` stands for table, names, sortBy and limit.
  }, [widgetApi, key]);
  return rows;
}

const dollars = (n: unknown) =>
  typeof n === "number" ? n.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "–";

/** "PayPal" as Courier writes it everywhere: a two-colour text lockup, never the logo mark. */
export const PayPalWord = () => (
  <span className="pp">
    <span className="a">Pay</span>
    <span className="b">Pal</span>
  </span>
);

const CARD_FIELDS = ["courier", "pseudonym", "color", "avatar", "revenue", "orders", "turnedAway"];

export function CourierCards({ widgetApi, format }: { widgetApi: AgWidgetApi; format?: any }) {
  const limit = Number(format?.style?.cards) || 6;
  const rows = useRows(widgetApi, "couriers", CARD_FIELDS, "revenue", limit);
  if (rows === null) return null;
  if (!rows.length) return <AgNoDataOverlay />;
  return (
    <div className="dkw-cards">
      {rows.map((r) => {
        const band = BANDS[r.color] ?? BANDS.cobalt;
        return (
          <article
            key={r.pseudonym}
            className="dkw-card"
            style={{ "--band": band.band, "--bink": band.ink, "--slash": band.slash } as any}
          >
            <header>
              <span className="dkw-mark">Courier ID</span>
              <code title="Pseudonym for this shop">{r.pseudonym}</code>
            </header>
            <div className="dkw-body">
              {/^[a-z]+$/.test(String(r.avatar)) && (
                <img src={`/assets/avatars/${r.avatar}.svg`} alt="" width={44} height={44} />
              )}
              <div>
                <b className="dkw-name">{r.courier}</b>
                <small>
                  {dollars(r.revenue)} · {r.orders} {r.orders === 1 ? "order" : "orders"}
                  {r.turnedAway ? ` · turned away ${r.turnedAway}×` : ""}
                </small>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

const PROOF_FIELDS = [
  "orderId",
  "courier",
  "pseudonym",
  "shop",
  "item",
  "amount",
  "status",
  "paidWith",
  "askedPerson",
  "verified",
  "payment",
  "captureId",
  "placedAt",
];

export function PayPalProof({ widgetApi }: { widgetApi: AgWidgetApi }) {
  const rows = useRows(widgetApi, "orders", PROOF_FIELDS, "placedAt", 1);
  if (rows === null) return null;
  const o = rows[0];
  if (!o) return <AgNoDataOverlay />;
  const simulated = o.payment === "PayPal simulator";
  const seal = simulated ? "Simulated PayPal" : o.verified ? "Verified by PayPal" : o.payment;
  return (
    <div className="dkw-proof">
      <p className={`dkw-seal${simulated ? " sim" : ""}`}>
        <PayPalWord /> <span>{seal}</span>
      </p>
      <p className="dkw-amt">
        <b>{dollars(o.amount)}</b> <span>{o.status}</span>
      </p>
      <dl>
        <dt>For</dt>
        <dd>{o.item}</dd>
        <dt>Courier</dt>
        <dd>
          {o.courier} <code>{o.pseudonym}</code>
        </dd>
        <dt>Paid with</dt>
        <dd>
          {o.paidWith}
          {o.askedPerson ? " · asked the person first" : ""}
        </dd>
        <dt>{simulated ? "Simulator" : "PayPal"}</dt>
        <dd>
          <code>{o.captureId ?? o.orderId}</code>
        </dd>
      </dl>
      {simulated && <p className="dkw-fine">A demo order: paid at the PayPal simulator, no money moved.</p>}
    </div>
  );
}

const ICON = (path: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="2">${path}</svg>`)}`;

/** The two widgets, for Studio's `widgets` property. */
export function deskWidgetTypes() {
  return [
    {
      id: "courier-cards",
      label: "Courier ID cards",
      icon: {
        url: ICON(
          '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.5"/><path d="M14 10h4M14 14h3"/>',
        ),
      },
      form: (params: any) => {
        const form = params.createDefaults({ dataMappingItems: [] });
        form.items[1]?.items?.push({ type: "number", id: "format.style.cards", label: "Cards", defaultValue: 6 });
        return form;
      },
      comp: CourierCards,
      defaultSize: { width: 640, height: 260 },
      minSize: { width: 240, height: 140 },
      ai: {
        description: "A strip of courier ID cards in each courier's colour: name, pseudonym, money paid and refusals.",
        usage: "Use it to show who the shop's top couriers are. It needs no data mapping.",
      },
    },
    {
      id: "paypal-proof",
      label: "PayPal proof",
      icon: { url: ICON('<path d="M5 4h14v16l-7-3-7 3z"/><path d="M9 10l2 2 4-4"/>') },
      form: (params: any) => params.createDefaults({ dataMappingItems: [] }),
      comp: PayPalProof,
      defaultSize: { width: 320, height: 300 },
      minSize: { width: 220, height: 200 },
      ai: {
        description:
          "The PayPal proof behind the latest order (or the order picked by a cross filter): amount, how it was paid and whether PayPal verified the person.",
        usage: "It needs no data mapping.",
      },
    },
  ];
}
