// Images are optimized here, before upload, because Supabase's on-the-fly
// resizing isn't on the free plan (ADR 0004). Photos keep the fixed 16:9
// frame from ADR 0003; logos keep their own aspect ratio.
import sharp from "sharp";

export const PHOTO_WIDTH = 1280;
export const PHOTO_HEIGHT = 720;
export const LOGO_MAX_WIDTH = 320;

export async function optimizePhoto(input) {
  return sharp(input)
    .resize(PHOTO_WIDTH, PHOTO_HEIGHT, { fit: "cover", position: "attention" })
    .webp({ quality: 80 })
    .toBuffer();
}

// density: 300 renders SVG input at higher fidelity before downscaling —
// without it, thin vector strokes rasterize blurry at small native sizes.
export async function optimizeLogo(input, { invert = false } = {}) {
  let pipeline = sharp(input, { density: 300 }).resize({
    width: LOGO_MAX_WIDTH,
    withoutEnlargement: true,
  });
  if (invert) pipeline = pipeline.negate({ alpha: false });
  const { data, info } = await pipeline
    .webp({ lossless: true })
    .toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}
