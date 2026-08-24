import Link from "next/link";

export function NavBar() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-4xl items-center px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          🏠 Flat Hunter
        </Link>
      </div>
    </header>
  );
}
