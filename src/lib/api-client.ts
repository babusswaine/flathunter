import type { EditableUserFields } from "./types";

export async function patchListing(id: string, fields: EditableUserFields): Promise<void> {
  await fetch(`/api/listings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
}

export async function deleteListingRequest(id: string): Promise<void> {
  await fetch(`/api/listings/${id}`, { method: "DELETE" });
}
