"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabasePublicConfig } from "./env";

let cached: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (cached) {
    return cached;
  }

  const { url, anonKey } = requireSupabasePublicConfig();
  cached = createBrowserClient(url, anonKey);

  return cached;
}
