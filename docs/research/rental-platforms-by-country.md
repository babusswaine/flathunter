# Rental/flat-listing platforms by country

## Browser-driven fetch follow-up (2026-08-26)

Every platform below marked "likely needs a browser" from the plain-`curl` pass was
re-tested with a real browser (Claude Browser tools — genuine JS execution, real
browser fingerprint), the same method that originally confirmed Idealista and
Rentpad work despite failing a plain fetch. Method: visit the platform's rental
search/listing page, open one real individual listing, and judge whether actual
listing content (title, price, bedrooms, description, photos) renders versus a
challenge/CAPTCHA/access-denied page. Lamudi (PH) remains the only platform
confirmed hard-blocked even with a full browser-driven fetch; it was not re-tested
here since that finding is already settled per `AGENTS.md`.

**Confirmed capturable via browser (same tier as Idealista/Rentpad):**
Batdongsan.com.vn, 99.co (Indonesia), DDproperty.com, FazWaz.com,
ImmobilienScout24.de, Immowelt.de, SeLoger.com, LeBonCoin.fr, PAP.fr,
Domain.com.au. That's 10 of 12 platforms tested — in every case the live
Cloudflare/DataDome/bot-check interstitial that blocked the plain `curl` fetch
either auto-resolved within a few seconds of a genuine browser session or never
appeared at all against listing pages, and full listing content (title, price,
bedrooms/area, description, photos) rendered normally.

**Hard-blocked even with a browser (Lamudi-tier):** Flatmates.com.au — Kasada's
bot-mitigation kept the homepage stuck in a 429 challenge loop (blank white page,
repeated `x-kpsdk-im`/`KP_UIDz` challenge-token requests logged in the network
panel, actual page fetch returning HTTP 429 each time) across 3 separate reload
attempts and ~40s of total wait. Not capturable today.

**Uncertain:** realestate.com.au — could not be tested at all; the Claude Browser
tool itself refuses to open `realestate.com.au` under a hardcoded policy block
("blocked by policy and cannot be opened in the Browser pane"), independent of
the site's own Kasada protection. This is a tooling limitation in this pass, not
a finding about the site — it needs a re-test with a different browser-automation
setup before a real verdict can be given. Worth flagging that realestate.com.au
and Flatmates.com.au share the same Kasada vendor, and Flatmates failed outright,
so realestate.com.au should not be assumed to pass just because Domain.com.au
(different vendor, Akamai) did.

**Legal-risk caveat (independent of the technical verdict):** SeLoger.com passed
the browser test cleanly (full listing content, no challenge encountered), but
its parent group has already won a court judgment against a scraping app (Jinka)
on counterfeiting/database-rights grounds, and its CGU explicitly forbids
automated data extraction "including for AI-training purposes" — see the SeLoger
section below. Technically capturable and legally elevated-risk are two separate
questions here; flagging both rather than resolving one against the other.

Research pass to prep flathunter's expansion from Philippines-only to 8 countries:
Philippines, Vietnam, Indonesia, Thailand, Germany, Spain, France, Australia. For
each non-PH country this identifies ~3 of the most-used long-term rental platforms,
checks fetchability signals against each platform's own site/robots.txt/ToS, and
flags schema mismatches against the `Data schema` in `CLAUDE.md`
(imported from `~/Downloads/CLAUDE.md`).

Method: robots.txt and homepage were fetched directly with a plain `curl` (desktop
Chrome user agent, no JS execution, no browser) on 2026-08-26 — this doubles as the
actual fetchability test, since "does a plain server-side HTTP fetch work" is
exactly what capture in this app needs. ToS/robots.txt claims are quoted or
paraphrased with a link to the source. Secondary "best rental sites" roundups were
used only to find candidate names, never as a fact source.

## Summary table

| Country | Platform | Fetchability | Currency | Area-naming note |
|---|---|---|---|---|
| Philippines | DotProperty | (already integrated) | PHP | neighborhood, e.g. Legazpi Village |
| Philippines | Lamudi | (already integrated, blocked) | PHP | neighborhood |
| Philippines | Rentpad | (already integrated, unstable) | PHP | neighborhood |
| Philippines | Facebook Marketplace/groups | (already integrated, needs login) | PHP | neighborhood |
| Vietnam | Batdongsan.com.vn | likely needs a browser (Cloudflare challenge) | VND | quận/district → phường/ward (2 levels) |
| Vietnam | Chợ Tốt (chotot.com) | likely fetchable | VND | district, sometimes ward |
| Vietnam | Homedy.com | likely fetchable | VND | district, sometimes ward |
| Indonesia | Rumah123.com | likely fetchable | IDR | kecamatan → kelurahan (2 levels) |
| Indonesia | 99.co (Indonesia) | likely needs a browser (Cloudflare challenge) | IDR | kecamatan → kelurahan |
| Indonesia | Mamikos.com | likely fetchable | IDR | kecamatan, often just area/street name |
| Thailand | DDproperty.com | likely needs a browser (Cloudflare challenge) | THB | khet/district → khwaeng/sub-district |
| Thailand | FazWaz.com | likely needs a browser (Cloudflare challenge) | THB (also USD/EUR/GBP) | khet → khwaeng |
| Thailand | Dot Property Thailand (dotproperty.co.th) | likely fetchable | THB | khet → khwaeng |
| Germany | ImmobilienScout24.de | likely needs a browser (bot-check page) | EUR | Bezirk → Stadtteil/Ortsteil (2 levels) |
| Germany | Immowelt.de | likely needs a browser (JS/anti-bot wall) | EUR | Stadtteil |
| Germany | WG-Gesucht.de | likely fetchable | EUR | Stadtteil |
| Spain | Idealista.com | likely needs a browser (DataDome) | EUR | barrio/zona |
| Spain | Fotocasa.es | likely fetchable (under `/es/`) | EUR | barrio/zona |
| Spain | pisos.com | likely fetchable | EUR | barrio/zona |
| France | SeLoger.com | likely needs a browser (DataDome) | EUR | arrondissement → quartier (Paris only) |
| France | LeBonCoin.fr | likely needs a browser (DataDome; robots.txt bans bots outright) | EUR | quartier, varies by city |
| France | PAP.fr | likely needs a browser (Cloudflare challenge) | EUR | quartier |
| Australia | realestate.com.au | likely needs a browser (Kasada bot-mitigation) | AUD | suburb (clean 1-level fit) |
| Australia | Domain.com.au | likely needs a browser (Akamai block) | AUD | suburb |
| Australia | Flatmates.com.au | likely needs a browser (Kasada bot-mitigation) | AUD | suburb |

