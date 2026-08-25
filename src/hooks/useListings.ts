"use client";

import { useState } from "react";
import { patchListing } from "@/lib/api-client";
import type { Listing, ListingStatus } from "@/lib/types";

export function useListings(initialListings: Listing[]) {
  const [listings, setListings] = useState(initialListings);

  function updateFavorite(id: string, favorite: boolean) {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, user: { ...l.user, favorite } } : l)),
    );
    patchListing(id, { favorite });
  }

  function updateStatus(id: string, status: ListingStatus) {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, user: { ...l.user, status } } : l)),
    );
    patchListing(id, { status });
  }

  return { listings, updateFavorite, updateStatus };
}
