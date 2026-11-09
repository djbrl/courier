/*
 * The report a shop sees on first load. Charts group couriers by "Top courier", so a shop with dozens of couriers,
 * or one courier with a huge order, still gets a chart a person can read.
 */

const title = (text: string) => ({ title: { enabled: true, text } });
const kpi = (text: string, id: string, aggregation: string) => ({
  type: "value",
  dataMapping: { value: [{ id, aggregation }] },
  format: title(text),
});

const widgets: Record<string, any> = {
  revenue: kpi("Paid by couriers", "orders.revenue", "sum"),
  orders: kpi("Orders", "orders.orderId", "count"),
  couriers: kpi("Couriers", "couriers.pseudonym", "count"),
  refused: kpi("Turned away", "door.turnedAway", "sum"),
  byCourier: {
    type: "bar-chart-grouped",
    dataMapping: {
      categoryKey: [{ id: "orders.topCourier" }],
      valueKey: [{ id: "orders.revenue", aggregation: "sum" }],
    },
    sort: [{ field: { id: "orders.revenue", aggregation: "sum" }, direction: "desc" }],
    format: title("Revenue by courier"),
  },
  refusals: {
    type: "donut-chart",
    dataMapping: {
      categoryKey: [{ id: "door.reason" }],
      valueKey: [{ id: "door.turnedAway", aggregation: "sum" }],
    },
    format: title("Bots turned away, and why"),
  },
  cards: { type: "courier-cards", dataMapping: {}, format: title("Top couriers") },
  proof: { type: "paypal-proof", dataMapping: {}, format: title("Latest payment") },
  door: {
    type: "grid",
    dataMapping: {
      cols: [
        { id: "door.at" },
        { id: "door.courier" },
        { id: "door.action" },
        { id: "door.outcome" },
        { id: "door.reason" },
        { id: "door.count" },
      ],
    },
    sort: [{ field: { id: "door.at" }, direction: "desc" }],
    format: title("Access log"),
  },
  recent: {
    type: "grid",
    dataMapping: {
      cols: [
        { id: "orders.placedAt" },
        { id: "orders.courier" },
        { id: "orders.pseudonym" },
        { id: "orders.shop" },
        { id: "orders.item" },
        { id: "orders.amount" },
        { id: "orders.status" },
        { id: "orders.paidWith" },
        { id: "orders.askedPerson" },
        { id: "orders.payment" },
      ],
    },
    sort: [{ field: { id: "orders.placedAt" }, direction: "desc" }],
    format: title("Recent orders"),
  },
};

const at = (xTrack: number, yTrack: number, xSpan: number, ySpan: number) => ({ xTrack, yTrack, xSpan, ySpan });

// Gaps between the cards; the room inside each card is in desk.css.
const layout = { widgetPadding: 10, pagePadding: 16 };
// Refusals only: the door log also holds the couriers that were let in.
const refusalsOnly = (id: string) => ({
  widget: { [id]: [{ field: { id: "door.allowed" }, model: { operator: "isFalse" } }] },
});

/** One tab each, so a chart or a table gets the whole page instead of a corner of one. */
export const REPORT_TABS = [
  { id: "overview", label: "Overview" },
  { id: "couriers", label: "Revenue by courier" },
  { id: "orders", label: "Orders and payments" },
  { id: "access", label: "Access log" },
] as const;

export const DEFAULT_REPORT: any = {
  pages: [
    {
      id: "overview",
      layout,
      widgets: {
        revenue: widgets.revenue,
        orders: widgets.orders,
        couriers: widgets.couriers,
        refused: widgets.refused,
        byCourier: widgets.byCourier,
        refusals: widgets.refusals,
      },
      widgetLayout: {
        revenue: at(0, 0, 6, 6),
        orders: at(6, 0, 6, 6),
        couriers: at(12, 0, 6, 6),
        refused: at(18, 0, 6, 6),
        byCourier: at(0, 6, 14, 20),
        refusals: at(14, 6, 10, 20),
      },
      filter: refusalsOnly("refusals"),
    },
    {
      id: "couriers",
      layout,
      widgets: { courierRevenue: widgets.byCourier, cards: widgets.cards },
      widgetLayout: { courierRevenue: at(0, 0, 24, 22), cards: at(0, 22, 24, 20) },
    },
    {
      id: "orders",
      layout,
      widgets: { proof: widgets.proof, paid: widgets.revenue, count: widgets.orders, recent: widgets.recent },
      widgetLayout: {
        proof: at(0, 0, 10, 20),
        paid: at(10, 0, 14, 10),
        count: at(10, 10, 14, 10),
        recent: at(0, 20, 24, 30),
      },
    },
    {
      id: "access",
      layout,
      widgets: { turnedAway: widgets.refused, why: widgets.refusals, door: widgets.door },
      widgetLayout: { turnedAway: at(0, 0, 8, 7), why: at(0, 7, 8, 20), door: at(8, 0, 16, 27) },
      filter: refusalsOnly("why"),
    },
  ],
  selectedPageId: "overview",
  panels: { filters: { collapsed: true }, data: { collapsed: true }, edit: { collapsed: true } },
};
