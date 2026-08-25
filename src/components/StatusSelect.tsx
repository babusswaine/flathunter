import { type ListingStatus, STATUS_LABELS, STATUSES } from "@/lib/types";

const STATUS_STYLES: Record<ListingStatus, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  interested: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  contacted: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  toured: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  extraction_failed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function StatusSelect({
  value,
  onChange,
}: {
  value: ListingStatus;
  onChange: (next: ListingStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ListingStatus)}
      onClick={(e) => e.stopPropagation()}
      className={`rounded-full border-0 px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[value]}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
