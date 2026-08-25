"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteListingRequest, patchListing } from "@/lib/api-client";
import type { Listing, ListingStatus } from "@/lib/types";

export function useListing(initial: Listing) {
  const router = useRouter();
  const [listing, setListing] = useState(initial);

  function updateFavorite(favorite: boolean) {
    setListing((l) => ({ ...l, user: { ...l.user, favorite } }));
    patchListing(listing.id, { favorite });
  }

  function updateStatus(status: ListingStatus) {
    setListing((l) => ({ ...l, user: { ...l.user, status } }));
    patchListing(listing.id, { status });
  }

  async function saveNotes(notes: string) {
    const trimmed = notes.trim();
    await patchListing(listing.id, { notes: trimmed === "" ? null : trimmed });
  }

  async function remove() {
    await deleteListingRequest(listing.id);
    router.push("/");
  }

  return { listing, updateFavorite, updateStatus, saveNotes, remove };
}
