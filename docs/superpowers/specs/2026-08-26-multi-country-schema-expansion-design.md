# Multi-country schema expansion — design

Status: approved pending user sign-off (see bottom)
Related: `docs/research/rental-platforms-by-country.md` (platform research + live
capturability testing this design is built on), ADR 0001 (flat JSON data store),
ADR 0002 (conversational capture, not a scraper), AGENTS.md (current schema, data
schema rules, "Known platform quirks")

## Goal

Flathunter's identity is expanding from "Philippines rental tracker" to "a link
aggregator for flats from anywhere." This spec covers the schema and capture-rule
changes needed so that pasting a link from any of the newly-researched platforms
produces a listing that fits the existing data model cleanly — no per-country
special-casing in the app itself, no surprising gaps, no empty thumbnails.

This spec does **not** cover the in-app queue/review page (separate, already
paused pending this schema work) or the country-info explainer feature raised
during this design conversation (separate, deferred — see "Deferred" below).

## Platforms going live

Per the research doc's confirmed-capturable list, minus SeLoger (skipped — real
litigation history + explicit anti-AI-training clause, a materially different risk
tier from the rest of the survey) and realestate.com.au (deferred — untestable by
current tooling, shares its bot-mitigation vendor with Flatmates, which failed
outright):

| Country | Platforms going live | Notes |
|---|---|---|
| Philippines | DotProperty, Lamudi, Rentpad, FB Marketplace/groups | unchanged |
| Vietnam | Batdongsan.com.vn, Chợ Tốt, Homedy.com | all 3 confirmed |
| Indonesia | Rumah123.com, 99.co, Mamikos.com | all 3 confirmed |
| Thailand | DDproperty.com, FazWaz.com, Dot Property Thailand | all 3 confirmed (Dot Property Thailand shares the `dotproperty` platform value with PH — see below) |
| Germany | ImmobilienScout24.de, Immowelt.de, WG-Gesucht.de | all 3 confirmed |
| Spain | Idealista.com, Fotocasa.es, pisos.com | all 3 confirmed |
| France | LeBonCoin.fr, PAP.fr | **2 of 3** — SeLoger skipped |
| Australia | Domain.com.au | **1 of 3** — Flatmates hard-blocked (Lamudi-tier), realestate.com.au deferred |

France and Australia are short of the ~3-per-country target by design, not by
oversight — both gaps are named, reasoned decisions (legal risk, confirmed hard
block, untested tooling), not gaps to silently paper over. Revisiting
realestate.com.au (e.g. via the user's own logged-in browser session, same pattern
already used for Facebook) is a plausible future follow-up, not part of this spec.

## Schema changes

### 1. `price.period`: add `"week"` and `"year"`

Was `"month" | "night"`. Becomes `"month" | "night" | "week" | "year"`.

- Australia's entire long-term rental market quotes rent per week — this is the
  single highest-impact gap in the whole research pass. No conversion to monthly;
  record what the source actually says.
- Indonesian kost/apartment listings routinely offer annual (tahunan) pricing as a
  first-class alternative to monthly, same reasoning.

### 2. `property_type`: add `"kost"`, `"share_room"`, `"townhouse"`

Was `"condo" | "apartment" | "house" | "studio"`. Becomes `"condo" | "apartment" |
"house" | "studio" | "kost" | "share_room" | "townhouse"`.

- `kost`: Indonesian boarding-house room, shared common areas, typically no
  private kitchen — Mamikos's core product. Meaningfully different from `studio`
  (which implies a private, self-contained unit).
- `share_room`: a room within an occupied flat, shared kitchen/bathroom — WG-Gesucht
  (Germany) and Flatmates' listing model (Australia, even though Flatmates itself
  isn't capturable, the product concept still applies to Domain.com.au share
  listings).
- `townhouse`: distinct local term in Thailand and Australia, not equivalent to
  `house` in local usage (loses information if collapsed into it).

These are added now rather than deferred, since platforms whose core product *is*
one of these types (Mamikos, WG-Gesucht) are going live in this same pass —
approximating them into the existing 4 values would misrepresent listings being
captured from day one, not a hypothetical future case.

### 3. `neighborhood`: no field change — a capture rule instead

Vietnam (district → ward), Indonesia (kecamatan → kelurahan), Thailand (khet →
khwaeng), and Germany (Bezirk → Stadtteil/Kiez) all have a genuine two-level
administrative hierarchy below city. Rather than adding a third geography field,
`location.neighborhood` keeps its current single-field shape, with a documented
per-country rule:

