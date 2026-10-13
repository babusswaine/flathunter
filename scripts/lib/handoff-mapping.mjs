// Maps a listing from the concept-brainstorm handoff format (the 2026-10-14
// listings.json: price.monthly, size.sqm, amenities.balcony, contact.platform,
// criteria_match, ...) onto the app's Listing schema. Unknowns stay null —
// nothing is guessed, and nothing is labelled: the handoff's own status tag,
// duplicate hint, agent ref, and raw deposit terms are kept as plain-text notes.
import { PLATFORMS } from "./capture-validation.mjs";

const FURNISHING_MAP = {
  fully: "fully_furnished",
  semi: "semi_furnished",
  unfurnished: "unfurnished",
};

function monthsBefore(text, word) {
  const match = text.match(new RegExp(`(\\d+)\\s*mo(?:nths?)?\\.?\\s*${word}`, "i"));
  return match ? Number(match[1]) : null;
}

export function parseTerms(text) {
  if (!text) return { advance_months: null, deposit_months: null, minimum_lease_months: null };
  const years = text.match(/(\d+)\s*-?\s*yr/i);
  return {
    advance_months: monthsBefore(text, "advance"),
    deposit_months: monthsBefore(text, "deposit"),
    minimum_lease_months: years ? Number(years[1]) * 12 : null,
  };
}

export function mapHandoffListing(h) {
  const platform = h.contact.platform.toLowerCase();
  if (!PLATFORMS.includes(platform))
    throw new Error(`${h.id}: unknown platform "${h.contact.platform}"`);

  const sqm = h.size.sqm ?? null;
  const amount = h.price.monthly;
  const place = h.location.building ? `in ${h.location.building}` : `on ${h.location.address}`;

  const amenities = [];
  if (h.amenities.parking) amenities.push("parking_slot");
  if (h.amenities.wifi_included) amenities.push("wifi_included");

  const notes = [
    h.user.notes,
    `Handoff tag: ${h.user.status}`,
    h.possible_duplicate_of && `Possible duplicate of ${h.possible_duplicate_of}`,
    h.price.negotiable && "Negotiable",
    h.contact.ref && `Agent ref: ${h.contact.ref}`,
    h.price.deposit_terms && `Terms: ${h.price.deposit_terms}`,
  ].filter(Boolean);

  return {
    id: h.id,
    source: {
      platform,
      url: h.contact.url,
      captured_at: `${h.contact.date_captured}T00:00:00.000Z`,
    },
    title: `${h.size.bedrooms}BR ${place}`,
    property_type: "condo",
    location: {
      country: h.location.country,
      city: h.location.city,
      neighborhood: h.location.neighborhood,
      building_name: h.location.building ?? null,
      street: h.location.address ?? null,
    },
    bedrooms: h.size.bedrooms,
    bathrooms: h.size.bathrooms,
    size_sqm: sqm,
    floor_level: h.size.floor != null ? String(h.size.floor) : null,
    furnishing: FURNISHING_MAP[h.amenities.furnished] ?? null,
    balcony: h.amenities.balcony ?? null,
    photos: [],
    price: {
      amount,
      currency: h.price.currency,
      period: "month",
      dues_included: h.price.dues_included ?? null,
    },
    price_per_sqm: sqm ? Math.round((amount / sqm) * 100) / 100 : null,
    payment_terms: parseTerms(h.price.deposit_terms),
    amenities,
    rules: { pets_allowed: h.amenities.pets ?? null },
    contact: { name: h.contact.agent ?? "", verified: false },
    user: {
      favorite: h.user.favorite ?? false,
      status: "new",
      notes: notes.join("\n"),
    },
  };
}
