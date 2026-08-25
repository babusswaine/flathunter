import type { Listing } from "./types";

// Building + street, since the surrounding UI already makes the city (and
// usually the neighborhood) obvious from context — falls back to
// neighborhood if neither is known.
export function formatAddress(location: Listing["location"]): string {
  const parts = [location.building_name, location.street].filter((p): p is string => Boolean(p));
  return parts.length > 0 ? parts.join(", ") : location.neighborhood;
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}
