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
  const nextPath = getSafeNextPath(
    requestUrl.searchParams.get("next"),
    "/dashboard",
  );
  const supabase = await getSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return redirectToSignIn(requestUrl, nextPath);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      return redirectToSignIn(requestUrl, nextPath);
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isRealUser(user)) {
    return redirectToSignIn(requestUrl, nextPath);
  }

  const profile = await supabase
    .from("profiles")
    .select("id,display_name,city,default_difficulty,deleted_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile.error || !profile.data || !profile.data.display_name) {
    const onboardingUrl = new URL("/onboarding", requestUrl.origin);
    onboardingUrl.searchParams.set("next", nextPath);
    onboardingUrl.searchParams.set("name", getDisplayName(user));
    return NextResponse.redirect(onboardingUrl);
  }

  if (profile.data.deleted_at) {
    const onboardingUrl = new URL("/onboarding", requestUrl.origin);
    onboardingUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}

function redirectToSignIn(requestUrl: URL, nextPath: string) {
  const signInUrl = new URL("/sign-in", requestUrl.origin);
  signInUrl.searchParams.set("next", nextPath);
  signInUrl.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(signInUrl);
}
