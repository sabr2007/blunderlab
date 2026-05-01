"use server";

import { isRealUser } from "@/lib/auth/session";
import type { AiDifficulty, City } from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(40),
  city: z.enum(["Almaty", "Astana", "Shymkent", "Other"]),
  defaultDifficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

export async function updateProfileAction(formData: FormData) {
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    city: formData.get("city"),
    defaultDifficulty: formData.get("defaultDifficulty"),
  });

  if (!parsed.success) {
    redirect("/settings?error=invalid");
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isRealUser(user)) {
    redirect("/sign-in?next=/settings");
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

  redirect("/settings?saved=1");
}

export async function softDeleteAccountAction() {
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
  redirect("/");
}