## Philippines (light-touch confirmation)

Already integrated per `CLAUDE.md`: DotProperty, Lamudi, Rentpad, Facebook
Marketplace/groups. A quick check against current roundups and platform pages
confirms these are still the right set — no re-research beyond this.

- DotProperty (dotproperty.com.ph) and Lamudi remain listed as the leading PH
  listing marketplaces in current write-ups.
  ([Dot Property PH](https://www.dotproperty.com.ph/properties-for-rent),
  general market roundup search, 2026-08-26)
- Facebook is confirmed as the dominant channel for long-term rentals outside
  Metro Manila, matching the existing FB Marketplace/groups coverage.
- One new name worth watching, not urgent to add: **rent.ph**, a newer
  AI-search rental listing site gaining visibility in current roundups
  ([rent.ph](https://rent.ph/)). Not verified against robots.txt/fetchability —
  flagging only as a name to reconsider later, not a recommendation to add now.
- Rentpad doesn't surface in generic "best PH rental sites" roundups, but
  flathunter's own field-testing (documented in `CLAUDE.md`) is a stronger
  signal than a secondary roundup — no change recommended.

## Vietnam

### Batdongsan.com.vn
1. **Homepage**: https://batdongsan.com.vn/
2. **Fetchability**: likely needs a browser. A plain fetch of the homepage and of
   `/robots.txt` both return Cloudflare's interactive JS challenge page ("Just a
   moment...", `cf-mitigated: challenge` response header, `server: cloudflare`),
   tested directly 2026-08-26.
3. **Currency**: VND.
4. **Area-naming convention**: Vietnam addresses use Tỉnh/Thành phố (province/city)
   → quận/huyện (district) → phường (ward) → đường (street). Batdongsan's own
   listing-submission rules require this exact breakdown, and its search UI filters
   by district (e.g. "Quận 1", "Cầu Giấy") as the primary sub-city unit.
   ([Batdongsan posting rules](https://trogiup.batdongsan.com.vn/docs/quy-dinh-dang-tin-chung))
   This is a real two-level hierarchy below city (district, then ward) — deeper
   than flathunter's single `neighborhood` field. In practice Vietnamese listing
   sites treat **district** as the primary sub-city browsing unit (closest
   equivalent to flathunter's neighborhood), with ward/street as finer detail that
   could go in `location.street` alongside its Rada-Street-style precedent.
5. **Schema mismatches**: "chung cư mini" (mini-apartment / service-apartment,
   common in listings — see Batdongsan's own
   [chung cư mini category](https://batdongsan.com.vn/cho-thue-can-ho-chung-cu-mini))
   sits between `studio` and `apartment` in the existing enum; a studio/apartment
   mapping is probably close enough, but it's worth watching for a genuinely
   distinct property type (single-room, shared-building, often no kitchen) similar
   to Indonesia's "kost" below. Deposit convention is typically 1–2 months, which
   fits `payment_terms.deposit_months` cleanly.
   ([deposit convention discussion](https://vinhomesreal.vn/bai-viet/coc-phong-tro-1-thang-hay-2-thang-an-toan))
6. **robots.txt / ToS posture**: robots.txt itself is unreachable behind the
   Cloudflare challenge (can't be read by a plain fetch), which is itself a strong
   practical anti-bot signal even before reading any ToS text.
7. **Browser-driven fetch re-test (2026-08-26): Works via browser.** The Cloudflare
   "Just a moment..." challenge auto-resolved within ~5s of a real browser session
   on the homepage; a rental search page and an individual listing page (a 1BR
   Grand Marina Saigon condo, 35tr VND/month) both loaded with no further
   challenge, and the listing page rendered full content: title, price, area,
   bedroom count, photo gallery (1/10), full description, agent info.

### Chợ Tốt (chotot.com)
1. **Homepage**: https://www.chotot.com/ (a general classifieds marketplace with a
   large real-estate/rental vertical, not a dedicated property portal)
2. **Fetchability**: likely fetchable. `https://www.chotot.com/` returns HTTP 200
   with a full server-rendered HTML page (~99K characters of visible text after
   stripping tags), tested 2026-08-26. `server: cloudflare` is present but as a CDN
   only — no interactive challenge was served, unlike batdongsan.com.vn.
3. **Currency**: VND.
4. **Area-naming convention**: same Vietnam province/city → district → ward
   hierarchy as above; Chợ Tốt's own real-estate category pages are organized by
   province/city then district.
5. **Schema mismatches**: same as Batdongsan — district-level as the practical
   neighborhood equivalent, occasional "chung cư mini"/service-apartment listings
   that don't map cleanly onto the property_type enum.
6. **robots.txt / ToS posture**: robots.txt is plain and reachable
   (https://www.chotot.com/robots.txt, HTTP 200) — mostly open, with account/chat/
   login/admin paths disallowed, and a notable machine-readable AI-crawling
   preference header: `Content-Signal: search=yes, ai-input=yes, ai-train=no`. No
   blanket `Disallow: /`.

### Homedy.com
1. **Homepage**: https://homedy.com/
2. **Fetchability**: likely fetchable. Returns HTTP 200 with a full server-rendered
   page (~529K characters of raw HTML, real visible Vietnamese text throughout —
   e.g. page `<title>` "Bất động sản Homedy – Kênh mua bán nhà đất #1 Việt Nam"),
   tested 2026-08-26. `server: cloudflare` present as CDN only, no challenge page
   returned.
3. **Currency**: VND.
4. **Area-naming convention**: same province/city → district → ward pattern.
5. **Schema mismatches**: same notes as above (chung-cư-mini boundary case).
6. **robots.txt / ToS posture**: robots.txt (https://homedy.com/robots.txt, HTTP
   200) is open by default (`Allow: /`) and blocks only specific bots by name —
   AhrefsBot, GPTBot, Amazonbot, TurnitinBot — plus some URL patterns
   (`/*amp*`, `/js/`). No general anti-automation clause found.

## Indonesia

### Rumah123.com
1. **Homepage**: https://www.rumah123.com/
2. **Fetchability**: likely fetchable. Returns HTTP 200 with a fully server-rendered
   page (~293K characters of visible text, real listing/marketing copy present),
   tested 2026-08-26. `server: cloudflare` as CDN only, no challenge encountered.
3. **Currency**: IDR (displayed as "Rp", often abbreviated in millions, e.g. "Rp2,75
   juta").
4. **Area-naming convention**: Indonesia's administrative hierarchy below city is
   kecamatan (district) → kelurahan/desa (sub-district/village). Rumah123 itself
   supports filtering and has dedicated pages at both levels — e.g. its own
   [postal-code directory organized by kelurahan, kecamatan, and
   city](https://www.rumah123.com/kodepos/), and area guides broken down by
   kecamatan with kelurahan counts
   (e.g. [Jakarta Utara](https://artikel.rumah123.com/kecamatan-di-jakarta-utara)).
   This is a genuine two-level hierarchy below city — flathunter's single
   `neighborhood` field would need to pick one level (kelurahan is the closer
   semantic match to "specific named area," similar to a PH barangay/village) or
   allow an optional deeper level.
5. **Schema mismatches**: see "kost" note under Mamikos below — Rumah123 itself is
   mostly apartment/house/land sale+rent, so this is less acute here than on
   Mamikos, but Rumah123 does carry some kost and yearly-lease listings too.
6. **robots.txt / ToS posture**: robots.txt (https://www.rumah123.com/robots.txt,
   HTTP 200) blanket-disallows two named bots (Yandex, trovitBot) and disallows
   specific paths (API, internal assets, certain query patterns) for everyone
   else, but does not blanket-disallow general crawling.

### 99.co (Indonesia)
1. **Homepage**: https://www.99.co/indonesia
2. **Fetchability**: likely needs a browser. Returns HTTP 403 with Cloudflare's
   interactive challenge page (`cf-mitigated: challenge`), tested 2026-08-26 —
   same signature as batdongsan.com.vn above.
3. **Currency**: IDR.
4. **Area-naming convention**: same kecamatan → kelurahan hierarchy; 99.co's
   robots.txt itself references this structure via its extensive per-path
   disallow list under `/id/`.
5. **Schema mismatches**: same kecamatan/kelurahan two-level issue as Rumah123.
6. **robots.txt / ToS posture**: robots.txt
   (https://www.99.co/robots.txt, HTTP 200) is reachable even though the homepage
   itself is challenge-gated — it disallows a long list of specific paths
   (account, ajax, cart, search-filter query strings) plus `trovitBot` entirely,
   but is not a blanket `Disallow: /` for `*`.
7. **Browser-driven fetch re-test (2026-08-26): Works via browser.** The
   homepage's Cloudflare challenge auto-resolved after ~6s; a rental listings
   search (`/id/sewa/apartemen`) and an individual listing (a 1BR Senopati,
   Jakarta Selatan apartment) both loaded directly with no further challenge —
   full content rendered: title, price (Rp 249,12 Juta/Tahun), size, room/bathroom
   count, furnishing, description, nearby-landmark list.

### Mamikos.com
1. **Homepage**: https://mamikos.com/ (root domain — `www.mamikos.com` 301-redirects
   here)
2. **Fetchability**: likely fetchable. Returns HTTP 200 with real server-rendered
   content (`server: nginx`, ~22K characters of visible text, page `<title>`
   "Mamikos - Cari, Bayar, & Sewa Kost Impianmu Secara Online"), tested
   2026-08-26. No Cloudflare/challenge signature seen.
3. **Currency**: IDR, typically quoted per month ("/Bulan") but also per year
   ("Tahunan") and per day ("Harian") — see next point.
4. **Area-naming convention**: same kecamatan/kelurahan structure as the other
   Indonesian platforms, though Mamikos listing titles often lean on
   neighborhood/street-level names directly (e.g. area names within a kecamatan)
   rather than always surfacing the formal kelurahan.
5. **Schema mismatches — the significant one for Indonesia**: Mamikos is a
   **kost** platform — kost (a rented room in a boarding house, shared common
   areas, typically no private kitchen) is Indonesia's dominant long-term-rental
   product for singles/students/young workers and has no match in flathunter's
   `property_type` enum (`condo|apartment|house|studio`). It's meaningfully
   different from `studio` (shared building/facilities, often gender-segregated,
   sometimes no ensuite bathroom). Also confirmed: Mamikos and other Indonesian
   platforms commonly quote pricing **per year** (tahunan) as a first-class option
   alongside monthly — see e.g.
   [Kost Tahunan Jakarta](https://mamikos.com/kost/kost-tahunan-jakarta-murah) and
   [Sewa Apartemen Tahunan Jakarta](https://mamikos.com/daftar/sewa-apartemen-tahunan-jakarta).
   `price.period` (currently `month|night`) has no slot for this.
6. **robots.txt / ToS posture**: not deeply checked beyond the redirect behavior
   above; worth a follow-up pass if Mamikos is actually adopted, since kost is
   different enough from the condo/apartment platforms already in scope to
   deserve its own look.

Note: **Rumah.com** was also checked as a candidate and rejected for this top-3 —
its `robots.txt` is a blanket `Disallow: /` for all agents
(https://www.rumah.com/robots.txt, 25 bytes total), and its homepage returns only
a ~2KB loading shell on a plain fetch even though it reports HTTP 200 — both
signals point to "likely needs a browser" at best, and the robots.txt posture is
the most restrictive found in this whole survey.

## Thailand

### DDproperty.com
1. **Homepage**: https://www.ddproperty.com/ (Thailand's PropertyGuru-network site)
2. **Fetchability**: likely needs a browser. Returns HTTP 403 with Cloudflare's
   interactive challenge page (`cf-mitigated: challenge`), tested 2026-08-26 —
   robots.txt itself is behind the same challenge and unreadable by plain fetch.
3. **Currency**: THB.
4. **Area-naming convention**: Bangkok (and Thailand generally) uses khet
   (เขต, district) → khwaeng (แขวง, sub-district) below city/province level —
   confirmed via DDproperty's own listed business address, which is written in
   this same district/sub-district form (Klongtoey Sub-District, Klongtoey
   District, Bangkok). Two levels below city, same shape as Vietnam/Indonesia.
5. **Schema mismatches**: Thai condo listings very commonly include "townhouse"
   and "pool villa" as property types, neither of which maps cleanly onto
   `condo|apartment|house|studio` (townhouse ≠ house in local usage; villa
   usually implies a standalone house with pool, reasonably close to `house`
   but loses information). Deposit convention (see FazWaz below) fits
   `payment_terms` cleanly.
6. **robots.txt / ToS posture**: unreachable behind Cloudflare challenge, so no
   text could be read directly in this pass — the practical block is the stronger
   signal here regardless of what the text says.
7. **Browser-driven fetch re-test (2026-08-26): Works via browser.** Homepage
   Cloudflare challenge auto-resolved after ~6s; the English rent listings page
   and an individual listing (The Room Sathorn-Taksin, a 1BR/1BA 49sqm condo in
   Thon Buri, ฿18,000/mo) both loaded directly, full content rendered: price,
   bed/bath/sqm, nearby BTS distance, property details, full description, agent
   contact block (partially redacted by the site itself, not a block).

### FazWaz.com
1. **Homepage**: https://www.fazwaz.com/
2. **Fetchability**: likely needs a browser. Returns HTTP 403 with Cloudflare's
   interactive challenge page, tested 2026-08-26 — despite FazWaz's own
   robots.txt (readable independently, see below) being fairly permissive on
   paper. This is a good example of why a robots.txt read alone isn't a reliable
   fetchability signal — the live bot-detection layer (Cloudflare here) overrides
   what robots.txt says.
3. **Currency**: THB by default, with a user-selectable currency switcher
   offering THB/USD/EUR/GBP — FazWaz is explicitly foreign-buyer/expat-oriented.
   ([currency switcher](https://www.fazwaz.com/property-for-rent/thailand))
4. **Area-naming convention**: same khet/khwaeng structure as DDproperty.
5. **Schema mismatches**: same townhouse/villa property-type gap as DDproperty.
   Multi-currency listings mean `price.currency` needs to record whichever
   currency was actually showing at capture time, not assume THB.
6. **robots.txt / ToS posture**: robots.txt (https://www.fazwaz.com/robots.txt,
   HTTP 200, readable directly) blanket-disallows several SEO/scraping bots by
   name (AhrefsBot, MJ12bot, BLEXBot, SemrushBot, rogerbot, proximic, YakazBot)
   but for `User-agent: *` only disallows `/api/` and `/graphql` — on paper this
   reads as fairly open for a single human-directed page fetch, which makes the
   live Cloudflare challenge the more important signal in practice.
7. **Browser-driven fetch re-test (2026-08-26): Works via browser.** No challenge
   was encountered at all — neither the rent-listings search page nor an
   individual listing (a studio condo at Quintara MHy'ZEN Phrom Phong, Bangkok)
   triggered Cloudflare, despite the plain-fetch pass finding a 403 challenge on
   the homepage. Listing page rendered full content: price, size, floor,
   furnishing, project details, amenities, description.

### Dot Property Thailand (dotproperty.co.th)
1. **Homepage**: https://www.dotproperty.co.th/ — same Dot Property Group brand
   already used for the Philippines (`dotproperty.com.ph`), operating a separate
   country site. Also now owns Hipflat.com (acquired 2020), which still runs as
   a separate branded site within the same group.
   ([Dot Property acquires Hipflat](https://www.onlinemarketplaces.com/articles/thai-portal-hipflat-acquired-by-dot-property/))
2. **Fetchability**: likely fetchable. Returns HTTP 200 with a full server-rendered
   page (~744K characters of visible text/markup, real Thai-language listing
   content present), tested 2026-08-26. `server: cloudflare` present as CDN only —
   no interactive challenge encountered, unlike DDproperty/FazWaz/Hipflat.
3. **Currency**: THB.
4. **Area-naming convention**: same khet/khwaeng structure as the other Thai
   platforms.
5. **Schema mismatches**: same townhouse/villa property-type gap.
6. **robots.txt / ToS posture**: robots.txt
   (https://www.dotproperty.co.th/robots.txt, HTTP 200, readable directly)
   blanket-disallows named SEO bots (AhrefsBot, MJ12bot, BLEXBot, YakazBot,
   proximic, rogerbot) but is otherwise scoped — disallows specific dashboard/
   enquiry/news/portal paths, not a blanket block. Worth noting: since
   `source.platform` in flathunter's schema could reasonably reuse
   `"dotproperty"` for this site too (same brand, different country) — see
   closing schema notes.

Note: **Hipflat.com** (same Dot Property Group as above) was checked and rejected
for the top-3 pick — it returns the same Cloudflare interactive-challenge
signature as DDproperty and FazWaz, so it doesn't add a fetchability advantage
over the parent dotproperty.co.th domain.

## Germany

### ImmobilienScout24.de
1. **Homepage**: https://www.immobilienscout24.de/
2. **Fetchability**: likely needs a browser. A plain fetch of the homepage returns
   HTTP 401 with a bot-verification interstitial page (`<title>Ich bin kein
   Roboter - ImmobilienScout24</title>`, i.e. "I am not a robot"), served via
   CloudFront, tested 2026-08-26 — this is a bot-check gate on the homepage
   itself, not just on search/listing pages.
3. **Currency**: EUR.
4. **Area-naming convention**: ImmobilienScout24's own Berlin search pages show a
   genuine two-level hierarchy below city: Bezirk (borough, e.g. Neukölln,
   Mitte, Charlottenburg-Wilmersdorf) → Stadtteil/Ortsteil (e.g. Wilmersdorf
   within Charlottenburg-Wilmersdorf), with a further informal "Stadtquartiere"
   (city-quarter) layer in some cases (e.g. Boxhagener Kiez, Schillerkiez).
   ([Neukölln search](https://www.immobilienscout24.de/Suche/de/berlin/berlin/neukoelln/immobilien),
   [Mitte Ortsteil page](https://www.immobilienscout24.de/wohnen/berlin,berlin,mitte-mitte/immobilien.html))
   This doesn't fit flathunter's flat `city` → `neighborhood` model cleanly for
   large cities like Berlin — Bezirk is the closer match to "neighborhood" as
   currently used (a bigger, official administrative unit), while Stadtteil/Kiez
   is finer-grained and closer to the PH precedent of "Legazpi Village."
5. **Schema mismatches**: German listings split rent into **Kaltmiete** (cold/base
   rent, excluding utilities) and **Warmmiete** (Kaltmiete + Nebenkosten/ancillary
   costs) — flathunter's single `price.amount` needs a decision about which
   figure to capture (Kaltmiete is the legally meaningful one for deposit
   calculations). Deposit (Kaution) is legally capped at 3× Kaltmiete, payable in
   up to 3 monthly installments — fits `payment_terms.deposit_months` reasonably
   well as long as it's clear the cap applies to Kaltmiete, not Warmmiete.
   ([Kaltmiete/Warmmiete](https://domily.app/blog/warmmiete-vs-kaltmiete-german-rent),
   [Kaution cap](https://domily.app/blog/how-rental-deposit-works-in-germany))
   Furnished listings are a distinct, smaller market segment in Germany
   (unfurnished is the cultural default, sometimes without even a fitted kitchen)
   — `furnishing` enum still applies, but expect `unfurnished` far more often
   than in the PH data so far.
6. **robots.txt / ToS posture**: robots.txt
   (https://www.immobilienscout24.de/robots.txt, HTTP 200) is mostly open — a
   short disallow list for internal/account paths, `Allow: /` at the end. The
   ToS is the stronger signal: the consumer AGB explicitly forbids "automated
   queries through scripts, bots, crawlers, etc., bypassing the search mask ...
   (in particular data mining and data extraction)" and restricts use of any
   retrieved data to on-screen display/printing only, no storage or reuse.
   ([Nutzungs-AGB](https://www.immobilienscout24.de/agb/nutzungsagb.html),
   [Verbraucher-AGB](https://www.immobilienscout24.de/agb/verbraucher-agb.html))
7. **Browser-driven fetch re-test (2026-08-26): Works via browser.** The "Ich bin
   kein Roboter" bot-check interstitial auto-resolved within ~5s and the homepage
   rendered fully; a Berlin rental search and an individual listing (a 2-room
   Friedrichshain flat, €1,338 Kaltmiete / €1,508 Warmmiete) both loaded with no
   further challenge — full content rendered including the Kaltmiete/Warmmiete
   split, deposit amount, floor plan details, and description.

### Immowelt.de
1. **Homepage**: https://www.immowelt.de/
2. **Fetchability**: likely needs a browser. Returns HTTP 403 with a
   "Please enable JS and disable any ad blocker" interstitial (CloudFront,
   `dd={'rt':'c', ...}` cookie-check script pattern — the same interstitial
   signature seen on several other DataDome/Cloudflare-protected sites in this
   survey), tested 2026-08-26.
3. **Currency**: EUR.
4. **Area-naming convention**: same Bezirk/Stadtteil pattern as ImmobilienScout24
   (not independently re-verified on Immowelt's own pages in this pass, but it's
   the same German administrative geography).
5. **Schema mismatches**: same Kaltmiete/Warmmiete split as above.
6. **robots.txt / ToS posture**: robots.txt (https://www.immowelt.de/robots.txt,
   HTTP 200) is readable and mostly scoped to internal paths (`/1_Components/`,
   `/bin/`, `/_Scripts/`, listing-price-data endpoints) rather than a blanket
   block — same pattern as ImmobilienScout24 (permissive-looking robots.txt,
   blocked in practice by a live JS/bot-check wall).
7. **Browser-driven fetch re-test (2026-08-26): Works via browser.** No
   "enable JS / disable ad blocker" interstitial was encountered at all — the
   homepage, a Berlin rental search, and an individual listing (a 3-room
   Friedrichsfelde flat, €1,649 Kaltmiete / €1,999 Warmmiete) all loaded directly
   with full content: price breakdown, deposit, room count, detailed description,
   application-document checklist.

### WG-Gesucht.de
1. **Homepage**: https://www.wg-gesucht.de/
2. **Fetchability**: likely fetchable. Returns HTTP 200 with a full server-rendered
   page (`server: Apache`, ~30K characters of visible text, page `<title>`
   "Die Nr.1 für WG-Zimmer..."), tested 2026-08-26. No Cloudflare/DataDome-style
   challenge encountered.
3. **Currency**: EUR.
4. **Area-naming convention**: Stadtteil-level naming, same German geography as
   above; WG-Gesucht is specifically strong for room-in-shared-flat (WG) listings
   and mid-length lets, which is a distinct rental product from a whole-apartment
   Kaltmiete listing (worth noting since it's popular specifically with
   expats/students, i.e. flathunter's likely DE use case).
5. **Schema mismatches**: WG (shared-flat room) listings are a genuinely different
   product from `condo|apartment|house|studio` — renting one room within an
   apartment, with shared kitchen/bathroom, doesn't fit any of the four cleanly;
   closest is `studio` but that's inaccurate (a WG room is not self-contained).
   Worth a dedicated property type if WG-Gesucht is actually used.
6. **robots.txt / ToS posture**: robots.txt
   (https://www.wg-gesucht.de/robots.txt, HTTP 200) blocks a handful of named
   bots (psbot, trovitBot, cityreview, DataForSeoBot, rogerbot, dotbot) but has
   no blanket disallow for general `*` crawling. No specific anti-scraping ToS
   clause was located in this pass (general legal commentary on German scraping
   case law was found, but nothing WG-Gesucht-specific — flagging as not found
   rather than assuming either way).

Note: **Kleinanzeigen.de** (formerly eBay Kleinanzeigen, a very popular general
classifieds site with a large rental section) was checked and rejected for the
top-3 pick — a plain fetch of its robots.txt returned an explicit IP-range block
message ("this IP range was temporarily excluded... due to repeated unsafe access
attempts"), the strongest active anti-bot signal seen in this whole survey. Worth
a live re-test later since rate-limit blocks can be transient, but not assumed
fetchable on this evidence.

## Spain

### Idealista.com
Already used once for a PH-project test capture per `CLAUDE.md`'s "Non-PH real
estate platforms" note, which found it "loads fine via a browser-driven fetch, no
block encountered." That matches what this pass found for a *plain* fetch:
1. **Homepage**: https://www.idealista.com/
2. **Fetchability**: likely needs a browser. Plain fetch of the homepage returns
   HTTP 403 with `server: DataDome` and a "Please enable JS and disable any ad
   blocker" interstitial, tested 2026-08-26 — consistent with the existing
   project note that a browser-driven fetch was needed.
3. **Currency**: EUR.
4. **Area-naming convention**: barrio (neighborhood) / zona (zone) — Idealista's
   own search supports filtering and map-drawing at this level.
5. **Schema mismatches**: already noted in `CLAUDE.md` — some Spanish amenity
   concepts (e.g. "armarios empotrados"/built-in wardrobes) don't have a clean
   canonical-vocabulary match yet. Additionally (new in this pass): Spain's legal
   deposit structure is two-part — a legal `fianza` capped at 1 month's rent, plus
   up to 2 additional months of `garantía adicional` that must be documented
   separately — a single `deposit_months` number can't represent both parts
   distinctly.
   ([fianza vs garantía adicional](https://www.idealista.com/en/news/property-for-rent-in-spain/2021/03/29/9126-rental-deposits-in-spain-1-or-2-months))
6. **robots.txt / ToS posture**: robots.txt
   (https://www.idealista.com/robots.txt, HTTP 200, readable directly) is large
   and scoped (specific query-param and path disallows), not a blanket block.
   The ToS is explicit and strong: it prohibits accessing, monitoring, or
   copying site content via "any robot, spider, scraper or other automated or
   manual process" without written permission, prohibits deep-linking and
   reselling content, and separately prohibits bypassing "robot exclusion
   headers ... or any other measures used to prevent or limit access."
   ([General Terms and Conditions](https://www.idealista.com/ayuda/articulos/legal-statement/?lang=en))

### Fotocasa.es
1. **Homepage**: https://www.fotocasa.es/ (redirects to `/es/`)
2. **Fetchability**: likely fetchable. The root URL 302-redirects to
   `https://www.fotocasa.es/es/`, which then returns HTTP 200 with a full
   server-rendered page (~379K characters of visible text), tested 2026-08-26 —
   no DataDome/Cloudflare challenge encountered on either hop.
3. **Currency**: EUR.
4. **Area-naming convention**: same barrio/zona pattern as Idealista.
5. **Schema mismatches**: same fianza/garantía-adicional deposit split as
   Idealista (a Spain-market issue, not platform-specific).
6. **robots.txt / ToS posture**: robots.txt
   (https://www.fotocasa.es/robots.txt, HTTP 200) explicitly allows several ad/
   search bots (Mediapartners-Google, AdsBot-Google, TwitterBot) and blocks a
   long list of specific other bots and scraping tools by name (HTTrack, Jyxo,
   etc.) — a scoped, tool-specific blocklist rather than a blanket disallow for
   unnamed agents.

### pisos.com
1. **Homepage**: https://www.pisos.com/
2. **Fetchability**: likely fetchable. Returns HTTP 200 with a full server-rendered
   page (`server: Microsoft-IIS/10.0`, ~13.5K characters of visible text), tested
   2026-08-26. No challenge encountered.
3. **Currency**: EUR.
4. **Area-naming convention**: same barrio/zona pattern.
5. **Schema mismatches**: same Spain-market deposit-split issue as above.
6. **robots.txt / ToS posture**: robots.txt (https://www.pisos.com/robots.txt,
   HTTP 200) disallows specific paths (search results with empty query, `.aspx`
   endpoints, non-Spanish-language mirrors, a seasonal-rental section) — scoped,
   not a blanket block.

Note: **Habitaclia.com** (same corporate family as Fotocasa, both under Adevinta —
shared CDN assets confirm this: both serve fonts from `frtassets.fotocasa.es`) was
also checked and looks similarly fetchable (HTTP 200, real content, no challenge
encountered) — a reasonable substitute for or addition to Fotocasa if a 4th Spain
platform is ever wanted.

## France

### SeLoger.com
1. **Homepage**: https://www.seloger.com/
2. **Fetchability**: likely needs a browser. Plain fetch returns HTTP 403 with
   `server: CloudFront` and the same "Please enable JS and disable any ad
   blocker" DataDome-style interstitial seen on Idealista/Immowelt, tested
   2026-08-26.
3. **Currency**: EUR.
4. **Area-naming convention**: for Paris specifically, SeLoger organizes listings
   by arrondissement (1st–20th, each with its own postal code 75001–75020), with
   quartier (neighborhood) names appearing within listings/URLs at a finer level
   (e.g. Passy within the 16th, Quartier de la Sorbonne within the 5th).
   ([Paris 1er arrondissement search](https://www.seloger.com/recherche/location/immobilier/paris-75000/paris-1er-arrondissement-75001/ad09fr26))
   This is Paris-specific — other French cities don't have arrondissements and
   use quartier/commune naming directly, so the depth of the hierarchy varies by
   city within the same country, which flathunter's fixed two-level model doesn't
   currently accommodate.
5. **Schema mismatches**: French rentals are commonly listed with rent split as
   **loyer hors charges** (rent excluding charges) vs **charges comprises**
   (charges included) — `price.dues_included` (already in the schema, used for PH
   condo dues) is actually a fairly clean fit for this. Separately, **frais
   d'agence** (agency placement fees, typically split between landlord and
   tenant per the ALUR law, roughly 0.5–1 month's rent) has no home in
   `payment_terms` currently.
   ([hors charges / charges comprises](https://edito.seloger.com/conseils-d-experts/louer/quel-est-le-montant-des-frais-d-agence-pour-la-location-d-un-logement-article-18721.html))
   Also: French listings size units by **pièces** (main rooms, e.g. "T2" = 2
   main rooms) rather than bedroom count directly — a T2 is typically 1 bedroom +
   1 living room, but the mapping isn't always 1:1 and needs care during
   extraction rather than a blind pièces→bedrooms copy.
6. **robots.txt / ToS posture**: robots.txt (https://www.seloger.com/robots.txt,
   HTTP 200) is scoped (specific search/API/pricing-tool paths disallowed), not
   blanket. The CGU is explicit and has real enforcement history: it defines
   "data mining" broadly to include "any technique for extracting, collecting and
   automatically analyzing texts and data ... by any means (including robots and
   scraping)" and forbids it, including for AI-training purposes. SeLoger's
   corporate group won a court judgment (Versailles Court of Appeal) against
   Jinka, an app that had been scraping SeLoger-group listings, on
   counterfeiting/database-rights grounds.
   ([CGU](https://www.seloger.com/Conditions_Generales_d_Utilisation.html),
   [SeLoger v. Jinka ruling coverage](https://www.immomatin.com/portails/sites-professionnels/seloger-obtient-la-condamnation-de-jinka-pour-scraping-illicite-d-annonces-immobilieres.html))
7. **Browser-driven fetch re-test (2026-08-26): Works via browser** (with an
   important legal-risk caveat). No DataDome interstitial was encountered at all
   — the homepage, a Paris 1er rental search, and an individual native SeLoger
   listing (a furnished 3-room/2-bed Les Halles apartment, €7,159/month charges
   comprises) all loaded directly with full content. Technically capturable, but
   given the CGU's explicit "no automated data mining, including for AI-training"
   clause and the already-litigated Jinka precedent (counterfeiting/database-
   rights judgment against a scraping competitor), this is a *works-but-elevated-
   legal-risk* case, not a clean green light — separate from the pure
   fetchability question and worth a human call before adding SeLoger.

### LeBonCoin.fr
1. **Homepage**: https://www.leboncoin.fr/ (general classifieds, very large
   rental-housing section — arguably the highest-volume rental listing source in
   France by count of ads)
2. **Fetchability**: likely needs a browser. Plain fetch returns HTTP 403 with the
   same "Please enable JS and disable any ad blocker" interstitial pattern, tested
   2026-08-26.
3. **Currency**: EUR.
4. **Area-naming convention**: quartier-level naming, varies by city (arrondissement
   for Paris/Lyon/Marseille specifically, commune/quartier elsewhere).
5. **Schema mismatches**: same loyer-hors-charges/charges-comprises and
   pièces-vs-bedrooms notes as SeLoger — these are French-market conventions, not
   platform-specific.
6. **robots.txt / ToS posture**: this is the single strongest explicit statement
   found anywhere in this survey. robots.txt
   (https://www.leboncoin.fr/robots.txt, HTTP 200) opens with, verbatim:
   > "It's forbidden to use search robots or other automatic methods to access
   > Leboncoin.fr. Access is only permitted with special permission from
   > Leboncoin.fr."
   The CGU separately and explicitly forbids using "un robot d'exploration
   (spider), une application de recherche ou de récupération de site Internet, ou
   tout autre moyen permettant de récupérer ou d'indexer" any part of the site
   without prior written authorization, and separately forbids database
   extraction/reuse under French intellectual-property code articles L342-1/
   L342-2.
   ([CGU](https://static.communaute.leboncoin.info/cgu.html))
7. **Browser-driven fetch re-test (2026-08-26): Works via browser.** No
   interstitial was encountered — homepage, the `/c/locations` rental category
   page, and an individual listing (a 33m² Riom studio, €400/month charges
   comprises) all loaded directly with full content: price breakdown (loyer hors
   charges vs. charges), room/surface details, DPE/GES energy ratings,
   description, professional lister info. Same robots.txt/CGU caveat as noted
   above applies here even more strongly — this is the single most explicit
   "forbidden to use search robots" statement found anywhere in the whole survey.

### PAP.fr
1. **Homepage**: https://www.pap.fr/ ("Particulier à Particulier" — owner-direct
   listings, no agency, a distinct and popular niche in the French market)
2. **Fetchability**: likely needs a browser. Plain fetch returns HTTP 403 with
   Cloudflare's interactive challenge page (`cf-mitigated: challenge`), tested
   2026-08-26 — a different bot-protection vendor than SeLoger/LeBonCoin's
   DataDome-style wall, but still a live block.
3. **Currency**: EUR.
4. **Area-naming convention**: same quartier/arrondissement pattern as above.
5. **Schema mismatches**: PAP's whole value proposition is "no agency fees" —
   so the frais-d'agence gap noted under SeLoger doesn't apply here, but the
   hors-charges/pièces conventions still do.
6. **robots.txt / ToS posture**: robots.txt (https://www.pap.fr/robots.txt, HTTP
   200, readable independently of the homepage challenge) is large but consists
   mostly of sitemap declarations rather than broad disallow rules — no blanket
   block found in the file itself, though the live Cloudflare challenge on the
   homepage is the more decisive practical signal.
7. **Browser-driven fetch re-test (2026-08-26): Works via browser.** The
   Cloudflare challenge on the homepage auto-resolved within ~6s; a Paris rental
   search and an individual listing (a furnished 2-room Paris 7e apartment near
   the Eiffel Tower, €2,500/month charges comprises) both loaded directly with no
   further challenge — full content rendered: price breakdown, deposit, room
   count, rent-control (encadrement des loyers) fields, full description.

Note: **Logic-Immo.com** was also checked and rejected for the top-3 — same
DataDome-style "Please enable JS" 403 block as SeLoger/LeBonCoin, no
fetchability advantage over the three picked above.

## Australia

### realestate.com.au
1. **Homepage**: https://www.realestate.com.au/ (REA Group — Australia's largest
   property portal)
2. **Fetchability**: likely needs a browser. Plain fetch returns HTTP 429 with a
   page containing `KPSDK` initialization JavaScript — the signature of Kasada,
   an Australian bot-mitigation vendor — tested 2026-08-26. This matches REA
   Group's own public statements: they've specifically deployed Kasada
   technology to block scraping and credential-stuffing attacks, and REA Group
   has litigated against at least one competitor (Domain) over data scraping.
   ([REA Group deploys Kasada](https://www.onlinemarketplaces.com/articles/rea-groups-moves-to-stop-content-scraping-and-credential-stuffing-with-new-tech/),
   [REA Group sues Domain over scraping](https://www.onlinemarketplaces.com/articles/rea-group-sues-domain-for-data-scraping-and-copyright-infringement/))
3. **Currency**: AUD.
4. **Area-naming convention**: **suburb** — this is the one country/platform in
   this whole survey where the naming convention maps cleanly onto flathunter's
   existing two-level `city`/`neighborhood` model. A suburb (e.g. "Bondi",
   "Fitzroy") is specific, named, and always more granular than the city it sits
   within — exactly flathunter's existing neighborhood definition, no schema
   change needed for this dimension.
5. **Schema mismatches — the significant one for Australia**: Australian rentals
   are near-universally advertised **per week**, not per month (e.g. "$650 pw") —
   this doesn't fit `price.period` (currently `month|night`) at all and would be
   the single most consequential schema gap found in this whole survey if
   Australia is added.
   ([weekly rent as the standard](https://www.sydneymovingguide.com/real-estate/rental-prices/))
   Bonds (security deposits) are also set in **weeks** of rent, standardized at 4
   weeks in most states/territories (up to 6 weeks for higher rents in some
   states) — `payment_terms.deposit_months` doesn't fit a weeks-denominated bond
   either.
   ([4-week bond standard across states](https://selectra.com.au/moving/renting/rental-bond))
   Property types commonly include "unit" (roughly = apartment, but a distinct
   local term) and "townhouse"/"terrace" (neither in the current enum).
   Furnishing skew is also opposite the PH default — Australian long-term rentals
   are overwhelmingly unfurnished by market norm, unlike PH condos which are
   often furnished.
6. **robots.txt / ToS posture**: robots.txt
   (https://www.realestate.com.au/robots.txt, HTTP 200, readable directly) opens
   with an explicit anti-scraping statement, quoted verbatim:
   > "In accessing or using any REA Group Website you agree that you will not
   > use any automated device, software, process or means to access, retrieve,
   > scrape, or index any REA Group Website or any content on any REA Group
   > Website."
   This is unusual — most sites keep this kind of language in the ToS only, not
   in robots.txt itself.
7. **Browser-driven fetch re-test (2026-08-26): Uncertain — could not be tested.**
   The browser-automation tool used for this pass (Claude Browser) refuses to
   open any `realestate.com.au` URL at all, returning "blocked by policy and
   cannot be opened in the Browser pane" — a restriction in the tooling itself,
   not a finding about the site's own Kasada bot-mitigation. This needs a re-test
   with a different browser-automation setup before a real verdict can be given.
   Worth flagging: realestate.com.au and Flatmates.com.au (below) share the same
   Kasada vendor, and Flatmates failed outright even via a real browser — so
   realestate.com.au should not be assumed to pass by default.

### Domain.com.au
1. **Homepage**: https://www.domain.com.au/ (Australia's #2 major portal)
2. **Fetchability**: likely needs a browser. Plain fetch of both the homepage and
   robots.txt returned HTTP 403 "Access Denied" pages served by Akamai
   (`server: AkamaiGHost`), tested 2026-08-26 — a different vendor from REA
   Group's Kasada, but an equally hard block on a plain fetch.
3. **Currency**: AUD.
4. **Area-naming convention**: suburb, same as realestate.com.au — clean fit.
5. **Schema mismatches**: same per-week pricing and 4-week-bond conventions as
   realestate.com.au (an Australia-market issue, not platform-specific), plus the
   same unit/townhouse property-type gaps.
6. **robots.txt / ToS posture**: robots.txt itself could not be read (blocked by
   the same Akamai wall as the homepage) — no text available from this pass, but
   the practical block is total for a plain fetch regardless of ToS wording.
7. **Browser-driven fetch re-test (2026-08-26): Works via browser.** No Akamai
   "Access Denied" page was encountered at all — the homepage, a Sydney rental
   search, and an individual listing (a furnished 1BR apartment at 129 Harrington
   St, The Rocks, Sydney, $1,075/week) all loaded directly with full content:
   price (weekly), bed/bath/parking counts, availability date, description,
   nearby-schools section.

### Flatmates.com.au
1. **Homepage**: https://flatmates.com.au/ (share-housing/room-rental specialist —
   directly relevant to a digital-nomad or single-room use case, similar in
   spirit to WG-Gesucht in Germany)
2. **Fetchability**: likely needs a browser. Plain fetch returned HTTP 429 with the
   same `KPSDK` (Kasada) initialization signature seen on realestate.com.au,
   tested 2026-08-26 — despite its robots.txt (readable independently) looking
   fairly open.
3. **Currency**: AUD.
4. **Area-naming convention**: suburb, same clean fit as the other two.
5. **Schema mismatches**: share-housing (a room within an occupied flat, not a
   whole unit) is a distinct product from any of `condo|apartment|house|studio`,
   same gap as WG-Gesucht in Germany. Per-week pricing applies here too.
6. **robots.txt / ToS posture**: robots.txt
   (https://flatmates.com.au/robots.txt, HTTP 200, readable directly) is short
   and mostly open — disallows a couple of internal webview/tracking paths, no
   blanket block or explicit anti-scraping statement found in the file itself.
   The live Kasada wall on the homepage is the real signal here, same conclusion
   as realestate.com.au despite the more permissive-looking robots.txt text.
7. **Browser-driven fetch re-test (2026-08-26): Hard-blocked (Lamudi-tier).** The
   homepage stayed a blank white page across 3 separate load/reload attempts and
   ~40s of total wait — never a single visible element. Network inspection showed
   why: repeated Kasada challenge-token requests (`ips.js?KP_UIDz=...&x-kpsdk-im=
   ...`) firing every few seconds while the actual page request kept returning
   HTTP 429 Too Many Requests each time, an infinite client-side challenge retry
   loop with no successful resolution. This is the one platform in this whole
   re-test pass that did not yield to a real browser — same tier as Lamudi's
   site-wide Access Denied.

## Schema changes worth considering across the whole set

- **Add `price.period: "week"`.** Australia's entire long-term rental market
  quotes rent per week, not per month — this is the single highest-impact gap
  found. Without it, every Australian listing would need a lossy month↔week
  conversion baked into `price.amount` instead of recording what the source
  actually said.
- **Add a `price.period: "year"` option, or at least document how to handle it.**
  Indonesian kost/apartment listings routinely quote annual (tahunan) pricing as
  a first-class alternative to monthly — same "don't force a lossy conversion"
  argument as the week case above.
- **`payment_terms.deposit_months` doesn't fit every market.** Australia's bond is
  denominated in weeks, not months (typically 4 weeks). Spain's legal deposit is
  actually two separate figures (1-month `fianza` + up to 2 months
  `garantía adicional`) that get conflated if forced into one number. Worth
  deciding whether to widen the field's unit, add a second field, or just accept
  the current field is a PH-shaped simplification and note the loss explicitly
  per-listing in `user.notes` when it doesn't fit.
- **`neighborhood` as a strict single level doesn't hold up outside the
  Philippines.** Vietnam (district → ward), Indonesia (kecamatan → kelurahan),
  Thailand (khet → khwaeng), and Germany (Bezirk → Stadtteil/Kiez) all have a
  genuine two-level administrative hierarchy below city, and France's
  arrondissement/quartier depth varies by city within the same country (Paris
  has arrondissements, most French cities don't). Australia is the one clean
  exception — suburb already behaves exactly like flathunter's `neighborhood`.
  Worth considering an optional third sub-area field, or documenting a clear
  per-country rule for which level "neighborhood" should mean (probably: the
  level locals actually use when describing where they live, which is usually
  the coarser of the two — district/Bezirk/kecamatan — not the finer one).
- **`property_type` enum (`condo|apartment|house|studio`) misses a few
  recurring non-PH categories**: Indonesia's "kost" (boarding-house room,
  shared facilities — the most distinct gap found), Germany/Australia's
  "WG room"/"share room" (a room within an occupied flat), and Thailand's
  "townhouse"/"pool villa" (partially covered by `house` but lossy). Worth
  deciding whether these get dedicated enum values or stay out of scope until a
  country using them is actually added.
- **German pricing needs a Kaltmiete/Warmmiete decision.** `price.amount` as a
  single number is ambiguous in Germany specifically — worth documenting during
  capture that Kaltmiete (base rent) is the one to record, with Nebenkosten
  (ancillary costs) noted separately if the schema doesn't have a field for it,
  same pattern as `price.dues_included` already does for PH condo dues.
- **`payment_terms` has no field for agency/placement fees.** France's
  frais d'agence (commonly 0.5–1 month's rent, split between landlord/tenant)
  has nowhere to go currently. Low priority unless France is actually adopted.
- **Fetchability is overwhelmingly "needs a browser" outside Vietnam/Indonesia's
  more open sites.** Of the 21 non-PH platforms checked, roughly two-thirds
  returned a live bot-detection wall (Cloudflare challenge, DataDome, Akamai, or
  Kasada) on a plain fetch even where robots.txt itself looked permissive —
  confirming this app's existing "browser-driven fetch as the fallback, never
  assume plain fetch works" posture (ADR 0002) is the right default to carry
  into every new country, not just an edge case inherited from Lamudi/Rentpad.
