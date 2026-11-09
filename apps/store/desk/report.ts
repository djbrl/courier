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
    format: title("Who's at the door"),
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

export const DEFAULT_REPORT: any = {
  pages: [
    {
      id: "desk",
      widgets,
      widgetLayout: {
        revenue: at(0, 0, 6, 6),
        orders: at(6, 0, 6, 6),
        couriers: at(12, 0, 6, 6),
        refused: at(18, 0, 6, 6),
        byCourier: at(0, 6, 14, 18),
        refusals: at(14, 6, 10, 18),
        cards: at(0, 24, 16, 18),
        proof: at(16, 24, 8, 18),
        door: at(0, 42, 24, 18),
        recent: at(0, 60, 24, 22),
      },
      // Refusals only: the door log also holds the couriers that were let in.
      filter: {
        widget: { refusals: [{ field: { id: "door.allowed" }, model: { operator: "isFalse" } }] },
      },
    },
  ],
  selectedPageId: "desk",
  panels: { filters: { collapsed: true }, data: { collapsed: true }, edit: { collapsed: true } },
};
