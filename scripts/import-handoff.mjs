#!/usr/bin/env node
// Imports listings from a concept-brainstorm handoff file (see
// scripts/lib/handoff-mapping.mjs for the format) into data/listings.json.
// Ids already in the data file are skipped, so re-running is safe.
// Usage: node scripts/import-handoff.mjs <path/to/handoff-listings.json>
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { mapHandoffListing } from "./lib/handoff-mapping.mjs";

const DATA_PATH = path.join(import.meta.dirname, "..", "data", "listings.json");

const [file] = process.argv.slice(2);
if (!file) {
  console.error("usage: node scripts/import-handoff.mjs <path/to/handoff-listings.json>");
  process.exit(1);
}

const handoff = JSON.parse(await readFile(file, "utf-8"));
const existing = JSON.parse(await readFile(DATA_PATH, "utf-8"));
const known = new Set(existing.map((l) => l.id));

const added = [];
const skipped = [];
for (const h of handoff) {
  if (known.has(h.id)) {
    skipped.push(h.id);
    continue;
  }
  added.push(mapHandoffListing(h));
}

await writeFile(DATA_PATH, `${JSON.stringify([...existing, ...added], null, 2)}\n`);
console.log(
  `Imported ${added.length} listing(s)` +
    (skipped.length ? `, skipped ${skipped.length} already present (${skipped.join(", ")})` : "") +
    ` — ${existing.length + added.length} total.`,
);
