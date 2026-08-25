@AGENTS.md
@"/Users/leonesquillon/Downloads/CLAUDE.md"

## Adding a listing

When the user pastes a rental listing URL in this session:

1. Fetch it. Don't assume plain fetch works — as of 2026-08-25, Rentpad 403s on plain
   fetch (it didn't the day before). Try plain fetch first; if it fails, try a
   browser-driven fetch. **Skip Lamudi for now** (per user direction 2026-08-25) — it
   returns a site-wide "Access Denied" even with a full browser-driven fetch, so it's
   not worth attempting until that's independently resolved; use DotProperty, Rentpad,
   or Facebook instead. Facebook Marketplace / groups need the user's own logged-in
   browser session — one link at a time, never a crawl.
2. Extract fields into the schema in the imported context above. Normalize amenities
   into the canonical vocabulary at `src/lib/amenity-vocabulary.json` — if a genuinely
   new amenity shows up, add it to that file first rather than inventing a tag inline.
   `location.neighborhood` must be the specific area (e.g. "Legazpi Village", "Salcedo
   Village", "Rockwell"), not just the city — it drives the app's city > neighborhood
   filter, so city-level-only is not good enough.
3. Collect photo URLs from the listing page (the unit's own photos, not stock/agent
   headshots) and pass them as `photos: ["url", ...]` in the input.
4. Run `node scripts/add-listing.mjs '<json>'` with the extracted object (see the
   script for the exact required shape). It validates, fills in `id`/`captured_at`/
   `price_per_sqm`, downloads and normalizes each photo to a 16:9 frame under
   `public/photos/<id>/` (upscaling smaller images via high-quality resampling, not
   AI super-resolution — that's a future option if an upscaling API key gets added),
   and appends to `data/listings.json`.
5. If extraction fails and no browser-driven retry has been attempted yet, still add
   the listing with `user.status: "extraction_failed"` rather than dropping it.

`source.platform` also accepts `"other"` for non-PH test/edge-case captures (see
"Non-PH test data" in the imported context above) — not for real PH platforms that
just aren't Lamudi/DotProperty/Rentpad/FB. Short-term platforms (Airbnb, etc.) get
their own real platform value instead — see "Short-term stay platforms" above for
how to handle their dynamic/nightly pricing (one indicative quote captured during
the session, no date-picker UI in the app).

## Adding a platform wordmark

Listings show the source platform's real wordmark instead of a generic badge when
one exists (check `src/lib/platform-marks.json`) — otherwise it falls back to
plain text, which is a fine default, not an error state. When a platform is used
repeatedly, find its real logo (site header is usually easiest; some are inline
SVG rather than a static asset URL and aren't worth fighting for — text fallback
is fine in that case, as it is for Airbnb currently) and run:

`node scripts/add-platform-mark.mjs <platform> "<image-url>"`

It downloads the image, normalizes it to a max width (no crop — logos keep their
own aspect ratio, unlike photos/landmarks), saves it under `public/platforms/`,
and records it in `src/lib/platform-marks.json`.

## Adding a city landmark

The main screen shows a big visual card per city, using a landmark photo. When a
listing shows up in a city that doesn't have one yet (check `src/lib/city-landmarks.json`),
find a real, appropriately-licensed photo (Wikimedia Commons is a good source — check
the file's license/attribution on its description page) and run:

`node scripts/add-city-landmark.mjs "City Name" "<image-url>" "<attribution text>"`

It downloads the photo, normalizes it to 16:9, saves it under `public/cities/`, and
records the city → image mapping (plus attribution, shown as a hover tooltip on the
card) in `src/lib/city-landmarks.json`. A city without an entry still works — its
card just renders as a plain color block instead of a photo.
