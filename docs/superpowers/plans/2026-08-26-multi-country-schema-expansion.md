# Multi-Country Schema Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend flathunter's schema, capture-validation, and docs so a listing from any of the 16 newly-researched platforms across Vietnam, Indonesia, Thailand, Germany, Spain, France, and Australia can be captured and stored without schema mismatches, then prove it by capturing one real listing per platform.

**Architecture:** Widen the existing enum-based validation (already the pattern for `property_type`/`platform`/`furnishing`) rather than adding new fields wherever the research found a mismatch that can be absorbed by a rule instead (per-country neighborhood convention, Germany's Kaltmiete/Warmmiete via the existing `dues_included` flag, deposit edge cases via `user.notes`). Extract the validation constants/rules that today live only inline in `scripts/add-listing.mjs` into a small testable module, since this plan adds a new validation rule (no empty photos) that needs a unit test and the script currently has none.

**Tech Stack:** TypeScript, Next.js App Router, Node ESM scripts, Vitest, Biome.

**Spec:** `docs/superpowers/specs/2026-08-26-multi-country-schema-expansion-design.md` (and its companion research: `docs/research/rental-platforms-by-country.md`)

## Global Constraints

- `property_type` becomes: `condo | apartment | house | studio | kost | share_room | townhouse`
- `price.period` becomes a real validated enum: `month | night | week | year` (currently untyped `string` with no validation)
- `source.platform` gains 16 new values: `batdongsan`, `chotot`, `homedy`, `rumah123`, `99co`, `mamikos`, `ddproperty`, `fazwaz`, `immobilienscout24`, `immowelt`, `wg_gesucht`, `fotocasa`, `pisos`, `leboncoin`, `pap`, `domain_au`. Thailand's `dotproperty.co.th` reuses the existing `dotproperty` value (same brand/group, `location.country` already disambiguates PH vs TH).
- Excluded, do not add: SeLoger (litigation history + explicit anti-AI-training clause), `realestate.com.au` (untestable by current tooling, shares a bot-mitigation vendor with the platform that failed outright), Flatmates.com.au (confirmed hard-blocked, Lamudi-tier).
- No new fields for: neighborhood sub-levels, Kaltmiete/Warmmiete, deposit edge cases, agency fees — all absorbed by rules/existing fields per the spec, not schema growth.
- `src/lib/types.ts` (TypeScript, used by the Next.js app) and `scripts/lib/capture-validation.mjs` (plain JS, used by the standalone capture script) each hold their own copy of these constants — this repo's existing convention (already true today for `PLATFORMS`/`PROPERTY_TYPES`/`FURNISHING`/`STATUSES`), not something this plan introduces. Every task touching one must touch the other, in the same commit.
- A listing is not appended by `scripts/add-listing.mjs` with an empty `photos` array unless `user.status` is `"extraction_failed"`.
- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`). Branch naming `<ticket-number>-<slug>`. Pre-merge checks: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test` — all must pass before any task is considered done.

---

## File Structure

- **Modify** `src/lib/types.ts` — widen `PROPERTY_TYPES`, `PLATFORMS`; add `PRICE_PERIODS`/`PricePeriod`; change `Listing["price"]["period"]` from `string` to `PricePeriod`.
- **Create** `src/lib/types.test.ts` — regression guard on the widened enums (this file doesn't exist today; `types.ts` has none).
- **Create** `scripts/lib/capture-validation.mjs` — the plain-JS mirror of the same constants, plus `assertHasPhotos(photos, status)`, the new "no empty thumbnail" rule as a pure, unit-testable function.
- **Create** `scripts/lib/capture-validation.test.mjs` — tests for the above.
- **Modify** `vitest.config.mts` — widen `test.include` so it also picks up `scripts/**/*.test.mjs` (today it only matches `src/**/*.test.ts`).
- **Modify** `scripts/add-listing.mjs` — import constants + `assertHasPhotos` from the new module instead of inline arrays; call `assertHasPhotos` after photo processing, before appending.
- **Modify** `src/components/ListingDetail.tsx` — apply the same `.replace(/_/g, " ")` treatment `furnishing` already gets to `property_type`, since `share_room` is the first multi-word value that field will ever hold.
- **Modify** `CLAUDE.md` — document the per-country neighborhood/street capture rule, the Kaltmiete/Warmmiete rule, the full updated platform list, and why SeLoger/realestate.com.au/Flatmates are excluded.
- **Run** `scripts/add-country-flag.mjs` for VN, ID, TH, FR, AU (existing script, no code change — DE/ES/PH flags already exist in `public/flags/`).
- **Modify** `data/listings.json`, **create** `public/photos/<id>/*` — one real captured listing per platform (16 total across 7 countries), via the existing conversational capture flow + `scripts/add-listing.mjs`.

---

### Task 1: Widen schema enums in `types.ts`

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/types.test.ts`

**Interfaces:**
- Produces: `PRICE_PERIODS: readonly ["month", "night", "week", "year"]`, `PricePeriod` type, `PROPERTY_TYPES` widened to include `"kost" | "share_room" | "townhouse"`, `PLATFORMS` widened to include the 16 new platform strings listed in Global Constraints. `Listing["price"]["period"]` is now `PricePeriod`, not `string`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/types.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PLATFORMS, PRICE_PERIODS, PROPERTY_TYPES } from "./types";

describe("PROPERTY_TYPES", () => {
  it("includes the original four PH-shaped types plus the new non-PH types", () => {
    expect(PROPERTY_TYPES).toEqual([
      "condo",
      "apartment",
      "house",
      "studio",
      "kost",
      "share_room",
      "townhouse",
    ]);
  });
});

describe("PRICE_PERIODS", () => {
  it("includes month, night, week, and year", () => {
    expect(PRICE_PERIODS).toEqual(["month", "night", "week", "year"]);
  });
});

describe("PLATFORMS", () => {
  it("includes every newly-researched platform", () => {
    const newPlatforms = [
      "batdongsan",
      "chotot",
      "homedy",
      "rumah123",
      "99co",
      "mamikos",
      "ddproperty",
      "fazwaz",
      "immobilienscout24",
      "immowelt",
      "wg_gesucht",
      "fotocasa",
      "pisos",
      "leboncoin",
      "pap",
      "domain_au",
    ];
    for (const platform of newPlatforms) {
      expect(PLATFORMS).toContain(platform);
    }
  });

  it("does not include excluded platforms", () => {
    for (const excluded of ["seloger", "realestate_au", "flatmates_au"]) {
      expect(PLATFORMS).not.toContain(excluded);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/types.test.ts`
Expected: FAIL — `PRICE_PERIODS` is not exported, `PROPERTY_TYPES`/`PLATFORMS` don't yet contain the new values.

- [ ] **Step 3: Implement**

In `src/lib/types.ts`, replace lines 1–17 with:

```ts
export const PLATFORMS = [
  "dotproperty",
  "lamudi",
  "rentpad",
  "fb_marketplace",
  "fb_group",
  "airbnb",
  "idealista",
  "batdongsan",
  "chotot",
  "homedy",
  "rumah123",
  "99co",
  "mamikos",
  "ddproperty",
  "fazwaz",
  "immobilienscout24",
  "immowelt",
  "wg_gesucht",
  "fotocasa",
  "pisos",
  "leboncoin",
  "pap",
  "domain_au",
  "other",
] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PROPERTY_TYPES = [
  "condo",
  "apartment",
  "house",
  "studio",
  "kost",
  "share_room",
  "townhouse",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PRICE_PERIODS = ["month", "night", "week", "year"] as const;
export type PricePeriod = (typeof PRICE_PERIODS)[number];

export const FURNISHING_OPTIONS = ["unfurnished", "semi_furnished", "fully_furnished"] as const;
export type Furnishing = (typeof FURNISHING_OPTIONS)[number];
```

Then in the `Listing` interface, change:

```ts
  price: {
    amount: number;
    currency: string;
    period: string;
    dues_included: boolean;
  };
```

to:

```ts
  price: {
    amount: number;
    currency: string;
    period: PricePeriod;
    dues_included: boolean;
  };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/types.test.ts`
Expected: PASS (3 describe blocks, 4 tests)

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors. (`price.period` is currently written as `"month"`/`"night"` string literals in every test fixture and in `add-listing.mjs`'s `input.price.period ?? "month"` fallback — all valid `PricePeriod` values, so this should be a clean tightening with no fallout. If a fixture literal doesn't satisfy `PricePeriod`, fix that fixture, don't widen the type back to `string`.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/types.test.ts
git commit -m "feat: widen property_type, platform, and price.period enums for non-PH markets"
```

---

### Task 2: `scripts/lib/capture-validation.mjs` — shared constants + the "no empty thumbnail" rule

**Files:**
- Create: `scripts/lib/capture-validation.mjs`
- Create: `scripts/lib/capture-validation.test.mjs`
- Modify: `vitest.config.mts`

**Interfaces:**
- Consumes: nothing (pure module).
- Produces: `PLATFORMS`, `PROPERTY_TYPES`, `FURNISHING`, `STATUSES` (plain JS arrays, same values as Task 1's TS constants — this file is the JS-side mirror `scripts/add-listing.mjs` already relied on inline before this task); `assertHasPhotos(photos: string[], status: string): void` — throws `Error` with a clear message if `photos.length === 0` and `status !== "extraction_failed"`, otherwise returns without side effects.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/capture-validation.test.mjs`:

```js
import { describe, expect, it } from "vitest";
import { assertHasPhotos, PLATFORMS, PROPERTY_TYPES } from "./capture-validation.mjs";

describe("assertHasPhotos", () => {
  it("does not throw when photos is non-empty", () => {
    expect(() => assertHasPhotos(["/photos/x/1.jpg"], "new")).not.toThrow();
  });

  it("throws when photos is empty and status is not extraction_failed", () => {
    expect(() => assertHasPhotos([], "new")).toThrow(/no photos/i);
  });

  it("does not throw when photos is empty but status is extraction_failed", () => {
    expect(() => assertHasPhotos([], "extraction_failed")).not.toThrow();
  });
});

describe("constants mirror types.ts", () => {
  it("PROPERTY_TYPES includes the new non-PH types", () => {
    expect(PROPERTY_TYPES).toContain("kost");
    expect(PROPERTY_TYPES).toContain("share_room");
    expect(PROPERTY_TYPES).toContain("townhouse");
  });

  it("PLATFORMS includes a sample of the new platforms", () => {
    expect(PLATFORMS).toContain("batdongsan");
    expect(PLATFORMS).toContain("wg_gesucht");
    expect(PLATFORMS).toContain("domain_au");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run scripts/lib/capture-validation.test.mjs`
Expected: this file doesn't exist yet, so vitest also won't discover it — first widen the config (part of this same step, since the test can't even be collected otherwise). In `vitest.config.mts`, change:

```ts
    include: ["src/**/*.test.ts"],
```

to:

```ts
    include: ["src/**/*.test.ts", "scripts/**/*.test.mjs"],
```

Then run the test again. Expected: FAIL — `scripts/lib/capture-validation.mjs` doesn't exist.

- [ ] **Step 3: Implement**

Create `scripts/lib/capture-validation.mjs`:

```js
// Plain-JS mirror of the enums in src/lib/types.ts, for the standalone
// capture script (which runs via plain `node`, no TS/build step). Keep
// both files in sync by hand — see CLAUDE.md.

export const PLATFORMS = [
  "dotproperty",
  "lamudi",
  "rentpad",
  "fb_marketplace",
  "fb_group",
  "airbnb",
  "idealista",
  "batdongsan",
  "chotot",
  "homedy",
  "rumah123",
  "99co",
  "mamikos",
  "ddproperty",
  "fazwaz",
  "immobilienscout24",
  "immowelt",
  "wg_gesucht",
  "fotocasa",
  "pisos",
  "leboncoin",
  "pap",
  "domain_au",
  "other",
];

export const PROPERTY_TYPES = [
  "condo",
  "apartment",
  "house",
  "studio",
  "kost",
  "share_room",
  "townhouse",
];

export const PRICE_PERIODS = ["month", "night", "week", "year"];

export const FURNISHING = ["unfurnished", "semi_furnished", "fully_furnished"];

export const STATUSES = ["new", "interested", "contacted", "toured", "rejected", "extraction_failed"];

// A listing isn't finished without at least one real photo — unless capture
// itself failed, in which case there's nothing to have a photo of, and the
// listing is kept (not dropped) so it can be retried later.
export function assertHasPhotos(photos, status) {
  if (photos.length === 0 && status !== "extraction_failed") {
    throw new Error(
      "no photos were successfully captured — a listing isn't finished without at least one " +
        'real photo. If extraction genuinely failed, set user.status to "extraction_failed" ' +
        "instead of forcing this one through.",
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run scripts/lib/capture-validation.test.mjs`
Expected: PASS (5 tests)

Then run the full suite to confirm nothing else broke from the config change:
Run: `npm test`
Expected: all existing tests still pass, plus the 2 new test files.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/capture-validation.mjs scripts/lib/capture-validation.test.mjs vitest.config.mts
git commit -m "feat: extract capture validation into a testable module, add no-empty-photos rule"
```

---

### Task 3: Wire `scripts/add-listing.mjs` to the new validation module

**Files:**
- Modify: `scripts/add-listing.mjs`

**Interfaces:**
- Consumes: `PLATFORMS`, `PROPERTY_TYPES`, `PRICE_PERIODS`, `FURNISHING`, `STATUSES`, `assertHasPhotos` from `./lib/capture-validation.mjs` (Task 2).

- [ ] **Step 1: Replace the inline constants**

In `scripts/add-listing.mjs`, replace lines 16–28:

```js
const PLATFORMS = [
  "dotproperty",
  "lamudi",
  "rentpad",
  "fb_marketplace",
  "fb_group",
  "airbnb",
  "idealista",
  "other",
];
const PROPERTY_TYPES = ["condo", "apartment", "house", "studio"];
const FURNISHING = ["unfurnished", "semi_furnished", "fully_furnished"];
const STATUSES = ["new", "interested", "contacted", "toured", "rejected", "extraction_failed"];
```

with:

```js
import {
  assertHasPhotos,
  FURNISHING,
  PLATFORMS,
  PRICE_PERIODS,
  PROPERTY_TYPES,
  STATUSES,
} from "./lib/capture-validation.mjs";
```

(add this alongside the existing imports near the top of the file, not down where the old consts were — imports must be at module top-level in ESM).

- [ ] **Step 2: Validate `price.period`**

Currently `price.period` has no validation at all — it silently defaults to `"month"`. Add a check next to the existing `price.amount` check (around what's currently line 106):

```js
  if (input.price?.amount === undefined) fail("price.amount is required");
  if (input.price?.period !== undefined && !PRICE_PERIODS.includes(input.price.period))
    fail(`price.period must be one of ${PRICE_PERIODS.join(", ")}`);
```

- [ ] **Step 3: Enforce the no-empty-photos rule**

After the photo-processing loop (currently ending around line 129) and after `status` is resolved (currently around line 116–117, which must run *before* this check now — reorder if needed so `status` is defined first), add:

```js
  assertHasPhotos(photos, status);
```

This must run before the `listing` object is constructed and before anything is written to disk, so a failed capture never gets partially appended.

- [ ] **Step 4: Manual verification (no automated test for this file)**

This script has no existing test coverage (it's a CLI entry point doing I/O — network fetches, file writes — not a pure function), and adding one is out of scope for this task; Task 2 already covers the extracted pure logic. Verify by hand:

```bash
# Missing photos, not extraction_failed → should fail with the new message
node scripts/add-listing.mjs '{"title":"t","property_type":"condo","location":{"country":"PH","city":"Makati","neighborhood":"Legazpi Village"},"bedrooms":1,"bathrooms":1,"furnishing":"unfurnished","price":{"amount":1000},"source":{"platform":"dotproperty","url":"https://example.com/x"}}'
```

Expected: exits non-zero, prints `add-listing: no photos were successfully captured ...`, and `data/listings.json` is unchanged (check `git diff data/listings.json` shows nothing).

```bash
# Invalid price.period → should fail
node scripts/add-listing.mjs '{"title":"t","property_type":"condo","location":{"country":"PH","city":"Makati","neighborhood":"Legazpi Village"},"bedrooms":1,"bathrooms":1,"furnishing":"unfurnished","price":{"amount":1000,"period":"decade"},"source":{"platform":"dotproperty","url":"https://example.com/x"}}'
```

Expected: exits non-zero, prints `add-listing: price.period must be one of month, night, week, year`.

- [ ] **Step 5: Run the full pre-merge check suite**

```bash
npm run format:check && npm run lint && npm run typecheck && npm test
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/add-listing.mjs
git commit -m "feat: validate price.period and enforce no-empty-photos rule in add-listing.mjs"
```

---

### Task 4: Fix `property_type` display for multi-word values

**Files:**
- Modify: `src/components/ListingDetail.tsx:86`

- [ ] **Step 1: Implement**

Change:

```tsx
        <Field label="Property type" value={listing.property_type} />
```

to:

```tsx
        <Field label="Property type" value={listing.property_type.replace(/_/g, " ")} />
```

(matches the existing treatment `furnishing` already gets one line below it — `share_room` is the first `property_type` value that will ever contain an underscore.)

- [ ] **Step 2: Manual verification**

This repo has no component test setup (only `src/lib/**/*.test.ts` — pure functions — are covered; components are verified by running the app). Run:

```bash
npm run dev
```

Open a listing detail page in the browser, temporarily edit one entry in `data/listings.json` to `"property_type": "share_room"`, reload, and confirm the page shows "share room" (not "share_room"). Revert the temporary edit before committing.

- [ ] **Step 3: Run pre-merge checks**

```bash
npm run format:check && npm run lint && npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ListingDetail.tsx
git commit -m "fix: render multi-word property types with spaces instead of underscores"
```

---

### Task 5: Fetch country flags for the 5 new countries

**Files:**
- Create: `public/flags/vn.svg`, `public/flags/id.svg`, `public/flags/th.svg`, `public/flags/fr.svg`, `public/flags/au.svg`

No code change — `scripts/add-country-flag.mjs` already exists and does exactly this (PH/DE/ES flags are already present from earlier work). Without this, `CityCard` (`src/components/CityCard.tsx:47`, `src/${country.toLowerCase()}.svg`) would render a broken image for any of these 5 countries' city cards, instead of the flag/attribution treatment PH/DE/ES already get — a rough edge for exactly the countries this whole plan is about adding.

- [ ] **Step 1: Run the script for each new country**

```bash
node scripts/add-country-flag.mjs VN
node scripts/add-country-flag.mjs ID
node scripts/add-country-flag.mjs TH
node scripts/add-country-flag.mjs FR
node scripts/add-country-flag.mjs AU
```

Expected: each prints `Saved flag for "<CODE>" -> /flags/<code>.svg`.

- [ ] **Step 2: Verify**

```bash
ls public/flags/
```

Expected: `au.svg de.svg es.svg fr.svg id.svg ph.svg th.svg vn.svg`

- [ ] **Step 3: Commit**

```bash
git add public/flags/vn.svg public/flags/id.svg public/flags/th.svg public/flags/fr.svg public/flags/au.svg
git commit -m "chore: add country flags for Vietnam, Indonesia, Thailand, France, Australia"
```

---

### Task 6: Update `CLAUDE.md` capture-workflow docs

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Implement**

In the "Adding a listing" section of `CLAUDE.md`, after step 2 (the amenity-normalization / `location.neighborhood` paragraph), add a new paragraph:

```markdown
For non-PH countries, `location.neighborhood` should be the **coarser** of the
two administrative levels below the city (district / Bezirk / kecamatan / khet —
whichever level locals actually use to describe where they live), with any
finer level the source gives (ward / Stadtteil / kelurahan / khwaeng, or a
street) going in `location.street` instead, same slot as the existing PH
"Rada Street" precedent. Australia (suburb) and Spain (barrio/zona) already fit
`neighborhood` as a single level — no split needed there.

For Germany specifically: capture **Kaltmiete** (base rent, excluding
Nebenkosten/ancillary costs) as `price.amount`, with `price.dues_included:
false`. Kaltmiete is the legally meaningful figure for deposit calculations and
keeps German prices comparable to every other market's base-rent convention —
don't capture Warmmiete instead.

Where a market's real terms don't fit the schema cleanly (Spain's two-part
deposit — 1-month `fianza` + up to 2 months `garantía adicional`; Australia's
weeks-denominated bond; France's frais d'agence), record the real figure in
`user.notes` as plain text rather than distorting `payment_terms`.
```

Then update the `source.platform` accepted-values list (search `CLAUDE.md` for where platform values are described alongside `"other"`) to mention the full current set lives in `src/lib/types.ts`'s `PLATFORMS` / `scripts/lib/capture-validation.mjs`'s mirror of it, rather than re-listing all 24 values in prose.

Add a short new subsection after "Adding a listing":

```markdown
## Platforms covered

Philippines: DotProperty, Lamudi, Rentpad, Facebook Marketplace/groups.
Vietnam: Batdongsan.com.vn, Chợ Tốt, Homedy.com. Indonesia: Rumah123.com,
99.co, Mamikos.com. Thailand: DDproperty.com, FazWaz.com, Dot Property
Thailand (shares the `dotproperty` platform value with the PH site — same
brand/group, `location.country` disambiguates). Germany: ImmobilienScout24.de,
Immowelt.de, WG-Gesucht.de. Spain: Idealista.com, Fotocasa.es, pisos.com.
France: LeBonCoin.fr, PAP.fr. Australia: Domain.com.au.

**Deliberately not covered:** SeLoger.com (real litigation history against a
scraper, plus an explicit ToS ban on automated extraction including for
AI-training — a materially higher risk tier than everything else on this
list); realestate.com.au (untested — blocked by this tooling's own browser
policy, independent of the site's own defenses; shares a bot-mitigation
vendor with Flatmates.com.au, which failed outright, so don't assume it would
pass); Flatmates.com.au (confirmed hard-blocked even via a real browser,
same tier as Lamudi). See `docs/research/rental-platforms-by-country.md` for
the full testing detail behind these calls.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document per-country capture rules and the full platform list"
```

---

### Task 7: Capture verification — Vietnam

**Depends on:** Tasks 1–6 complete (schema, validation, docs all in place).

**Files:**
- Modify: `data/listings.json`
- Create: `public/photos/<id>/*.jpg` (one dir per captured listing)

- [ ] **Step 1: Batdongsan.com.vn**

Find one real, currently-live long-term rental listing on batdongsan.com.vn (browser-driven fetch — confirmed working in the research pass). Extract into the schema: `source.platform: "batdongsan"`, `location.country: "VN"`, `location.neighborhood` = the district (e.g. "Quận 1"), `location.street` = the ward if given, `price.currency: "VND"`, `price.period: "month"` (VN long-term rentals are monthly). Run:

```bash
node scripts/add-listing.mjs '<extracted JSON>'
```

Expected: succeeds, prints `Added "..." — N/N photo(s) processed — <count> listing(s) total.` with photo count ≥ 1.

- [ ] **Step 2: Chợ Tốt (chotot.com)**

Same procedure, `source.platform: "chotot"`. Chợ Tốt is plain-fetchable (no browser needed).

- [ ] **Step 3: Homedy.com**

Same procedure, `source.platform: "homedy"`. Also plain-fetchable.

- [ ] **Step 4: Verify**

```bash
node -e "const l = JSON.parse(require('fs').readFileSync('data/listings.json')); console.log(l.filter(x => x.location.country === 'VN').map(x => [x.source.platform, x.photos.length]))"
```

Expected: 3 entries, one per platform (`batdongsan`, `chotot`, `homedy`), each with `photos.length >= 1`.

Run `npm test` to confirm nothing regressed.

- [ ] **Step 5: Commit**

```bash
git add data/listings.json public/photos
git commit -m "feat: capture Vietnam listings from Batdongsan, Chợ Tốt, and Homedy"
```

---

### Task 8: Capture verification — Indonesia

**Depends on:** Tasks 1–6.

- [ ] **Step 1: Rumah123.com** — `source.platform: "rumah123"`, `location.country: "ID"`, `location.neighborhood` = kelurahan (or kecamatan if that's the only level the listing gives), `price.currency: "IDR"`. Plain-fetchable.
- [ ] **Step 2: 99.co** — `source.platform: "99co"`. Needs a browser-driven fetch (confirmed working).
- [ ] **Step 3: Mamikos.com** — `source.platform: "mamikos"`, `property_type: "kost"` if it's a kost listing (Mamikos's core product — expect most captures here to be `kost`, not `apartment`/`condo`). Check whether the listing quotes monthly, yearly (tahunan), or daily (harian) pricing and set `price.period` accordingly (`month`/`year`/`night`). Plain-fetchable.
- [ ] **Step 4: Verify** — same pattern as Task 7 Step 4, filtered to `country === 'ID'`, expect 3 entries. Run `npm test`.
- [ ] **Step 5: Commit** — `git commit -m "feat: capture Indonesia listings from Rumah123, 99.co, and Mamikos"`

---

### Task 9: Capture verification — Thailand

**Depends on:** Tasks 1–6.

- [ ] **Step 1: DDproperty.com** — `source.platform: "ddproperty"`, `location.country: "TH"`, `location.neighborhood` = khet (district), `location.street` = khwaeng if given, `price.currency: "THB"`. Needs a browser-driven fetch (confirmed working).
- [ ] **Step 2: FazWaz.com** — `source.platform: "fazwaz"`. FazWaz has a currency switcher (THB/USD/EUR/GBP) — record whichever currency was actually showing at capture time in `price.currency`, don't assume THB. Needs a browser-driven fetch (confirmed working).
- [ ] **Step 3: Dot Property Thailand (dotproperty.co.th)** — `source.platform: "dotproperty"` (reused from PH, per Global Constraints — do not invent a `dotproperty_th` value). Plain-fetchable. If the listing is a townhouse or pool villa, use `property_type: "townhouse"` or the closest fit (`house` for a villa) rather than forcing `condo`/`apartment`.
- [ ] **Step 4: Verify** — filter to `country === 'TH'`, expect 3 entries. Run `npm test`.
- [ ] **Step 5: Commit** — `git commit -m "feat: capture Thailand listings from DDproperty, FazWaz, and Dot Property Thailand"`

---

### Task 10: Capture verification — Germany

**Depends on:** Tasks 1–6.

- [ ] **Step 1: ImmobilienScout24.de** — `source.platform: "immobilienscout24"`, `location.country: "DE"`, `location.neighborhood` = Bezirk, `location.street` = Stadtteil/Kiez if given, `price.currency: "EUR"`, `price.amount` = Kaltmiete (not Warmmiete), `price.dues_included: false` per the Task 6 doc rule. Needs a browser-driven fetch (confirmed working).
- [ ] **Step 2: Immowelt.de** — `source.platform: "immowelt"`. Same Kaltmiete rule. Needs a browser-driven fetch (confirmed working).
- [ ] **Step 3: WG-Gesucht.de** — `source.platform: "wg_gesucht"`, `property_type: "share_room"` (WG-Gesucht's core product is a room within an occupied flat, not a whole unit). Plain-fetchable.
- [ ] **Step 4: Verify** — filter to `country === 'DE'`, expect 3 entries, confirm the two whole-flat listings have `price.dues_included === false`. Run `npm test`.
- [ ] **Step 5: Commit** — `git commit -m "feat: capture Germany listings from ImmobilienScout24, Immowelt, and WG-Gesucht"`

---

### Task 11: Capture verification — Spain

**Depends on:** Tasks 1–6.

- [ ] **Step 1: Idealista.com** — already has one test capture in `data/listings.json` from an earlier PH-project test (per `CLAUDE.md`'s existing note) — check whether that entry is still there and still representative; if not, capture a fresh one. `source.platform: "idealista"`, `location.country: "ES"`, `price.currency: "EUR"`. Needs a browser-driven fetch (already confirmed working, this is the platform that originally proved the pattern).
- [ ] **Step 2: Fotocasa.es** — `source.platform: "fotocasa"`. Plain-fetchable.
- [ ] **Step 3: pisos.com** — `source.platform: "pisos"`. Plain-fetchable.
- [ ] **Step 4: Verify** — filter to `country === 'ES'`, expect at least 3 entries covering all 3 platforms. Run `npm test`.
- [ ] **Step 5: Commit** — `git commit -m "feat: capture Spain listings from Idealista, Fotocasa, and pisos.com"`

---

### Task 12: Capture verification — France

**Depends on:** Tasks 1–6.

- [ ] **Step 1: LeBonCoin.fr** — `source.platform: "leboncoin"`, `location.country: "FR"`, `price.currency: "EUR"`. For Paris listings, `location.neighborhood` = arrondissement, `location.street` = quartier if given; for other French cities, `location.neighborhood` = commune/quartier directly (no arrondissement level exists outside Paris/Lyon/Marseille). Needs a browser-driven fetch (confirmed working) — note in `user.notes` if the listing price is `loyer hors charges` vs `charges comprises`, since `price.amount` should record whichever figure the listing headlines (typically `charges comprises`, the all-in figure).
- [ ] **Step 2: PAP.fr** — `source.platform: "pap"`. Same French pricing/area conventions as Step 1. Needs a browser-driven fetch (confirmed working).
- [ ] **Step 3: Verify** — filter to `country === 'FR'`, expect 2 entries (SeLoger deliberately excluded, so France stops at 2 platforms — this is expected, not a gap to fill in this task). Run `npm test`.
- [ ] **Step 4: Commit** — `git commit -m "feat: capture France listings from LeBonCoin and PAP.fr"`

---

### Task 13: Capture verification — Australia

**Depends on:** Tasks 1–6.

- [ ] **Step 1: Domain.com.au** — `source.platform: "domain_au"`, `location.country: "AU"`, `location.neighborhood` = suburb (clean single-level fit, no `street` split needed), `price.currency: "AUD"`, `price.period: "week"` (Australian rentals are quoted per week — do not convert to a monthly figure). If the listing is a "unit," map to `property_type: "apartment"`; if "townhouse," use the new `townhouse` value. Needs a browser-driven fetch (confirmed working).
- [ ] **Step 2: Verify** — filter to `country === 'AU'`, expect 1 entry with `price.period === 'week'`. This is deliberately the only Australian platform in this pass — Flatmates is hard-blocked and realestate.com.au is deferred, both per Global Constraints, not oversights. Run `npm test`.
- [ ] **Step 3: Commit** — `git commit -m "feat: capture Australia listing from Domain.com.au"`

---

## Self-Review

**1. Spec coverage:**
- `price.period` week/year → Task 1. ✅
- `property_type` kost/share_room/townhouse → Task 1. ✅
- Neighborhood/street per-country rule → Task 6 (docs) + applied per-country in Tasks 7–13. ✅
- Kaltmiete/Warmmiete via `dues_included` → Task 6 (docs) + applied in Task 10. ✅
- Deposit/fee edge cases → `user.notes`, documented in Task 6, applied where relevant in Tasks 11/12. ✅
- `source.platform` new values → Task 1 (types.ts) + Task 2 (script mirror). ✅
- No-empty-thumbnail rule → Task 2 (pure function + test) + Task 3 (wired into the script). ✅
- Platform list / exclusions documented → Task 6. ✅
- Country flags → Task 5 (a spec-adjacent quality-bar item the design conversation surfaced — no empty flag images for the new countries). ✅
- Real per-platform test captures → Tasks 7–13, one task per country, 16 platforms total. ✅
- Deferred items (country-info explainer, Trip Planner, revisiting realestate.com.au) → intentionally have no task here, matching the spec's "Deferred" section. ✅

**2. Placeholder scan:** no TBD/TODO; every code step has real code; capture tasks (7–13) are procedures rather than fixed code since real listing content can't be known in advance, but each has concrete field values (platform name, country code, currency, the specific rule to apply) and a concrete verification command, not "similar to Task 7."

**3. Type consistency:** `PLATFORMS`/`PROPERTY_TYPES`/`PRICE_PERIODS` values match exactly between Task 1 (`src/lib/types.ts`) and Task 2 (`scripts/lib/capture-validation.mjs`) — same strings, same order, checked side by side while writing both. `assertHasPhotos(photos, status)` signature is consistent between its definition (Task 2) and its call site (Task 3).

---

**Plan complete and saved to `docs/superpowers/plans/2026-08-26-multi-country-schema-expansion.md`.** Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
