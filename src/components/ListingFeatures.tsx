import { Bed, ChefHat, PawPrint, ShowerHead, WashingMachine, Wifi, type LucideIcon } from "lucide-react";
import { activeFeatures, type ListingFeature } from "@/lib/listing-features";
import type { Listing } from "@/lib/types";

const MAX_BED_ICONS = 6;

export function BedIcons({ count }: { count: number }) {
  if (count === 0) {
    return <span className="text-sm text-zinc-600 dark:text-zinc-400">Studio</span>;
  }
  const shown = Math.min(count, MAX_BED_ICONS);
  return (
    <span className="inline-flex items-center gap-0.5" title={`${count} bedroom${count === 1 ? "" : "s"}`}>
      {Array.from({ length: shown }).map((_, i) => (
        <Bed key={i} className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
      ))}
      {count > MAX_BED_ICONS && (
        <span className="text-xs text-zinc-500">+{count - MAX_BED_ICONS}</span>
      )}
    </span>
  );
}

const FEATURE_ICONS: Record<ListingFeature["key"], LucideIcon> = {
  kitchen: ChefHat,
  hot_shower: ShowerHead,
  wifi: Wifi,
  utility: WashingMachine,
  pets: PawPrint,
};

export function FeatureIcons({
  listing,
  labels = false,
}: {
  listing: Listing;
  labels?: boolean;
}) {
  const active = activeFeatures(listing);
  if (active.length === 0) return null;

  return (
    <div className={labels ? "flex flex-wrap gap-x-4 gap-y-2" : "flex items-center gap-2.5"}>
      {active.map(({ key, label }) => {
        const Icon = FEATURE_ICONS[key];
        return labels ? (
          <div key={key} className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </div>
        ) : (
          <span key={key} title={label}>
            <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-500" />
          </span>
        );
      })}
    </div>
  );
}
