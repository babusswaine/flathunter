import { describe, expect, it } from "vitest";
import { formatAddress, formatCurrency } from "./format";
import type { Listing } from "./types";

function location(overrides: Partial<Listing["location"]> = {}): Listing["location"] {
  return {
    country: "PH",
    city: "Makati",
    neighborhood: "Legazpi Village",
    building_name: null,
    street: null,
    ...overrides,
  };
}

describe("formatAddress", () => {
  it("joins building and street when both are known", () => {
    expect(
      formatAddress(location({ building_name: "One Legazpi Park", street: "Rada Street" })),
    ).toBe("One Legazpi Park, Rada Street");
  });

  it("falls back to street alone when there's no building name", () => {
    expect(formatAddress(location({ street: "Carlos Palanca Street" }))).toBe(
      "Carlos Palanca Street",
    );
  });

  it("falls back to building name alone when there's no street", () => {
    expect(formatAddress(location({ building_name: "KL Tower" }))).toBe("KL Tower");
  });

  it("falls back to neighborhood when neither building nor street is known", () => {
    expect(formatAddress(location({ neighborhood: "Oststadt" }))).toBe("Oststadt");
  });
});

describe("formatCurrency", () => {
  it("formats PHP with the peso sign and no decimals", () => {
    expect(formatCurrency(90000, "PHP")).toBe("₱90,000");
  });

  it("formats EUR with the euro sign", () => {
    expect(formatCurrency(1150, "EUR")).toBe("€1,150");
  });

  it("falls back to a plain string for an invalid currency code instead of throwing", () => {
    expect(formatCurrency(1000, "NOT_A_CODE")).toBe("NOT_A_CODE 1,000");
  });
});
