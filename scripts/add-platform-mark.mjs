#!/usr/bin/env node
// Downloads a platform's real wordmark/logo, normalizes it (max width, no
// crop — preserves aspect ratio and transparency), and records it in
// src/lib/platform-marks.json for use across listing cards and detail pages.
// Usage: node scripts/add-platform-mark.mjs <platform> "<image-url>" [--invert]
// --invert flips a monochrome dark logo to light (alpha preserved) — for
// brand marks that are illegible against this app's dark card backgrounds.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const META_PATH = path.join(ROOT, "src", "lib", "platform-marks.json");
const MARKS_DIR = path.join(ROOT, "public", "platforms");

const MAX_WIDTH = 320;

function fail(msg) {
  console.error(`add-platform-mark: ${msg}`);
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => a !== "--invert");
const invert = process.argv.includes("--invert");
const [platform, url] = args;
if (!platform || !url) {
  fail('usage: node scripts/add-platform-mark.mjs <platform> "<image-url>" [--invert]');
}

const res = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  },
});
if (!res.ok) fail(`fetch failed (${res.status}) for ${url}`);
const buffer = Buffer.from(await res.arrayBuffer());

await mkdir(MARKS_DIR, { recursive: true });
const destPath = path.join(MARKS_DIR, `${platform}.png`);

// density: 300 renders SVG input at higher fidelity before downscaling —
// without it, thin vector strokes rasterize blurry at small native sizes.
let pipeline = sharp(buffer, { density: 300 }).resize({
  width: MAX_WIDTH,
  withoutEnlargement: true,
});
if (invert) pipeline = pipeline.negate({ alpha: false });
await pipeline.png().toFile(destPath);
const { width, height } = await sharp(destPath).metadata();

let meta = {};
try {
  meta = JSON.parse(await readFile(META_PATH, "utf-8"));
} catch {
  // no existing file yet
}
meta[platform] = { image: `/platforms/${platform}.png`, width, height };
await writeFile(META_PATH, `${JSON.stringify(meta, null, 2)}\n`);
console.log(`Saved wordmark for "${platform}" -> /platforms/${platform}.png (${width}x${height})`);
