import { describe, expect, it } from "vitest";
import { activeFeatures } from "./listing-features";
import type { Listing } from "./types";

function listing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: "test",
    source: {
      platform: "dotproperty",
      url: "https://example.com",
      captured_at: "2026-01-01T00:00:00Z",
    },
    title: "Test listing",
    property_type: "condo",
    location: {
      country: "PH",
      city: "Makati",
      neighborhood: "Legazpi Village",
      building_name: null,
      street: null,
    },
    bedrooms: 1,
    bathrooms: 1,
    size_sqm: 50,
    floor_level: null,
    furnishing: "fully_furnished",
    photos: [],
    price: { amount: 50000, currency: "PHP", period: "month", dues_included: false },
    price_per_sqm: 1000,
    payment_terms: { deposit_months: null, advance_months: null, minimum_lease_months: null },
    amenities: [],
    rules: { pets_allowed: null },
    contact: { name: "", verified: false },
    user: { favorite: false, status: "new", notes: null },
    ...overrides,
  };
}

describe("activeFeatures", () => {
  it("returns nothing when no feature amenities or rules are present", () => {
    expect(activeFeatures(listing())).toEqual([]);
  });

  it("picks up features from matching amenity tags", () => {
    const keys = activeFeatures(listing({ amenities: ["kitchen", "wifi_ready"] })).map(
      (f) => f.key,
    );
    expect(keys).toEqual(["kitchen", "wifi"]);
  });

  it("picks up pets only when rules.pets_allowed is explicitly true", () => {
    expect(activeFeatures(listing({ rules: { pets_allowed: true } })).map((f) => f.key)).toEqual([
      "pets",
    ]);
    expect(activeFeatures(listing({ rules: { pets_allowed: false } }))).toEqual([]);
    expect(activeFeatures(listing({ rules: { pets_allowed: null } }))).toEqual([]);
  });

  it("does not match an unrelated amenity tag", () => {
    expect(activeFeatures(listing({ amenities: ["balcony", "24h_security"] }))).toEqual([]);
  });
});
