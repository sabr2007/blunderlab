import {
  defaultLocale,
  splitLocalePathname,
  withLocalePrefix,
} from "@/i18n/routing";
import { getSafeNextPath, isProtectedAppPath } from "@/lib/auth/session";
import type { Database } from "@/lib/supabase/database.generated";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function proxy(request: NextRequest) {
  const intlMiddleware = createIntlMiddleware(routing);
  let response = intlMiddleware(request);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = intlMiddleware(request);

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { locale, pathnameWithoutLocale } = splitLocalePathname(
    request.nextUrl.pathname,
  );
  const activeLocale = locale ?? defaultLocale;

  if (isProtectedAppPath(pathnameWithoutLocale) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = withLocalePrefix("/sign-in", activeLocale);
    redirectUrl.search = "";
    redirectUrl.searchParams.set(
      "next",
      getSafeNextPath(
        withLocalePrefix(
          `${pathnameWithoutLocale}${request.nextUrl.search}`,
          activeLocale,
        ),
        withLocalePrefix("/dashboard", activeLocale),
      ),
    );
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|wasm|js|mp4|vtt)$).*)",
  ],
};
