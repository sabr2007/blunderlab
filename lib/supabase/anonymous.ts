"use client";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./browser";

let inFlight: Promise<User> | null = null;

export async function ensureAnonymousUser(
  client: SupabaseClient = getSupabaseBrowserClient(),
): Promise<User> {
  const existing = await client.auth.getUser();

  if (existing.data.user) {
    return existing.data.user;
  }

  if (!inFlight) {
    inFlight = (async () => {
      const result = await client.auth.signInAnonymously();

      if (result.error || !result.data.user) {
        throw new Error(
          result.error?.message ?? "Failed to start anonymous session",
        );
      }

      return result.data.user;
    })().finally(() => {
      inFlight = null;
    });
  }

  return inFlight;
}
