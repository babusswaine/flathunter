import { readListings } from "@/lib/listings-store";
import { ListingBrowser } from "@/components/ListingBrowser";

export default async function Home() {
  const listings = await readListings();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10">
      <ListingBrowser initialListings={listings} />
    </main>
  );
}
