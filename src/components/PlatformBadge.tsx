import type { Platform } from "@/lib/types";

const PLATFORM_LABELS: Record<Platform, string> = {
  dotproperty: "DotProperty",
  lamudi: "Lamudi",
  rentpad: "Rentpad",
  fb_marketplace: "FB Marketplace",
  fb_group: "FB Group",
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-300 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
      {PLATFORM_LABELS[platform]}
    </span>
  );
}
