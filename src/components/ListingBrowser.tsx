"use client";

import { useMemo, useState } from "react";
import { ListingCard } from "./ListingCard";
import type { Listing, ListingStatus } from "@/lib/types";

type SortField = "price" | "size_sqm" | "price_per_sqm";

const SORT_LABELS: Record<SortField, string> = {
  price: "Price",
  size_sqm: "Size",
  price_per_sqm: "Price / m²",
};

function cityKey(listing: Listing): string {
  return `${listing.location.country}|${listing.location.city}`;
}

function cityLabel(listing: Listing): string {
  return `${listing.location.city}, ${listing.location.country}`;
}

function sortValue(listing: Listing, field: SortField): number | null {
  if (field === "price") return listing.price.amount;
  if (field === "size_sqm") return listing.size_sqm;
  return listing.price_per_sqm;
}

async function patchListing(id: string, fields: Record<string, unknown>) {
  await fetch(`/api/listings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
}

export function ListingBrowser({ initialListings }: { initialListings: Listing[] }) {
  const [listings, setListings] = useState(initialListings);
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const cityOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const l of listings) map.set(cityKey(l), cityLabel(l));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [listings]);

  const visible = useMemo(() => {
    const filtered =
      cityFilter === "all" ? listings : listings.filter((l) => cityKey(l) === cityFilter);
    const sorted = [...filtered].sort((a, b) => {
      const av = sortValue(a, sortField);
      const bv = sortValue(b, sortField);
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return sorted;
  }, [listings, cityFilter, sortField, sortDir]);

  function handleFavoriteChange(id: string, favorite: boolean) {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, user: { ...l.user, favorite } } : l)),
    );
    patchListing(id, { favorite });
  }

  function handleStatusChange(id: string, status: ListingStatus) {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, user: { ...l.user, status } } : l)),
    );
    patchListing(id, { status });
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
        <p className="text-lg font-medium">No listings yet</p>
        <p className="max-w-sm text-sm text-zinc-500">
          Paste a listing URL from Lamudi, DotProperty, Rentpad, or Facebook into this
          Claude Code session and it&apos;ll be extracted and added here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          <option value="all">All cities ({listings.length})</option>
          {cityOptions.map(([key, label]) => (
            <option key={key} value={key}>
              {label} ({listings.filter((l) => cityKey(l) === key).length})
            </option>
          ))}
        </select>

        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          {(Object.keys(SORT_LABELS) as SortField[]).map((f) => (
            <option key={f} value={f}>
              Sort: {SORT_LABELS[f]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700"
        >
          {sortDir === "asc" ? "↑ Low to high" : "↓ High to low"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visible.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onFavoriteChange={handleFavoriteChange}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
