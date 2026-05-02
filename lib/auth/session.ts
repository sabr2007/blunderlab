import { splitLocalePathname } from "@/i18n/routing";
import type { User } from "@supabase/supabase-js";

export const PROTECTED_APP_PREFIXES = [
  "/dashboard",
  "/daily-blunder",
  "/leaderboard",
  "/settings",
] as const;

const ALLOWED_NEXT_PREFIXES = [
  "/",
  "/dashboard",
  "/daily-blunder",
  "/leaderboard",
  "/settings",
  "/play",
  "/review",
  "/pro",
  "/onboarding",
] as const;

export function isRealUser(user: User | null | undefined): user is User {
  return Boolean(user && !user.is_anonymous);
}

export function isProtectedAppPath(pathname: string): boolean {
  const { pathnameWithoutLocale } = splitLocalePathname(pathname);

  return PROTECTED_APP_PREFIXES.some(
    (prefix) =>
      pathnameWithoutLocale === prefix ||
      pathnameWithoutLocale.startsWith(`${prefix}/`),
  );
}

export function getSafeNextPath(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }

  if (raw.includes("://")) {
    return fallback;
  }

  const [pathname] = raw.split(/[?#]/);
  const { pathnameWithoutLocale } = splitLocalePathname(pathname);
  const allowed = ALLOWED_NEXT_PREFIXES.some(
    (prefix) =>
      pathnameWithoutLocale === prefix ||
      pathnameWithoutLocale.startsWith(`${prefix}/`),
  );

  return allowed ? raw : fallback;
}

export function getDisplayName(user: User): string {
  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  if (metadataName?.trim()) {
    return metadataName.trim();
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "BlunderLab player";
}
