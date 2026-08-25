import type { Listing } from "./types";

export interface ListingFeature {
  key: "kitchen" | "hot_shower" | "wifi" | "utility" | "pets";
  label: string;
  present: (listing: Listing) => boolean;
}

export const LISTING_FEATURES: ListingFeature[] = [
  { key: "kitchen", label: "Kitchen", present: (l) => l.amenities.includes("kitchen") },
  { key: "hot_shower", label: "Hot shower", present: (l) => l.amenities.includes("hot_shower") },
  { key: "wifi", label: "WiFi", present: (l) => l.amenities.includes("wifi_ready") },
  { key: "utility", label: "Utility area", present: (l) => l.amenities.includes("laundry_area") },
  { key: "pets", label: "Pets accepted", present: (l) => l.rules.pets_allowed === true },
];

// Amenity tags that get dedicated feature treatment above — excluded from the
// generic amenities chip list so they don't render twice.
export const ICONIFIED_AMENITY_TAGS = new Set([
  "kitchen",
  "hot_shower",
  "wifi_ready",
  "laundry_area",
]);

export function activeFeatures(listing: Listing): ListingFeature[] {
  return LISTING_FEATURES.filter((f) => f.present(listing));
}
