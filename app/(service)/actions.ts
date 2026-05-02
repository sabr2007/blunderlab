"use server";

import { isLocale, withLocalePrefix } from "@/i18n/routing";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  const locale = await getLocale();
  redirect(withLocalePrefix("/", isLocale(locale) ? locale : "en"));
}
