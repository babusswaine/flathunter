import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { optimizeLogo, optimizePhoto } from "./image-optimize.mjs";

function solid(width, height, alpha = false) {
  return sharp({
    create: {
      width,
      height,
      channels: alpha ? 4 : 3,
      background: alpha ? { r: 20, g: 20, b: 20, alpha: 0.5 } : { r: 200, g: 40, b: 40 },
    },
  })
    .png()
    .toBuffer();
}

describe("optimizePhoto", () => {
  it("crops a large photo to a 1280x720 WebP", async () => {
    const meta = await sharp(await optimizePhoto(await solid(3000, 1000))).metadata();
    expect(meta).toMatchObject({ format: "webp", width: 1280, height: 720 });
  });

  it("honors the EXIF orientation tag instead of leaving phone photos sideways", async () => {
    // Stored as a landscape image (red left half, blue right half) tagged
    // "rotate 90° clockwise", so it should display as a portrait with red on
    // top and blue below. Any row of the upright result is a single color;
    // a sideways result would be red on the left and blue on the right.
    const half = (r, b) =>
      sharp({ create: { width: 200, height: 200, channels: 3, background: { r, g: 0, b } } })
        .png()
        .toBuffer();
    const stored = await sharp({
      create: { width: 400, height: 200, channels: 3, background: "#000" },
    })
      .composite([
        { input: await half(255, 0), left: 0, top: 0 },
        { input: await half(0, 255), left: 200, top: 0 },
      ])
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();

    const { data, info } = await sharp(await optimizePhoto(stored))
      .raw()
      .toBuffer({ resolveWithObject: true });
    const pixel = (x, y) => [
      ...data.subarray((y * info.width + x) * 3, (y * info.width + x) * 3 + 3),
    ];
    const row = Math.floor(info.height / 2);
    const [left, right] = [pixel(20, row), pixel(info.width - 20, row)];
    expect(Math.abs(left[0] - right[0])).toBeLessThan(40);
    expect(Math.abs(left[2] - right[2])).toBeLessThan(40);
  });

  it("enlarges a small photo to the same 16:9 frame", async () => {
    const meta = await sharp(await optimizePhoto(await solid(400, 300))).metadata();
    expect(meta).toMatchObject({ format: "webp", width: 1280, height: 720 });
  });
});

describe("optimizeLogo", () => {
  it("shrinks a wide logo to max 320px, keeping aspect ratio and transparency", async () => {
    const { buffer, width, height } = await optimizeLogo(await solid(800, 200, true));
    const meta = await sharp(buffer).metadata();
    expect({ width, height }).toEqual({ width: 320, height: 80 });
    expect(meta).toMatchObject({ format: "webp", width: 320, height: 80, hasAlpha: true });
  });

  it("never enlarges a logo that's already small", async () => {
    const { width, height } = await optimizeLogo(await solid(100, 25, true));
    expect({ width, height }).toEqual({ width: 100, height: 25 });
  });
});
