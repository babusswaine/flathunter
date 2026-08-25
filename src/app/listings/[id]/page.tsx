import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/ListingDetail";
import { readListings } from "@/lib/listings-store";

export default async function ListingDetailPage(props: PageProps<"/listings/[id]">) {
  const { id } = await props.params;
  const listings = await readListings();
  const listing = listings.find((l) => l.id === id);

  if (!listing) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <ListingDetail listing={listing} />
    </main>
  );
}
