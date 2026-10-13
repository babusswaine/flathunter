# Images live in Supabase Storage; listing data stays in the JSON file

Every image the app shows — listing photos, platform logos, city photos, country
flags — is stored in a public Supabase Storage bucket instead of being committed
under `public/`. The owner wants the project lightweight: at around ten photos
per Listing, committing photos grows the repository with every capture, and
images committed to git can never really be removed from its history.

Only images move. Listing data stays in `data/listings.json` (ADR 0001) — it's
small, human-readable, and benefits from git history; images are none of those.

Images are optimized before upload — converted to WebP and sized for how they're
displayed, with photos keeping the 16:9 frame from ADR 0003 — because Supabase's
on-the-fly image resizing is only available on paid plans, and the free plan
(1 GB storage, 5 GB egress a month) is ample at this scale. Listings store bucket
paths rather than full URLs, so moving to another Supabase project only means
changing `NEXT_PUBLIC_SUPABASE_URL`.

The trade-offs this accepts: images need a network connection to load, a free
Supabase account becomes a dependency, and the upload key must stay out of git
(it lives only in `.env.local`). Free projects are paused after a week of
inactivity, and images won't load until the project is restored from the
Supabase dashboard — acceptable for a personal tool, but worth knowing.
