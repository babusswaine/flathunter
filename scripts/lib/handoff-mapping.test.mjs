import { describe, expect, it } from "vitest";
import { mapHandoffListing, parseTerms } from "./handoff-mapping.mjs";

const L04 = {
  id: "L04",
  location: {
    country: "PH",
    city: "Makati",
    neighborhood: "Salcedo Village",
    building: "Signa Designer Residences",
    address: "Valero St cor. V.A. Rufino St",
  },
  price: {
    monthly: 27000,
    currency: "PHP",
    dues_included: true,
    deposit_terms: "1 mo advance + 2 mo deposit, 1-yr renewable",
    negotiable: null,
  },
  size: { sqm: 36, bedrooms: 1, bathrooms: 1, floor: 9, price_per_sqm: 750 },
  amenities: { balcony: true, furnished: "fully", parking: true },
  contact: {
    agent: "JNP Real Estate Corp.",
    ref: "123",
    platform: "Trovit",
    url: "https://homes.trovit.ph/detail/019fa80a-08c9-761b-bb02-d4d1ee3d7c36",
    date_captured: "2026-10-12",
  },
  photos: [],
  user: { status: "closest_to_budget", favorite: false, notes: "Negotiate ₱2k down." },
  criteria_match: "near",
  missing_fields: [],
  possible_duplicate_of: "L03",
};

const L17 = {
  id: "L17",
  location: {
    country: "PH",
    city: "Makati",
    neighborhood: "Salcedo Village",
    building: null,
    address: "Tordesillas St",
  },
  price: {
    monthly: 23000,
    currency: "PHP",
    dues_included: null,
    deposit_terms: null,
    negotiable: true,
  },
  size: { sqm: 29, bedrooms: 1, bathrooms: 1, floor: null, price_per_sqm: 793 },
  amenities: { balcony: null, furnished: null, wifi_included: true, pets: false },
  contact: {
    agent: null,
    ref: null,
    platform: "Lamudi",
    url: "https://www.lamudi.com.ph/property/x",
    date_captured: "2026-10-13",
  },
  photos: [],
  user: { status: "ask_agent", favorite: true, notes: "" },
  criteria_match: "partial",
  missing_fields: ["balcony"],
  possible_duplicate_of: null,
};

describe("mapHandoffListing", () => {
  it("maps a fully specified handoff listing onto the app schema", () => {
    const l = mapHandoffListing(L04);
    expect(l.id).toBe("L04");
    expect(l.source).toEqual({
      platform: "trovit",
      url: L04.contact.url,
      captured_at: "2026-10-12T00:00:00.000Z",
    });
    expect(l.title).toBe("1BR in Signa Designer Residences");
    expect(l.property_type).toBe("condo");
    expect(l.location).toEqual({
      country: "PH",
      city: "Makati",
      neighborhood: "Salcedo Village",
      building_name: "Signa Designer Residences",
      street: "Valero St cor. V.A. Rufino St",
    });
    expect(l.bedrooms).toBe(1);
    expect(l.bathrooms).toBe(1);
    expect(l.size_sqm).toBe(36);
    expect(l.floor_level).toBe("9");
    expect(l.furnishing).toBe("fully_furnished");
    expect(l.balcony).toBe(true);
    expect(l.photos).toEqual([]);
    expect(l.price).toEqual({
      amount: 27000,
      currency: "PHP",
      period: "month",
      dues_included: true,
    });
    expect(l.price_per_sqm).toBe(750);
    expect(l.payment_terms).toEqual({
      advance_months: 1,
      deposit_months: 2,
      minimum_lease_months: 12,
    });
    expect(l.amenities).toEqual(["parking_slot"]);
    expect(l.rules).toEqual({ pets_allowed: null });
    expect(l.contact).toEqual({ name: "JNP Real Estate Corp.", verified: false });
    expect(l.user.status).toBe("new");
    expect(l.user.favorite).toBe(false);
  });

  it("keeps the handoff's own notes, tag, duplicate hint, ref, and raw terms as plain text", () => {
    const notes = mapHandoffListing(L04).user.notes;
    expect(notes).toBe(
      [
        "Negotiate ₱2k down.",
        "Handoff tag: closest_to_budget",
        "Possible duplicate of L03",
        "Agent ref: 123",
        "Terms: 1 mo advance + 2 mo deposit, 1-yr renewable",
      ].join("\n"),
    );
  });

  it("keeps unknowns as null instead of guessing", () => {
    const l = mapHandoffListing(L17);
    expect(l.balcony).toBeNull();
    expect(l.furnishing).toBeNull();
    expect(l.price.dues_included).toBeNull();
    expect(l.floor_level).toBeNull();
    expect(l.location.building_name).toBeNull();
    expect(l.payment_terms).toEqual({
      advance_months: null,
      deposit_months: null,
      minimum_lease_months: null,
    });
    expect(l.contact.name).toBe("");
  });

  it("titles a listing by street when there's no building name", () => {
    expect(mapHandoffListing(L17).title).toBe("1BR on Tordesillas St");
  });

  it("maps wifi_included, pets, favorite, negotiable, and lowercases the platform", () => {
    const l = mapHandoffListing(L17);
    expect(l.amenities).toEqual(["wifi_included"]);
    expect(l.rules.pets_allowed).toBe(false);
    expect(l.user.favorite).toBe(true);
    expect(l.source.platform).toBe("lamudi");
    expect(l.user.notes).toBe(["Handoff tag: ask_agent", "Negotiable"].join("\n"));
  });

  it("rejects a platform the app doesn't know", () => {
    expect(() =>
      mapHandoffListing({ ...L04, contact: { ...L04.contact, platform: "Craigslist" } }),
    ).toThrow(/platform/i);
  });
});

describe("parseTerms", () => {
  it("reads advance and deposit in either order, ignoring extras like PDCs", () => {
    expect(parseTerms("2 mo deposit + 2 mo advance + 10 PDCs")).toEqual({
      advance_months: 2,
      deposit_months: 2,
      minimum_lease_months: null,
    });
  });

  it("leaves parts it can't find as null", () => {
    expect(parseTerms("1 mo advance")).toEqual({
      advance_months: 1,
      deposit_months: null,
      minimum_lease_months: null,
    });
    expect(parseTerms(null)).toEqual({
      advance_months: null,
      deposit_months: null,
      minimum_lease_months: null,
    });
  });
});
