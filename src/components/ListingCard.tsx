import Link from "next/link";
import { PlatformBadge } from "./PlatformBadge";
import { StatusSelect } from "./StatusSelect";
import { FavoriteToggle } from "./FavoriteToggle";
import type { Listing, ListingStatus } from "@/lib/types";

export function ListingCard({
  listing,
  onFavoriteChange,
  onStatusChange,
}: {
  listing: Listing;
  onFavoriteChange: (id: string, favorite: boolean) => void;
  onStatusChange: (id: string, status: ListingStatus) => void;
}) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium leading-tight">{listing.title}</h3>
        <FavoriteToggle
          favorite={listing.user.favorite}
          onChange={(next) => onFavoriteChange(listing.id, next)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PlatformBadge platform={listing.source.platform} />
        <StatusSelect
          value={listing.user.status}
          onChange={(next) => onStatusChange(listing.id, next)}
        />
      </div>

      <div className="text-sm text-zinc-500 dark:text-zinc-500">
        {listing.location.neighborhood ? `${listing.location.neighborhood}, ` : ""}
        {listing.location.city}
        {listing.location.building_name ? ` — ${listing.location.building_name}` : ""}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          ₱{listing.price.amount.toLocaleString()}/{listing.price.period}
        </span>
        <span>
          {listing.bedrooms}bd / {listing.bathrooms}ba
        </span>
        {listing.size_sqm !== null && <span>{listing.size_sqm} m²</span>}
        {listing.price_per_sqm !== null && (
          <span>₱{Math.round(listing.price_per_sqm).toLocaleString()}/m²</span>
        )}
      </div>
    </Link>
  );
}
