#!/usr/bin/env node
// Replaces an existing listing's photos: downloads each URL (the listing's
// own source page is sent as Referer), normalizes it to the 16:9 WebP frame,
// uploads it to Supabase Storage, and saves the new paths to data/listings.json.
// Pass the unit's own photos only — not agent headshots, logos, or maps.
// Usage: node scripts/set-listing-photos.mjs <listing-id> "<photo-url>" ["<photo-url>" ...]
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertHasPhotos } from "./lib/capture-validation.mjs";
import { capturePhoto } from "./lib/photos.mjs";

const DATA_PATH = path.join(import.meta.dirname, "..", "data", "listings.json");

function fail(msg) {
  console.error(`set-listing-photos: ${msg}`);
  process.exit(1);
}

const [id, ...urls] = process.argv.slice(2);
if (!id || urls.length === 0)
  fail('usage: node scripts/set-listing-photos.mjs <listing-id> "<photo-url>" [...]');

const listings = JSON.parse(await readFile(DATA_PATH, "utf-8"));
const listing = listings.find((l) => l.id === id);
if (!listing) fail(`no listing with id "${id}"`);

const photos = [];
for (const url of urls) {
  try {
    photos.push(await capturePhoto(url, id, photos.length, listing.source.url));
  } catch (e) {
    console.error(`set-listing-photos: warning — skipped photo ${url}: ${e.message}`);
  }
}

try {
  assertHasPhotos(photos, listing.user.status);
} catch (e) {
  fail(e.message);
}

listing.photos = photos;
await writeFile(DATA_PATH, `${JSON.stringify(listings, null, 2)}\n`);
console.log(`${id}: ${photos.length}/${urls.length} photo(s) saved.`);
