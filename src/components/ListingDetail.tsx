"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlatformBadge } from "./PlatformBadge";
import { StatusSelect } from "./StatusSelect";
import { FavoriteToggle } from "./FavoriteToggle";
import { amenityLabel } from "@/lib/amenities";
import type { Listing, ListingStatus } from "@/lib/types";

async function patchListing(id: string, fields: Record<string, unknown>) {
  await fetch(`/api/listings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

export function ListingDetail({ listing: initial }: { listing: Listing }) {
  const router = useRouter();
  const [listing, setListing] = useState(initial);
  const [notes, setNotes] = useState(initial.user.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  function handleFavoriteChange(favorite: boolean) {
    setListing((l) => ({ ...l, user: { ...l.user, favorite } }));
    patchListing(listing.id, { favorite });
  }

  function handleStatusChange(status: ListingStatus) {
    setListing((l) => ({ ...l, user: { ...l.user, status } }));
    patchListing(listing.id, { status });
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    await patchListing(listing.id, { notes: notes.trim() === "" ? null : notes });
    setSavingNotes(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this listing? This can't be undone.")) return;
    await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
    router.push("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-semibold leading-tight">{listing.title}</h1>
        <FavoriteToggle favorite={listing.user.favorite} onChange={handleFavoriteChange} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PlatformBadge platform={listing.source.platform} />
        <StatusSelect value={listing.user.status} onChange={handleStatusChange} />
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
        <Field label="Property type" value={listing.property_type} />
        <Field label="Bedrooms" value={listing.bedrooms} />
        <Field label="Bathrooms" value={listing.bathrooms} />
        <Field label="Size" value={listing.size_sqm !== null ? `${listing.size_sqm} m²` : null} />
        <Field label="Floor" value={listing.floor_level} />
        <Field label="Furnishing" value={listing.furnishing.replace(/_/g, " ")} />
        <Field
          label="Price"
          value={`₱${listing.price.amount.toLocaleString()}/${listing.price.period}${listing.price.dues_included ? " (dues incl.)" : ""}`}
        />
        <Field
          label="Price / m²"
          value={
            listing.price_per_sqm !== null
              ? `₱${Math.round(listing.price_per_sqm).toLocaleString()}`
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
          value={
            listing.rules.pets_allowed === null
              ? null
              : listing.rules.pets_allowed
                ? "Allowed"
                : "Not allowed"
          }
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

      {listing.amenities.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-zinc-500">Amenities</span>
          <div className="flex flex-wrap gap-1.5">
            {listing.amenities.map((tag) => (
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
