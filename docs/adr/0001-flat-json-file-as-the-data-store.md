# Flat JSON file as the data store, not a database

Flat Hunter is a single-person tool with, realistically, a few dozen to a few hundred Listings ever — not a multi-user product needing concurrent writes or query performance at scale. `data/listings.json` is read and rewritten whole on every change (a new capture, a favorite toggle, a status edit). We chose this over a real database (SQLite, Postgres, etc.) because there's no scaling concern to justify the setup cost, and a plain JSON file is something the owner can open and read themselves without any tooling.

The trade-off this accepts: no concurrent-write safety, and every write reads-and-rewrites the entire file. Fine at this scale; would need revisiting if this ever became a multi-user product (see `docs/adr/0002-conversational-capture-not-a-scraper.md` for why that's explicitly out of scope for now).
