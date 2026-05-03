import { AppShell } from "@/components/app/app-shell";
import { isLocale, withLocalePrefix } from "@/i18n/routing";
import { getDisplayName, isRealUser } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { loadIdentityLabel } from "@/lib/training/progress";
import { redirect } from "next/navigation";

export default async function ServiceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "en";
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `${withLocalePrefix("/sign-in", locale)}?next=${encodeURIComponent(
        withLocalePrefix("/dashboard", locale),
      )}`,
    );
  }

  const profile = await supabase
    .from("profiles")
    .select("display_name,city,default_difficulty,deleted_at")
    .eq("id", user.id)
    .maybeSingle();

  if (
    isRealUser(user) &&
    (!profile.data?.display_name || profile.data.deleted_at)
  ) {
    redirect(
      `${withLocalePrefix("/onboarding", locale)}?next=${encodeURIComponent(
        withLocalePrefix("/dashboard", locale),
      )}`,
    );
  }

  const identity = await loadIdentityLabel(user.id);

  return (
    <AppShell
      user={{
        email: user.email ?? null,
        displayName: profile.data?.display_name ?? getDisplayName(user),
        city: profile.data?.city ?? "Other",
        identityLabel: identity.label,
      }}
    >
      {children}
    </AppShell>
  );
}
