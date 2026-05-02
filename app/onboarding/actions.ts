"use server";

import {
  defaultLocale,
  splitLocalePathname,
  withLocalePrefix,
} from "@/i18n/routing";
import {
  getDisplayName,
  getSafeNextPath,
  isRealUser,
} from "@/lib/auth/session";
import type { AiDifficulty, City } from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const onboardingSchema = z.object({
  displayName: z.string().trim().min(2).max(40),
  skill: z.enum(["beginner", "intermediate", "advanced"]),
  city: z.enum(["Almaty", "Astana", "Shymkent", "Other"]),
  next: z.string().optional(),
});

export async function completeOnboardingAction(formData: FormData) {
  const parsed = onboardingSchema.safeParse({
    displayName: formData.get("displayName"),
    skill: formData.get("skill"),
    city: formData.get("city"),
    next: formData.get("next") ?? undefined,
  });
  const nextPath = getSafeNextPath(String(formData.get("next") ?? ""));
  const activeLocale = splitLocalePathname(nextPath).locale ?? defaultLocale;

  if (!parsed.success) {
    redirect(
      `${withLocalePrefix("/onboarding", activeLocale)}?error=invalid&next=${encodeURIComponent(nextPath)}`,
    );
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isRealUser(user)) {
    redirect(
      `${withLocalePrefix("/sign-in", activeLocale)}?next=${encodeURIComponent(
        withLocalePrefix("/onboarding", activeLocale),
      )}`,
    );
  }

  const displayName =
    parsed.data.displayName.trim() || getDisplayName(user).slice(0, 40);

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      city: parsed.data.city as City,
      default_difficulty: parsed.data.skill as AiDifficulty,
      deleted_at: null,
    },
    { onConflict: "id" },
  );

  redirect(nextPath);
}
