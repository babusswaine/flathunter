import { describe, expect, it } from "vitest";
import { PLATFORMS, PRICE_PERIODS, PROPERTY_TYPES } from "./types";

describe("PROPERTY_TYPES", () => {
  it("includes the original four PH-shaped types plus the new non-PH types", () => {
    expect(PROPERTY_TYPES).toEqual([
      "condo",
      "apartment",
      "house",
      "studio",
      "kost",
      "share_room",
      "townhouse",
    ]);
  });
});

describe("PRICE_PERIODS", () => {
  it("includes month, night, week, and year", () => {
    expect(PRICE_PERIODS).toEqual(["month", "night", "week", "year"]);
  });
});

describe("PLATFORMS", () => {
  it("includes every newly-researched platform", () => {
    const newPlatforms = [
      "batdongsan",
      "chotot",
      "homedy",
      "rumah123",
      "99co",
      "mamikos",
      "ddproperty",
      "fazwaz",
      "immobilienscout24",
      "immowelt",
      "wg_gesucht",
      "fotocasa",
      "pisos",
      "leboncoin",
      "pap",
      "domain_au",
    ];
    for (const platform of newPlatforms) {
      expect(PLATFORMS).toContain(platform);
    }
  });

  it("does not include excluded platforms", () => {
    for (const excluded of ["seloger", "realestate_au", "flatmates_au"]) {
      expect(PLATFORMS).not.toContain(excluded);
    }
  });
});
