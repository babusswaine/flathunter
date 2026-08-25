# Capture happens in a Claude Code session, not via an in-app scraper

A Listing is captured by pasting its URL into a Claude Code session, not by pasting it into a form inside the app. Claude fetches and reads the page, then runs `scripts/add-listing.mjs` to save it. The app itself has no fetch/scrape code and never will for v1.

This was a deliberate choice, not a missing feature. The alternative — an in-app "paste a link" box backed by a server-side fetch — was considered explicitly and rejected: real estate platforms actively block automated fetching (confirmed by testing: Lamudi blocks everything outright, Rentpad's behavior changes day to day), and Facebook listings specifically can only be read using the owner's own logged-in browser session, which a server-side scraper has no access to. Building a scraper would also make this a different, riskier kind of product — one that could plausibly be turned into a public multi-user scraping service, which conflicts with this being a personal, self-use-only tool (see the "Constraints to respect" section of the project spec).

The trade-off: capture only works while a Claude Code session is doing it. This is not a tool that could be handed to someone else to use on their own without them also running Claude Code.
