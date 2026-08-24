export function FavoriteToggle({
  favorite,
  onChange,
}: {
  favorite: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={favorite}
      aria-label={favorite ? "Unfavorite" : "Favorite"}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onChange(!favorite);
      }}
      className={`text-lg leading-none ${
        favorite ? "text-amber-500" : "text-zinc-300 hover:text-zinc-400 dark:text-zinc-700"
      }`}
    >
      {favorite ? "★" : "☆"}
    </button>
  );
}
