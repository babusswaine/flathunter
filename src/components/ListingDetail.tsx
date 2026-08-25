"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PlatformMark } from "./PlatformMark";
import { StatusSelect } from "./StatusSelect";
import { FavoriteToggle } from "./FavoriteToggle";
import { BedIcons, FeatureIcons } from "./ListingFeatures";
import { Field } from "./Field";
import { useListing } from "@/hooks/useListing";
import { amenityLabel } from "@/lib/amenities";
import { formatCurrency } from "@/lib/format";
import { ICONIFIED_AMENITY_TAGS } from "@/lib/listing-features";
import type { Listing } from "@/lib/types";

export function ListingDetail({ listing: initial }: { listing: Listing }) {
  const { listing, updateFavorite, updateStatus, saveNotes, remove } = useListing(initial);
  const [notes, setNotes] = useState(initial.user.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  async function handleSaveNotes() {
    setSavingNotes(true);
    await saveNotes(notes);
    setSavingNotes(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this listing? This can't be undone.")) return;
    await remove();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-1 text-sm text-zinc-500 hover:text-foreground dark:text-zinc-400"
      >
        ← All listings
      </Link>

      {listing.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {listing.photos.map((src, i) => (
            <div
              key={src}
              className="relative aspect-video overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900"
            >
              <Image
                src={src}
                alt={`${listing.title} photo ${i + 1}`}
                fill
                sizes="(min-width: 672px) 203px, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-semibold leading-tight">{listing.title}</h1>
        <FavoriteToggle favorite={listing.user.favorite} onChange={updateFavorite} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PlatformMark platform={listing.source.platform} />
        <StatusSelect value={listing.user.status} onChange={updateStatus} />
        <a
          href={listing.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          View original listing
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 p-4 sm:grid-cols-3 dark:border-zinc-800">
        <Field
          label="Location"
          value={`${listing.location.neighborhood ? listing.location.neighborhood + ", " : ""}${listing.location.city}`}
        />
        <Field label="Building" value={listing.location.building_name} />
        <Field label="Street" value={listing.location.street} />
        <Field label="Property type" value={listing.property_type} />
        <Field label="Bedrooms" value={<BedIcons count={listing.bedrooms} />} />
        <Field label="Bathrooms" value={listing.bathrooms} />
        <Field label="Size" value={listing.size_sqm !== null ? `${listing.size_sqm} m²` : null} />
        <Field label="Floor" value={listing.floor_level} />
        <Field label="Furnishing" value={listing.furnishing.replace(/_/g, " ")} />
        <Field
          label="Price"
          value={`${formatCurrency(listing.price.amount, listing.price.currency)}/${listing.price.period}${listing.price.dues_included ? " (dues incl.)" : ""}`}
        />
        <Field
          label="Price / m²"
          value={
            listing.price_per_sqm !== null
              ? formatCurrency(Math.round(listing.price_per_sqm), listing.price.currency)
              : null
          }
        />
        <Field
          label="Deposit"
          value={
            listing.payment_terms.deposit_months !== null
              ? `${listing.payment_terms.deposit_months} mo`
              : null
          }
        />
        <Field
          label="Advance"
          value={
            listing.payment_terms.advance_months !== null
              ? `${listing.payment_terms.advance_months} mo`
              : null
          }
        />
        <Field
          label="Min. lease"
          value={
            listing.payment_terms.minimum_lease_months !== null
              ? `${listing.payment_terms.minimum_lease_months} mo`
              : null
          }
        />
        <Field
          label="Pets"
          value={listing.rules.pets_allowed === false ? "Not allowed" : null}
        />
        <Field
          label="Contact"
          value={
            listing.contact.name
              ? `${listing.contact.name}${listing.contact.verified ? " ✓" : ""}`
              : null
          }
        />
      </div>

      <FeatureIcons listing={listing} labels />

      {listing.amenities.filter((tag) => !ICONIFIED_AMENITY_TAGS.has(tag)).length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-zinc-500">Amenities</span>
          <div className="flex flex-wrap gap-1.5">
            {listing.amenities
              .filter((tag) => !ICONIFIED_AMENITY_TAGS.has(tag))
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  {amenityLabel(tag)}
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          placeholder="Your own notes about this place..."
        />
        <button
          type="button"
          onClick={handleSaveNotes}
          disabled={savingNotes}
          className="self-start rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {savingNotes ? "Saving..." : "Save notes"}
        </button>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        className="self-start text-sm text-red-600 hover:underline dark:text-red-400"
      >
        Delete listing
      </button>
    </div>
  );
}
