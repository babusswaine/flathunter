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