> Capture the **coarser** administrative level as `neighborhood` — the level
> locals actually use when describing where they live (district / Bezirk /
> kecamatan / khet). If the source gives a finer level (ward / Stadtteil /
> kelurahan / khwaeng) or a street, it goes in `location.street`, the same slot
> already used for PH's "Rada Street" precedent.

Australia (suburb) and Spain (barrio/zona) already fit the existing single-level
model cleanly — no rule needed there. France varies by city (arrondissements exist
in Paris/Lyon/Marseille only) — the same "coarser level, finer detail in `street`"
rule applies; for Paris that means arrondissement in `neighborhood`, quartier in
`street` if given.

### 4. Germany's Kaltmiete/Warmmiete: reuse `price.dues_included`, no new field

`price.dues_included` already exists (added for PH condo association dues) and is
exactly the right shape for this: a boolean for "does `price.amount` include
ancillary costs beyond the base rent."

> Capture **Kaltmiete** (base rent) as `price.amount`, with `dues_included:
> false`. Kaltmiete is the legally meaningful figure in Germany (deposit caps are
> calculated against it) and keeps German prices comparable to every other
> market's base-rent convention.

### 5. Deposit/fee edge cases: no schema change, `user.notes` absorbs the loss

Spain's legal deposit is two separate figures (1-month `fianza` + up to 2 months
`garantía adicional`); Australia's bond is denominated in weeks, not months;
France's frais d'agence (agency fee, ~0.5–1 month's rent) has no home in
`payment_terms` at all.

`payment_terms.deposit_months` stays as-is — a Philippines-shaped simplification
that doesn't perfectly generalize. Where it doesn't fit, the real terms (the
actual two-part figure, the actual weekly bond amount, the agency fee) go in
`user.notes` as plain text during capture, rather than growing `payment_terms`
with market-specific fields. This is a deliberate simplicity-over-fidelity
trade-off — worth revisiting only if it turns out to actually bother the user
once real non-PH listings are in the data.

### 6. `source.platform`: new named values

Following the existing convention (a real platform name, never `"other"`, for any
platform actually used repeatedly — see AGENTS.md's "Short-term stay platforms"
section): `batdongsan`, `chotot`, `homedy`, `rumah123`, `99co`, `mamikos`,
`ddproperty`, `fazwaz`, `immobilienscout24`, `immowelt`, `wg_gesucht`, `fotocasa`,
`pisos`, `leboncoin`, `pap`, `domain_au`.

`dotproperty.co.th` (Thailand) reuses the existing `"dotproperty"` value rather
than getting its own — same brand/group as the Philippines site, and
`location.country` already disambiguates the two without needing a country suffix
on the platform name.

### 7. No thumbnail without a photo — capture-flow rule, not a schema change

Per product direction: a listing is not considered fully captured until it has at
least one real photo. If text extraction succeeds but photo URLs can't be secured
(the DotProperty pattern — plain fetch gets text, but photo `src` values need a
browser-driven fetch to survive), the capture flow retries with a browser-driven
fetch specifically for photos before finishing, rather than saving with an empty
`photos` array. This is a rule for `scripts/add-listing.mjs` / the capture
workflow, not a schema field.

## Deferred (raised during this design conversation, out of scope here)

- **Country-info explainer**: a short reference blurb shown when browsing a
  country/city's listings, explaining local rental customs (e.g. "expect a 2x
  down payment," "Germany: you may need to buy your own kitchen," "Philippines:
  association dues are common"). Explicitly not a schema field — a static,
  per-country content piece for the browsing UI. Belongs with the
  navigation/site-architecture conversation, not this spec.
- **Trip Planner** (already noted in AGENTS.md, unrelated to this pass).
- **Revisiting realestate.com.au** via a different access path (e.g. the user's
  own logged-in browser session, mirroring how Facebook capture already works).

## Testing

- `src/lib/amenities.test.ts`, `listing-features.test.ts`, `format.test.ts`,
  `listing-grouping.test.ts` — none of these should need behavior changes from
  this spec alone (no amenity vocabulary changes, no grouping-logic changes), but
  each gets a pass to confirm the wider `property_type`/`price.period` enums don't
  break an exhaustiveness assumption anywhere.
- New: a test asserting the capture flow refuses to finish a listing with an
  empty `photos` array (the "no empty thumbnails" rule).
- Manual: capture one real listing per newly-added platform (17 platforms across
  7 countries) to confirm the schema holds up against real data, not just the
  research pass's spot-checks — this becomes the implementation plan's ticket
  breakdown, likely grouped by country.

## Sign-off

Written 2026-08-26. Please review and flag anything before this moves to
`writing-plans` for the implementation plan / ticket breakdown.
