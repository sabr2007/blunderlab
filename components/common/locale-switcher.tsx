"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { startTransition } from "react";

const LOCALES = ["en", "ru"] as const;

type Props = {
  compact?: boolean;
  className?: string;
};

export function LocaleSwitcher({ compact = false, className }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");

  const change = (next: (typeof LOCALES)[number]) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <fieldset
      aria-label={t("language")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-bg-elevated/60 p-0.5 text-xs",
        className,
      )}
    >
      {!compact ? (
        <legend className="px-2 text-fg-subtle">{t("language")}</legend>
      ) : null}
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => change(code)}
            aria-pressed={active}
            className={cn(
              "min-h-11 min-w-11 rounded-full px-3 py-2 font-medium uppercase tracking-wide transition md:min-h-7 md:min-w-9 md:px-2.5 md:py-1",
              active
                ? "bg-accent text-[oklch(15%_0.02_70)] shadow-[0_0_0_1px_oklch(78%_0.16_72/0.4)]"
                : "text-fg-muted hover:text-fg",
            )}
          >
            {code}
          </button>
        );
      })}
    </fieldset>
  );
}
