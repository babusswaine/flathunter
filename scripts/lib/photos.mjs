// Downloads one listing photo, normalizes it to the 16:9 WebP frame, and
// uploads it to Supabase Storage at photos/<listing-id>/<n>.webp. Shared by
// add-listing.mjs (new listings) and set-listing-photos.mjs (existing ones).
import { optimizePhoto } from "./image-optimize.mjs";
import { uploadImage } from "./storage.mjs";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

export async function capturePhoto(url, listingId, index, referer) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, ...(referer ? { Referer: referer } : {}) },
  });
  if (!res.ok) throw new Error(`fetch failed (${res.status}) for ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return uploadImage(
    `photos/${listingId}/${index + 1}.webp`,
    await optimizePhoto(buffer),
    "image/webp",
  );
}
