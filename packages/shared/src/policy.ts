import type { AfterSale } from "./shops.ts";

/* A shop's delivery and returns in a few plain words, for tiles, strips and the app's shop page. */

const CARRIER: Record<NonNullable<AfterSale["carrier"]>, string> = {
  USPS: "USPS",
  UPS: "UPS",
  FEDEX: "FedEx",
  DHL: "DHL",
};

const carrierOf = (a: AfterSale) => (a.carrier ? CARRIER[a.carrier] : "post");

/** The one fact a person scanning a list of shops wants first. */
export function policyChip(a: AfterSale): string {
  if (a.delivery === "none") return "Nothing ships";
  if (a.windowDays) return `Returns ${a.windowDays} days`;
  return a.delivery === "rider" ? "Delivered by the shop" : "Faults refunded";
}

export function returnsShort(a: AfterSale): string {
  return a.windowDays ? `${a.windowDays}-day returns` : "Faults refunded in full";
}

export function deliveryShort(a: AfterSale): string {
  if (a.delivery === "post") return `Ships with ${carrierOf(a)}`;
  return a.delivery === "rider" ? "Delivered by the shop" : "Nothing to ship";
}

export function deliveryWords(a: AfterSale): string {
  if (a.delivery === "post")
    return `Posted with ${carrierOf(a)}. The tracking number goes on the PayPal payment, and every step shows up on the errand.`;
  if (a.delivery === "rider") return "The shop’s own riders bring it. Each step shows up on the errand.";
  return "Nothing ships: it’s yours as soon as it’s paid.";
}
