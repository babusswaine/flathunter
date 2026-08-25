import Image from "next/image";
import { getPlatformMark } from "@/lib/platform-marks";
import type { Platform } from "@/lib/types";

const PLATFORM_LABELS: Record<Platform, string> = {
  dotproperty: "DotProperty",
  lamudi: "Lamudi",
  rentpad: "Rentpad",
  fb_marketplace: "FB Marketplace",
  fb_group: "FB Group",
  airbnb: "Airbnb",
  idealista: "Idealista",
  other: "Other",
};

export function PlatformMark({ platform }: { platform: Platform }) {
  const mark = getPlatformMark(platform);

  if (mark) {
    return (
      <Image
        src={mark.image}
        alt={PLATFORM_LABELS[platform]}
        width={mark.width}
        height={mark.height}
        className="h-4 w-auto object-contain"
      />
    );
  }

  return (
    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
      {PLATFORM_LABELS[platform]}
    </span>
  );
}
