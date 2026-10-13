import { afterEach, describe, expect, it, vi } from "vitest";
import { imageUrl } from "./image-url";

describe("imageUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds a public Supabase Storage URL from a bucket path", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    expect(imageUrl("photos/L04/1.webp")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/images/photos/L04/1.webp",
    );
  });

  it("tolerates a trailing slash on the project URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co/");
    expect(imageUrl("flags/ph.svg")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/images/flags/ph.svg",
    );
  });
});
