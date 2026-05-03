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

  // Null user only reaches this layout on guest-eligible paths (/play, /review).
  // Middleware already redirects protected paths to /sign-in. For guest-eligible
  // paths we render the shell with a guest placeholder; PlayView/ReviewView will
  // create an anonymous Supabase session on the client.
  if (!user) {
    return (
      <AppShell
        user={{
          email: null,
          displayName: "Guest",
          city: "Other",
        }}
      >
        {children}
      </AppShell>
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
