import path from "node:path";
import type { NextConfig } from "next";

// Images are served from the public Supabase Storage bucket (ADR 0004).
// Guarded so tooling that loads this config without .env.local (CI) still works.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: supabaseUrl
      ? [new URL(`${supabaseUrl}/storage/v1/object/public/images/**`)]
      : [],
  },
};

export default nextConfig;
