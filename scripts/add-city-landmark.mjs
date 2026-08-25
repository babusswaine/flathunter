#!/usr/bin/env node
// Downloads a landmark photo for a city, normalizes it to 16:9, and records
// it in src/lib/city-landmarks.json for the main screen's city cards.
// Usage: node scripts/add-city-landmark.mjs "Makati" "<image-url>" "Photo by X, CC BY 3.0"
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(import.meta.dirname, "..");
const META_PATH = path.join(ROOT, "src", "lib", "city-landmarks.json");
const CITIES_DIR = path.join(ROOT, "public", "cities");

function fail(msg) {
  console.error(`add-city-landmark: ${msg}`);
  process.exit(1);
}

const [city, url, attribution] = process.argv.slice(2);
if (!city || !url) {
  fail('usage: node scripts/add-city-landmark.mjs "City Name" "<image-url>" ["attribution"]');
}

const slug = city
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "") // strip accents (è -> e, ü -> u, etc.)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const res = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  },
});
if (!res.ok) fail(`fetch failed (${res.status}) for ${url}`);
const buffer = Buffer.from(await res.arrayBuffer());

await mkdir(CITIES_DIR, { recursive: true });
await sharp(buffer)
  .resize(1280, 720, { fit: "cover", position: "attention" })
  .jpeg({ quality: 85 })
  .toFile(path.join(CITIES_DIR, `${slug}.jpg`));

let meta = {};
try {
  meta = JSON.parse(await readFile(META_PATH, "utf-8"));
} catch {
  // no existing file yet
}
meta[city] = { image: `/cities/${slug}.jpg`, attribution: attribution ?? null };
await writeFile(META_PATH, `${JSON.stringify(meta, null, 2)}\n`);
console.log(`Saved landmark for "${city}" -> /cities/${slug}.jpg`);
