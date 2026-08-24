#!/usr/bin/env node
// Validates and appends one extracted listing to data/listings.json.
// Usage: node scripts/add-listing.mjs '<json>'   (or pipe JSON via stdin)
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import vocabulary from "../src/lib/amenity-vocabulary.json" with { type: "json" };

const DATA_PATH = path.join(import.meta.dirname, "..", "data", "listings.json");

const PLATFORMS = ["dotproperty", "lamudi", "rentpad", "fb_marketplace", "fb_group"];
const PROPERTY_TYPES = ["condo", "apartment", "house", "studio"];
const FURNISHING = ["unfurnished", "semi_furnished", "fully_furnished"];
const STATUSES = ["new", "interested", "contacted", "toured", "rejected", "extraction_failed"];

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

async function main() {
  const raw = process.argv[2] ?? (await readStdin());
  if (!raw) fail("no input JSON given (arg or stdin) — see scripts/add-listing.mjs for the expected shape");

  let input;
  try {
    input = JSON.parse(raw);
  } catch (e) {
    fail(`invalid JSON: ${e.message}`);
  }

  for (const key of ["title", "property_type", "location", "bedrooms", "bathrooms", "furnishing", "price", "source"]) {
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
  if (input.price?.amount === undefined) fail("price.amount is required");

  const amenities = input.amenities ?? [];
  const unknown = amenities.filter((tag) => !vocabulary.includes(tag));
  if (unknown.length > 0)
    fail(
      `unknown amenity tag(s): ${unknown.join(", ")} — normalize to the canonical vocabulary in ` +
        "src/lib/amenity-vocabulary.json (add a new tag there first if genuinely new, don't invent one inline)",
    );

  const status = input.user?.status ?? "new";
  if (!STATUSES.includes(status)) fail(`user.status must be one of ${STATUSES.join(", ")}`);

  const sizeSqm = input.size_sqm ?? null;
  const listing = {
    id: crypto.randomUUID(),
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
      neighborhood: input.location.neighborhood ?? "",
      building_name: input.location.building_name ?? null,
    },
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    size_sqm: sizeSqm,
    floor_level: input.floor_level ?? null,
    furnishing: input.furnishing,
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
  await writeFile(DATA_PATH, JSON.stringify(existing, null, 2) + "\n");
  console.log(`Added "${listing.title}" (${listing.id}) — ${existing.length} listing(s) total.`);
}

main();
