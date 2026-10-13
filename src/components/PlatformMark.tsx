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
  batdongsan: "Batdongsan",
  chotot: "Chợ Tốt",
  homedy: "Homedy",
  rumah123: "Rumah123",
  "99co": "99.co",
  mamikos: "Mamikos",
  ddproperty: "DDproperty",
  fazwaz: "FazWaz",
  immobilienscout24: "ImmobilienScout24",
  immowelt: "Immowelt",
  wg_gesucht: "WG-Gesucht",
  fotocasa: "Fotocasa",
  pisos: "pisos.com",
  leboncoin: "LeBonCoin",
  pap: "PAP.fr",
  domain_au: "Domain",
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
