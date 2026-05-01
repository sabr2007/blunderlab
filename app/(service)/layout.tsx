import { AppShell } from "@/components/app/app-shell";
import { getDisplayName, isRealUser } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isRealUser(user)) {
    redirect("/sign-in?next=/dashboard");
  }

  const profile = await supabase
    .from("profiles")
    .select("display_name,city,default_difficulty,deleted_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile.data?.display_name || profile.data.deleted_at) {
    redirect("/onboarding?next=/dashboard");
  }

  return (
    <AppShell
      user={{
        email: user.email ?? null,
        displayName: profile.data.display_name ?? getDisplayName(user),
        city: profile.data.city,
      }}
    >
      {children}
    </AppShell>
  );
}
