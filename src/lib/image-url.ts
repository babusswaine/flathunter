// Every image lives in the public "images" bucket in Supabase Storage (see
// docs/adr/0004-images-in-supabase-storage.md). Data files store bucket paths
// like "photos/L04/1.webp"; this turns one into a URL the browser can load.
export const IMAGE_BUCKET = "images";

export function imageUrl(path: string): string {
  // Referenced literally so Next.js inlines it into client bundles.
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}
