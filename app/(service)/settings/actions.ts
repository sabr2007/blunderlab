"use server";

import { isLocale, withLocalePrefix } from "@/i18n/routing";
import { isRealUser } from "@/lib/auth/session";
import type { AiDifficulty, City } from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(40),
  city: z.enum(["Almaty", "Astana", "Shymkent", "Other"]),
  defaultDifficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

export async function updateProfileAction(formData: FormData) {
  const locale = await getActionLocale();

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    city: formData.get("city"),
    defaultDifficulty: formData.get("defaultDifficulty"),
  });

  if (!parsed.success) {
    redirect(`${withLocalePrefix("/settings", locale)}?error=invalid`);
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isRealUser(user)) {
    redirect(
      `${withLocalePrefix("/sign-in", locale)}?next=${encodeURIComponent(
        withLocalePrefix("/settings", locale),
      )}`,
    );
  }

  await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      city: parsed.data.city as City,
      default_difficulty: parsed.data.defaultDifficulty as AiDifficulty,
      deleted_at: null,
    })
    .eq("id", user.id);

  redirect(`${withLocalePrefix("/settings", locale)}?saved=1`);
}

export async function softDeleteAccountAction(formData: FormData) {
  const locale = await getActionLocale();
  const confirmation = formData.get("confirmDelete");

  if (confirmation !== "DELETE") {
    redirect(`${withLocalePrefix("/settings", locale)}?error=confirm-delete`);
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isRealUser(user)) {
    await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", user.id);
  }

  await supabase.auth.signOut();
  redirect(withLocalePrefix("/", locale));
}

async function getActionLocale() {
  const locale = await getLocale();
  return isLocale(locale) ? locale : "en";
}
