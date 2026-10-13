import { describe, expect, it } from "vitest";
import { assertHasPhotos, PLATFORMS, PROPERTY_TYPES } from "./capture-validation.mjs";

describe("assertHasPhotos", () => {
  it("does not throw when photos is non-empty", () => {
    expect(() => assertHasPhotos(["/photos/x/1.jpg"], "new")).not.toThrow();
  });

  it("throws when photos is empty and status is not extraction_failed", () => {
    expect(() => assertHasPhotos([], "new")).toThrow(/no photos/i);
  });

  it("does not throw when photos is empty but status is extraction_failed", () => {
    expect(() => assertHasPhotos([], "extraction_failed")).not.toThrow();
  });
});

describe("constants mirror types.ts", () => {
  it("PROPERTY_TYPES includes the new non-PH types", () => {
    expect(PROPERTY_TYPES).toContain("kost");
    expect(PROPERTY_TYPES).toContain("share_room");
    expect(PROPERTY_TYPES).toContain("townhouse");
  });

  it("PLATFORMS includes a sample of the new platforms", () => {
    expect(PLATFORMS).toContain("batdongsan");
    expect(PLATFORMS).toContain("wg_gesucht");
    expect(PLATFORMS).toContain("domain_au");
  });
});
