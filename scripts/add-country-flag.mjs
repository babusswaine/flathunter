#!/usr/bin/env node
// Downloads a country's flag SVG from lipis/flag-icons (MIT-licensed) into
// public/flags/, keyed by lowercase ISO 3166-1 alpha-2 code.
// Usage: node scripts/add-country-flag.mjs <ISO country code, e.g. PH>
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const FLAGS_DIR = path.join(ROOT, "public", "flags");

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
const svg = await res.text();

await mkdir(FLAGS_DIR, { recursive: true });
await writeFile(path.join(FLAGS_DIR, `${lower}.svg`), svg);
console.log(`Saved flag for "${code.toUpperCase()}" -> /flags/${lower}.svg`);
