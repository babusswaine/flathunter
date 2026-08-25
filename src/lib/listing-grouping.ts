import type { Listing } from "./types";

export type SortField = "price" | "size_sqm" | "price_per_sqm";
export type SortDir = "asc" | "desc";

export function sortValue(listing: Listing, field: SortField): number | null {
  if (field === "price") return listing.price.amount;
  if (field === "size_sqm") return listing.size_sqm;
  return listing.price_per_sqm;
}

export function sortListings(listings: Listing[], field: SortField, dir: SortDir): Listing[] {
  return [...listings].sort((a, b) => {
    const av = sortValue(a, field);
    const bv = sortValue(b, field);
    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    return dir === "asc" ? av - bv : bv - av;
  });
}

export interface CityGroup {
  city: string;
  neighborhoods: { neighborhood: string; listings: Listing[] }[];
}

export function groupByCityAndNeighborhood(
  listings: Listing[],
  sortField: SortField,
  sortDir: SortDir,
): CityGroup[] {
  const cityMap = new Map<string, Map<string, Listing[]>>();
  for (const l of listings) {
    if (!cityMap.has(l.location.city)) cityMap.set(l.location.city, new Map());
    const neighborhoods = cityMap.get(l.location.city)!;
    if (!neighborhoods.has(l.location.neighborhood)) neighborhoods.set(l.location.neighborhood, []);
    neighborhoods.get(l.location.neighborhood)!.push(l);
  }
  return Array.from(cityMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([city, neighborhoods]) => ({
      city,
      neighborhoods: Array.from(neighborhoods.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([neighborhood, items]) => ({
          neighborhood,
          listings: sortListings(items, sortField, sortDir),
        })),
    }));
}

export interface CityOption {
  count: number;
  country: string;
}

export function cityOptions(listings: Listing[]): [string, CityOption][] {
  const map = new Map<string, CityOption>();
  for (const l of listings) {
    const existing = map.get(l.location.city);
    map.set(l.location.city, {
      count: (existing?.count ?? 0) + 1,
      country: existing?.country ?? l.location.country,
    });
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}
