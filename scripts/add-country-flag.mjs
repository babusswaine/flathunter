#!/usr/bin/env node
// Downloads a country's flag SVG from lipis/flag-icons (MIT-licensed) and
// uploads it to Supabase Storage at flags/<code>.svg, keyed by lowercase
// ISO 3166-1 alpha-2 code. SVGs are already tiny, so they're stored as-is.
// Usage: node scripts/add-country-flag.mjs <ISO country code, e.g. PH>
import { uploadImage } from "./lib/storage.mjs";

function fail(msg) {
  console.error(`add-country-flag: ${msg}`);
  process.exit(1);
}

const [code] = process.argv.slice(2);
if (!code || !/^[A-Za-z]{2}$/.test(code)) {
  fail("usage: node scripts/add-country-flag.mjs <ISO 3166-1 alpha-2 code, e.g. PH>");
}

const lower = code.toLowerCase();
const url = `https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${lower}.svg`;

const res = await fetch(url);
if (!res.ok) fail(`fetch failed (${res.status}) for ${url} — is "${code}" a valid ISO code?`);
const svg = Buffer.from(await res.arrayBuffer());

const objectPath = await uploadImage(`flags/${lower}.svg`, svg, "image/svg+xml");
console.log(`Saved flag for "${code.toUpperCase()}" -> ${objectPath}`);
