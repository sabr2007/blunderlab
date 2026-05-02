"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { startTransition } from "react";

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");

  return (
    <label className="inline-flex items-center gap-2 text-xs text-fg-muted">
      <span className={compact ? "sr-only" : undefined}>{t("language")}</span>
      <select
        value={locale}
        aria-label={t("language")}
        className="h-8 rounded-md border border-border bg-bg px-2 text-xs text-fg outline-none transition focus:border-accent"
        onChange={(event) => {
          const nextLocale = event.currentTarget.value;
          if (nextLocale !== "en" && nextLocale !== "ru") return;
          startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
          });
        }}
      >
        <option value="en">{t("english")}</option>
        <option value="ru">{t("russian")}</option>
      </select>
    </label>
  );
}
