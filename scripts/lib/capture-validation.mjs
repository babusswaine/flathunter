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

export const STATUSES = [
  "new",
  "interested",
  "contacted",
  "toured",
  "rejected",
  "extraction_failed",
];

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
