import Image from "next/image";

export function CityCard({
  label,
  count,
  country,
  image,
  attribution,
  selected,
  onClick,
}: {
  label: string;
  count: number;
  country?: string;
  image: string | null;
  attribution?: string | null;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={attribution ?? undefined}
      className={`group relative aspect-video w-full overflow-hidden rounded-xl border-2 text-left transition-colors ${
        selected
          ? "border-foreground"
          : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      {image ? (
        <Image
          src={image}
          alt={label}
          fill
          sizes="(min-width: 896px) 280px, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-zinc-200 dark:bg-zinc-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      {country && (
        <span className="absolute right-2 top-2 h-4 w-6 overflow-hidden rounded-sm shadow">
          {/* biome-ignore lint/performance/noImgElement: tiny local SVG, not worth next/image's optimizer pipeline */}
          <img
            src={`/flags/${country.toLowerCase()}.svg`}
            alt={country}
            className="h-full w-full object-cover"
          />
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <span className="text-base font-semibold text-white drop-shadow-sm">{label}</span>
        <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-white">
          {count}
        </span>
      </div>
    </button>
  );
}
