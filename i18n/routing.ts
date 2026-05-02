import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function splitLocalePathname(pathname: string): {
  locale: Locale | null;
  pathnameWithoutLocale: string;
} {
  const [, maybeLocale, rest = ""] =
    /^\/([a-z]{2})(\/.*)?$/.exec(pathname) ?? [];

  if (!isLocale(maybeLocale)) {
    return { locale: null, pathnameWithoutLocale: pathname || "/" };
  }

  return {
    locale: maybeLocale,
    pathnameWithoutLocale: rest || "/",
  };
}

export function withLocalePrefix(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const queryStart = normalized.search(/[?#]/);
  const pathname =
    queryStart === -1 ? normalized : normalized.slice(0, queryStart);
  const suffix = queryStart === -1 ? "" : normalized.slice(queryStart);
  const { pathnameWithoutLocale } = splitLocalePathname(pathname);

  if (pathnameWithoutLocale === "/") {
    return `/${locale}${suffix}`;
  }

  return `/${locale}${pathnameWithoutLocale}${suffix}`;
}
