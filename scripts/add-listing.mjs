#!/usr/bin/env node
// Validates and appends one extracted listing to data/listings.json.
// Downloads any given photo URLs and normalizes each to a 16:9 frame
// (upscaling smaller images via high-quality resampling, cropping larger
// ones) into public/photos/<listing-id>/.
// Usage: node scripts/add-listing.mjs '<json>'   (or pipe JSON via stdin)
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import vocabulary from "../src/lib/amenity-vocabulary.json" with { type: "json" };
import {
  assertHasPhotos,
  FURNISHING,
  PLATFORMS,
  PRICE_PERIODS,
  PROPERTY_TYPES,
  STATUSES,
} from "./lib/capture-validation.mjs";

const ROOT = path.join(import.meta.dirname, "..");
const DATA_PATH = path.join(ROOT, "data", "listings.json");
const PHOTOS_DIR = path.join(ROOT, "public", "photos");

const PHOTO_WIDTH = 1280;
const PHOTO_HEIGHT = 720; // 16:9

function fail(msg) {
  console.error(`add-listing: ${msg}`);
  process.exit(1);
}

async function readStdin() {
  if (process.stdin.isTTY) return null;
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8").trim();
}

async function processPhoto(url, listingId, index, referer) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      ...(referer ? { Referer: referer } : {}),
    },
  });
  if (!res.ok) throw new Error(`fetch failed (${res.status}) for ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  const dir = path.join(PHOTOS_DIR, listingId);
  await mkdir(dir, { recursive: true });
  const filename = `${index + 1}.jpg`;

  await sharp(buffer)
    .resize(PHOTO_WIDTH, PHOTO_HEIGHT, { fit: "cover", position: "attention" })
    .jpeg({ quality: 85 })
    .toFile(path.join(dir, filename));

  return `/photos/${listingId}/${filename}`;
}

async function main() {
  const raw = process.argv[2] ?? (await readStdin());
  if (!raw)
    fail("no input JSON given (arg or stdin) — see scripts/add-listing.mjs for the expected shape");

  let input;
  try {
    input = JSON.parse(raw);
  } catch (e) {
    fail(`invalid JSON: ${e.message}`);
  }

  for (const key of [
    "title",
    "property_type",
    "location",
    "bedrooms",
    "bathrooms",
    "furnishing",
    "price",
    "source",
  ]) {
    if (input[key] === undefined) fail(`missing required field "${key}"`);
  }
  if (!PROPERTY_TYPES.includes(input.property_type))
    fail(`property_type must be one of ${PROPERTY_TYPES.join(", ")}`);
  if (!FURNISHING.includes(input.furnishing))
    fail(`furnishing must be one of ${FURNISHING.join(", ")}`);
  if (!input.source?.platform || !PLATFORMS.includes(input.source.platform))
    fail(`source.platform must be one of ${PLATFORMS.join(", ")}`);
  if (!input.source?.url) fail("source.url is required");
  if (!input.location?.country || !input.location?.city)
    fail("location.country and location.city are required");
  if (!input.location?.neighborhood)
    fail(
      "location.neighborhood is required — this drives the app's city > neighborhood filter, " +
        'so use the specific area (e.g. "Legazpi Village"), not just the city',
    );
  if (input.price?.amount === undefined) fail("price.amount is required");
  if (input.price?.period !== undefined && !PRICE_PERIODS.includes(input.price.period))
    fail(`price.period must be one of ${PRICE_PERIODS.join(", ")}`);

  const amenities = input.amenities ?? [];
  const unknown = amenities.filter((tag) => !vocabulary.includes(tag));
  if (unknown.length > 0)
    fail(
      `unknown amenity tag(s): ${unknown.join(", ")} — normalize to the canonical vocabulary in ` +
        "src/lib/amenity-vocabulary.json (add a new tag there first if genuinely new, don't invent one inline)",
    );

  const status = input.user?.status ?? "new";
  if (!STATUSES.includes(status)) fail(`user.status must be one of ${STATUSES.join(", ")}`);

  const id = crypto.randomUUID();

  const photoUrls = input.photos ?? [];
  const photos = [];
  for (let i = 0; i < photoUrls.length; i++) {
    try {
      photos.push(await processPhoto(photoUrls[i], id, i, input.source.url));
    } catch (e) {
      console.error(`add-listing: warning — skipped photo ${photoUrls[i]}: ${e.message}`);
    }
  }

  try {
    assertHasPhotos(photos, status);
  } catch (e) {
    fail(e.message);
  }

  const sizeSqm = input.size_sqm ?? null;
  const listing = {
    id,
    source: {
      platform: input.source.platform,
      url: input.source.url,
      captured_at: new Date().toISOString(),
    },
    title: input.title,
    property_type: input.property_type,
    location: {
      country: input.location.country,
      city: input.location.city,
      neighborhood: input.location.neighborhood,
      building_name: input.location.building_name ?? null,
      street: input.location.street ?? null,
    },
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    size_sqm: sizeSqm,
    floor_level: input.floor_level ?? null,
    furnishing: input.furnishing,
    photos,
    price: {
      amount: input.price.amount,
      currency: input.price.currency ?? "PHP",
      period: input.price.period ?? "month",
      dues_included: input.price.dues_included ?? false,
    },
    price_per_sqm: sizeSqm ? Math.round((input.price.amount / sizeSqm) * 100) / 100 : null,
    payment_terms: {
      deposit_months: input.payment_terms?.deposit_months ?? null,
      advance_months: input.payment_terms?.advance_months ?? null,
      minimum_lease_months: input.payment_terms?.minimum_lease_months ?? null,
    },
    amenities,
    rules: { pets_allowed: input.rules?.pets_allowed ?? null },
    contact: {
      name: input.contact?.name ?? "",
      verified: input.contact?.verified ?? false,
    },
    user: {
      favorite: false,
      status,
      notes: input.user?.notes ?? null,
    },
  };

  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  let existing = [];
  try {
    existing = JSON.parse(await readFile(DATA_PATH, "utf-8"));
  } catch {
    // no existing file yet
  }

  existing.push(listing);
  await writeFile(DATA_PATH, `${JSON.stringify(existing, null, 2)}\n`);
  console.log(
    `Added "${listing.title}" (${listing.id}) — ${photos.length}/${photoUrls.length} photo(s) processed — ${existing.length} listing(s) total.`,
  );
}

main();
