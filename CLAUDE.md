@AGENTS.md
@"/Users/leonesquillon/Downloads/CLAUDE.md"

## Rules

- Never merge a PR without explicit user permission. Always ask first.
- Never push to any branch without asking the user first.
- Never commit secrets — no API keys, tokens, cookies, or .env values in code or messages.
- Conventional commits — use feat:, fix:, chore:, docs:, refactor:, test:, etc.
- Branch naming — <ticket-number>-<slug> (e.g. `3-idealista-client`).
- PR format — every PR must reference its issue (`Closes #N`) and include a brief "what this PR does" summary.
- Pre-merge checks — CI must be green before asking to merge. Run lint, typecheck, and tests locally before pushing.
- Doc updates — update CONTEXT.md when domain terms change or appear. Create ADRs for hard-to-reverse decisions. Update PLAN.md on scope/architecture shifts. Always ask the user before updating docs.

Local commands for the pre-merge checks: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test` (or `npm run format`/`biome check --write .` to fix what's fixable). The same four run as separate checks in `.github/workflows/ci.yml` on every PR.

`PLAN.md` doesn't exist yet — per "always ask before updating docs," it isn't being created preemptively. Create it (after asking) the first time a real scope/architecture shift actually happens, same lazy-creation approach already used for `CONTEXT.md`/`docs/adr/`.

## Adding a listing

When the user pastes a rental listing URL in this session:

1. Fetch it. Don't assume plain fetch works — as of 2026-08-25, Rentpad 403s on plain
   fetch (it didn't the day before). Try plain fetch first; if it fails, try a
   browser-driven fetch. Lamudi and Trovit block plain fetch and headless browsers,
   but work through the user's own logged-in Chrome (Claude in Chrome) — confirmed
   2026-10-14. Facebook Marketplace / groups also need the user's own logged-in
   browser session. One link at a time, never a crawl.
2. Extract fields into the schema in the imported context above. Normalize amenities
   into the canonical vocabulary at `src/lib/amenity-vocabulary.json` — if a genuinely
   new amenity shows up, add it to that file first rather than inventing a tag inline.
   `location.neighborhood` must be the specific area (e.g. "Legazpi Village", "Salcedo
   Village", "Rockwell"), not just the city — it drives the app's city > neighborhood
   filter, so city-level-only is not good enough.
3. Collect photo URLs from the listing page (the unit's own photos, not stock/agent
   headshots) and pass them as `photos: ["url", ...]` in the input — up to 8 keeps
   things light. On Trovit and Lamudi the gallery is `img[alt^="place photo"]`; each
   src is a base64 JSON `{bucket, key, edits.resize}` you can re-encode with a larger
   resize (e.g. 1600×1200, fit `inside`). Lamudi galleries can open with building
   promo shots from the `prd-lifullconnect-projects-admin-images` bucket — skip those
   and keep `prd-lifullconnect-backend-b2b-images` (the unit's own photos). Some
   older Lamudi listings serve plain `images.proppit.com` URLs instead.
4. Run `node scripts/add-listing.mjs '<json>'` with the extracted object (see the
   script for the exact required shape). It validates, fills in `id`/`captured_at`/
   `price_per_sqm`, downloads and normalizes each photo to a 16:9 WebP frame and
   uploads it to Supabase Storage at `photos/<id>/` (upscaling smaller images via
   high-quality resampling, not AI super-resolution — that's a future option if an
   upscaling API key gets added), and appends to `data/listings.json`.
5. If extraction fails and no browser-driven retry has been attempted yet, still add
   the listing with `user.status: "extraction_failed"` rather than dropping it.

To add or replace photos on a listing that already exists (e.g. one imported without
photos, or an `extraction_failed` retry), run
`node scripts/set-listing-photos.mjs <listing-id> "<photo-url>" [...]` — same
normalize-and-upload pipeline, and it refuses to save an empty set.

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

It downloads the image, normalizes it to a max-width WebP (no crop — logos keep their
own aspect ratio, unlike photos/landmarks), uploads it to Supabase Storage at
`platforms/<platform>.webp`, and records it in `src/lib/platform-marks.json`.

## Adding a city landmark

The main screen shows a big visual card per city, using a landmark photo. When a
listing shows up in a city that doesn't have one yet (check `src/lib/city-landmarks.json`),
use the city's most popular landmark, with the official photo from its tourism page
(per owner direction 2026-10-14) — for PH cities, the Department of Tourism's "Love
the Philippines" page at `tourism.gov.ph/destination/...` (its `og:image` is the
featured photo). These are usually copyrighted, unlike Wikimedia Commons, so always
credit the source in the attribution. Then run:

`node scripts/add-city-landmark.mjs "City Name" "<image-url>" "<attribution text>"`

It downloads the photo, normalizes it to a 16:9 WebP, uploads it to Supabase Storage
at `cities/<slug>.webp`, and records the city → image mapping (plus attribution,
shown as a hover tooltip on the card) in `src/lib/city-landmarks.json`. A city
without an entry still works — its card just renders as a plain color block
instead of a photo.

## Images

Every image lives in the public `images` bucket in Supabase Storage, not under
`public/` (see `docs/adr/0004-images-in-supabase-storage.md`). The upload scripts
above need `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `.env.local`
(gitignored — never commit it or print the secret key).
