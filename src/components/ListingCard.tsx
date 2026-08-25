import Image from "next/image";
import Link from "next/link";
import { PlatformMark } from "./PlatformMark";
import { StatusSelect } from "./StatusSelect";
import { FavoriteToggle } from "./FavoriteToggle";
import { BedIcons, FeatureIcons } from "./ListingFeatures";
import { formatAddress, formatCurrency } from "@/lib/format";
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
      className="flex flex-col overflow-hidden rounded-lg border border-zinc-200 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
    >
      <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900">
        {listing.photos[0] ? (
          <Image
            src={listing.photos[0]}
            alt={listing.title}
            fill
            sizes="(min-width: 896px) 424px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-400 dark:text-zinc-600">
            No photo
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight">{listing.title}</h3>
          <FavoriteToggle
            favorite={listing.user.favorite}
            onChange={(next) => onFavoriteChange(listing.id, next)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PlatformMark platform={listing.source.platform} />
          <StatusSelect
            value={listing.user.status}
            onChange={(next) => onStatusChange(listing.id, next)}
          />
        </div>

        <div className="text-sm text-zinc-500 dark:text-zinc-500">
          {formatAddress(listing.location)}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            {formatCurrency(listing.price.amount, listing.price.currency)}/{listing.price.period}
          </span>
          <BedIcons count={listing.bedrooms} />
          <span>
            {listing.bathrooms}ba
          </span>
          {listing.size_sqm !== null && <span>{listing.size_sqm} m²</span>}
          {listing.price_per_sqm !== null && (
            <span>
              {formatCurrency(Math.round(listing.price_per_sqm), listing.price.currency)}/m²
            </span>
          )}
        </div>

        <FeatureIcons listing={listing} />
      </div>
    </Link>
  );
}
