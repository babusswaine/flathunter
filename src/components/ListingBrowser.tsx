"use client";

import { useMemo, useState } from "react";
import { CityCard } from "./CityCard";
import { ListingCard } from "./ListingCard";
import { useListings } from "@/hooks/useListings";
import { getCityLandmark } from "@/lib/city-landmarks";
import {
  cityOptions as computeCityOptions,
  groupByCityAndNeighborhood,
  type SortDir,
  type SortField,
} from "@/lib/listing-grouping";
import type { Listing } from "@/lib/types";

const SORT_LABELS: Record<SortField, string> = {
  price: "Price",
  size_sqm: "Size",
  price_per_sqm: "Price / m²",
};

export function ListingBrowser({ initialListings }: { initialListings: Listing[] }) {
  const { listings, updateFavorite, updateStatus } = useListings(initialListings);
  const [city, setCity] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const cityOptions = useMemo(() => computeCityOptions(listings), [listings]);

  const groups = useMemo(() => {
    const scoped = city === "all" ? listings : listings.filter((l) => l.location.city === city);
    return groupByCityAndNeighborhood(scoped, sortField, sortDir);
  }, [listings, city, sortField, sortDir]);

  if (listings.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
        <p className="text-lg font-medium">No listings yet</p>
        <p className="max-w-sm text-sm text-zinc-500">
          Paste a listing URL from DotProperty, Rentpad, or Facebook into this Claude
          Code session and it&apos;ll be extracted and added here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <CityCard
          label="All cities"
          count={listings.length}
          image="/cities/all-cities.jpg"
          selected={city === "all"}
          onClick={() => setCity("all")}
        />
        {cityOptions.map(([name, { count, country }]) => {
          const landmark = getCityLandmark(name);
          return (
            <CityCard
              key={name}
              label={name}
              count={count}
              country={country}
              image={landmark?.image ?? null}
              attribution={landmark?.attribution}
              selected={city === name}
              onClick={() => setCity(name)}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
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

      <div className="flex flex-col gap-8">
        {groups.map((g) => (
          <div key={g.city} className="flex flex-col gap-5">
            {city === "all" && (
              <h2 className="border-b border-zinc-200 pb-2 text-lg font-semibold dark:border-zinc-800">
                {g.city}
              </h2>
            )}
            {g.neighborhoods.map((n) => (
              <div key={n.neighborhood} className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {n.neighborhood} ({n.listings.length})
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {n.listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onFavoriteChange={updateFavorite}
                      onStatusChange={updateStatus}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
