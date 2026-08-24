@AGENTS.md
@"/Users/leonesquillon/Downloads/CLAUDE.md"

## Adding a listing

When the user pastes a rental listing URL in this session:

1. Fetch it. Plain fetch works for DotProperty and Rentpad. Lamudi 403s on plain HTTP
   (bot detection) — use a browser-driven fetch instead. Facebook Marketplace / groups
   need the user's own logged-in browser session — one link at a time, never a crawl.
2. Extract fields into the schema in the imported context above. Normalize amenities
   into the canonical vocabulary at `src/lib/amenity-vocabulary.json` — if a genuinely
   new amenity shows up, add it to that file first rather than inventing a tag inline.
3. Run `node scripts/add-listing.mjs '<json>'` with the extracted object (see the
   script for the exact required shape). It validates, fills in `id`/`captured_at`/
   `price_per_sqm`, and appends to `data/listings.json`.
4. If extraction fails and no browser-driven retry has been attempted yet, still add
   the listing with `user.status: "extraction_failed"` rather than dropping it.
