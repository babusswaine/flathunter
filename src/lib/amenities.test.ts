import { describe, expect, it } from "vitest";
import { amenityLabel } from "./amenities";

describe("amenityLabel", () => {
  it("replaces underscores with spaces and capitalizes the first letter", () => {
    expect(amenityLabel("24h_security")).toBe("24h security");
    expect(amenityLabel("hot_shower")).toBe("Hot shower");
    expect(amenityLabel("wifi_ready")).toBe("Wifi ready");
  });

  it("leaves a single word unchanged apart from capitalization", () => {
    expect(amenityLabel("balcony")).toBe("Balcony");
  });
});
