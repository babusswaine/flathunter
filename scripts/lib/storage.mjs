// Uploads to the public "images" bucket in Supabase Storage (ADR 0004).
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY from .env.local —
// the secret key stays in that gitignored file and is never logged.
import { existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

export const IMAGE_BUCKET = "images";

const ENV_PATH = path.join(import.meta.dirname, "..", "..", ".env.local");
if (existsSync(ENV_PATH)) process.loadEnvFile(ENV_PATH);

let client;
function storage() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!url || !key)
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local " +
          "(see docs/adr/0004-images-in-supabase-storage.md)",
      );
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client.storage;
}

export async function ensureBucket() {
  const { error } = await storage().createBucket(IMAGE_BUCKET, { public: true });
  if (error && !/already exists/i.test(error.message)) throw error;
}

// Overwrites any existing object at `objectPath` (re-running an add-* script
// replaces its image), so browsers cache for a day rather than forever.
export async function uploadImage(objectPath, buffer, contentType) {
  const { error } = await storage()
    .from(IMAGE_BUCKET)
    .upload(objectPath, buffer, { contentType, upsert: true, cacheControl: "86400" });
  if (error) throw new Error(`upload failed for ${objectPath}: ${error.message}`);
  return objectPath;
}
