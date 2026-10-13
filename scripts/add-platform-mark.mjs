#!/usr/bin/env node
// Downloads a platform's real wordmark/logo, normalizes it to a WebP (max
// width, no crop — preserves aspect ratio and transparency), uploads it to
// Supabase Storage at platforms/<platform>.webp, and records it in
// src/lib/platform-marks.json for use across listing cards and detail pages.
// Usage: node scripts/add-platform-mark.mjs <platform> "<image-url>" [--invert]
// --invert flips a monochrome dark logo to light (alpha preserved) — for
// brand marks that are illegible against this app's dark card backgrounds.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { optimizeLogo } from "./lib/image-optimize.mjs";
import { uploadImage } from "./lib/storage.mjs";

const ROOT = path.join(import.meta.dirname, "..");
const META_PATH = path.join(ROOT, "src", "lib", "platform-marks.json");

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
const logo = await optimizeLogo(Buffer.from(await res.arrayBuffer()), { invert });
const image = await uploadImage(`platforms/${platform}.webp`, logo.buffer, "image/webp");
const { width, height } = logo;

let meta = {};
try {
  meta = JSON.parse(await readFile(META_PATH, "utf-8"));
} catch {
  // no existing file yet
}
meta[platform] = { image, width, height };
await writeFile(META_PATH, `${JSON.stringify(meta, null, 2)}\n`);
console.log(`Saved wordmark for "${platform}" -> ${image} (${width}x${height})`);
