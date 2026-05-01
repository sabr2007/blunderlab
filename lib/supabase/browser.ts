"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.generated";
import { requireSupabasePublicConfig } from "./env";

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

let cached: BrowserSupabaseClient | null = null;

export function getSupabaseBrowserClient(): BrowserSupabaseClient {
  if (cached) {
    return cached;
  }

  const { url, anonKey } = requireSupabasePublicConfig();
  cached = createBrowserClient<Database>(url, anonKey);

  return cached;
}
