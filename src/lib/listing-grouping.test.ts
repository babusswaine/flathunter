import { describe, expect, it } from "vitest";
import { cityOptions, groupByCityAndNeighborhood, sortListings } from "./listing-grouping";
import type { Listing } from "./types";

let nextId = 0;

function listing(overrides: Partial<Listing> = {}): Listing {
  nextId += 1;
  return {
    id: `listing-${nextId}`,
    source: { platform: "dotproperty", url: "https://example.com", captured_at: "2026-01-01T00:00:00Z" },
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

describe("sortListings", () => {
  it("sorts ascending by price", () => {
    const cheap = listing({ price: { amount: 30000, currency: "PHP", period: "month", dues_included: false } });
    const expensive = listing({ price: { amount: 90000, currency: "PHP", period: "month", dues_included: false } });
    const sorted = sortListings([expensive, cheap], "price", "asc");
    expect(sorted.map((l) => l.id)).toEqual([cheap.id, expensive.id]);
  });

  it("sorts descending when asked", () => {
    const cheap = listing({ price: { amount: 30000, currency: "PHP", period: "month", dues_included: false } });
    const expensive = listing({ price: { amount: 90000, currency: "PHP", period: "month", dues_included: false } });
    const sorted = sortListings([cheap, expensive], "price", "desc");
    expect(sorted.map((l) => l.id)).toEqual([expensive.id, cheap.id]);
  });

  it("puts listings with a null sort value last, regardless of direction", () => {
    const known = listing({ size_sqm: 50 });
    const unknown = listing({ size_sqm: null });
    expect(sortListings([unknown, known], "size_sqm", "asc").map((l) => l.id)).toEqual([
      known.id,
      unknown.id,
    ]);
    expect(sortListings([unknown, known], "size_sqm", "desc").map((l) => l.id)).toEqual([
      known.id,
      unknown.id,
    ]);
  });
});

describe("groupByCityAndNeighborhood", () => {
  it("groups listings under their city, then their neighborhood", () => {
    const a = listing({ location: { country: "PH", city: "Makati", neighborhood: "Legazpi Village", building_name: null, street: null } });
    const b = listing({ location: { country: "PH", city: "Makati", neighborhood: "Salcedo Village", building_name: null, street: null } });
    const c = listing({ location: { country: "DE", city: "Hannover", neighborhood: "Oststadt", building_name: null, street: null } });

    const groups = groupByCityAndNeighborhood([a, b, c], "price", "asc");

    expect(groups.map((g) => g.city)).toEqual(["Hannover", "Makati"]);
    const makati = groups.find((g) => g.city === "Makati")!;
    expect(makati.neighborhoods.map((n) => n.neighborhood)).toEqual([
      "Legazpi Village",
      "Salcedo Village",
    ]);
  });

  it("sorts listings within each neighborhood group", () => {
    const cheap = listing({ price: { amount: 30000, currency: "PHP", period: "month", dues_included: false } });
    const expensive = listing({ price: { amount: 90000, currency: "PHP", period: "month", dues_included: false } });

    const groups = groupByCityAndNeighborhood([expensive, cheap], "price", "asc");

    expect(groups[0].neighborhoods[0].listings.map((l) => l.id)).toEqual([cheap.id, expensive.id]);
  });
});

describe("cityOptions", () => {
  it("counts listings per city and records each city's country", () => {
    const a = listing({ location: { country: "PH", city: "Makati", neighborhood: "Legazpi Village", building_name: null, street: null } });
    const b = listing({ location: { country: "PH", city: "Makati", neighborhood: "Salcedo Village", building_name: null, street: null } });
    const c = listing({ location: { country: "DE", city: "Hannover", neighborhood: "Oststadt", building_name: null, street: null } });

    const options = cityOptions([a, b, c]);

    expect(options).toEqual([
      ["Hannover", { count: 1, country: "DE" }],
      ["Makati", { count: 2, country: "PH" }],
    ]);
  });
});
