import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { EditableUserFields, Listing } from "./types";

const DATA_PATH = path.join(process.cwd(), "data", "listings.json");

export async function readListings(): Promise<Listing[]> {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw) as Listing[];
  } catch {
    return [];
  }
}

async function writeListings(listings: Listing[]): Promise<void> {
  await writeFile(DATA_PATH, JSON.stringify(listings, null, 2) + "\n");
}

export async function updateListingUser(
  id: string,
  fields: EditableUserFields,
): Promise<Listing | null> {
  const listings = await readListings();
  const index = listings.findIndex((l) => l.id === id);
  if (index === -1) return null;
  listings[index] = {
    ...listings[index],
    user: { ...listings[index].user, ...fields },
  };
  await writeListings(listings);
  return listings[index];
}

export async function deleteListing(id: string): Promise<boolean> {
  const listings = await readListings();
  const next = listings.filter((l) => l.id !== id);
  if (next.length === listings.length) return false;
  await writeListings(next);
  return true;
}
