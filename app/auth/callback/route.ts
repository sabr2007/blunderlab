import {
  defaultLocale,
  isLocale,
  splitLocalePathname,
  withLocalePrefix,
} from "@/i18n/routing";
import {
  getDisplayName,
  getSafeNextPath,
  isRealUser,
} from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const safeNextPath = getSafeNextPath(
    requestUrl.searchParams.get("next"),
    "/dashboard",
  );
  const cookieLocale = readLocaleCookie(request.headers.get("cookie"));
  const activeLocale =
    splitLocalePathname(safeNextPath).locale ?? cookieLocale ?? defaultLocale;
  const nextPath = withLocalePrefix(safeNextPath, activeLocale);
  const supabase = await getSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return redirectToSignIn(requestUrl, nextPath, activeLocale);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      return redirectToSignIn(requestUrl, nextPath, activeLocale);
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isRealUser(user)) {
    return redirectToSignIn(requestUrl, nextPath, activeLocale);
  }

  const profile = await supabase
    .from("profiles")
    .select("id,display_name,city,default_difficulty,deleted_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile.error || !profile.data || !profile.data.display_name) {
    const onboardingUrl = new URL(
      withLocalePrefix("/onboarding", activeLocale),
      requestUrl.origin,
    );
    onboardingUrl.searchParams.set("next", nextPath);
    onboardingUrl.searchParams.set("name", getDisplayName(user));
    return NextResponse.redirect(onboardingUrl);
  }

  if (profile.data.deleted_at) {
    const onboardingUrl = new URL(
      withLocalePrefix("/onboarding", activeLocale),
      requestUrl.origin,
    );
    onboardingUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}

function redirectToSignIn(
  requestUrl: URL,
  nextPath: string,
  locale: "en" | "ru",
) {
  const signInUrl = new URL(
    withLocalePrefix("/sign-in", locale),
    requestUrl.origin,
  );
  signInUrl.searchParams.set("next", nextPath);
  signInUrl.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(signInUrl);
}

function readLocaleCookie(cookieHeader: string | null): "en" | "ru" | null {
  const match = /(?:^|;\s*)NEXT_LOCALE=([^;]+)/.exec(cookieHeader ?? "");
  const value = match?.[1];
  return isLocale(value) ? value : null;
}
