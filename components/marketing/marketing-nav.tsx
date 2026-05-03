"use client";

import { BrandLogo } from "@/components/common/brand-logo";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Props = {
  signInLabel: string;
};

const NAV_LINKS = [
  { href: "/#how-it-works", labelKey: "navHow" },
  { href: "/#patterns", labelKey: "navPatterns" },
  { href: "/pro", labelKey: "navPricing" },
  { href: "/builders", labelKey: "navBuilders" },
] as const;

export function MarketingNav({ signInLabel }: Props) {
  const t = useTranslations("landing");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition",
        scrolled
          ? "border-b border-border/80 bg-bg/75 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="BlunderLab"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <BrandLogo variant="horizontal" priority className="h-7 w-auto" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-fg-muted md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href.replace("/#", "#")}
              className="relative transition hover:text-fg"
            >
              {t(link.labelKey)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher compact className="hidden sm:inline-flex" />
          <Link
            href="/sign-in"
            className="btn-primary inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium"
          >
            {signInLabel}
            <ArrowRight className="size-3.5" />
          </Link>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="btn-ghost grid size-9 place-items-center rounded-md md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-bg-elevated/95 backdrop-blur-xl md:hidden">
          <div className="container flex flex-col gap-1 py-4 text-sm">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href.replace("/#", "#")}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-fg-muted transition hover:bg-surface hover:text-fg"
              >
                {t(link.labelKey)}
              </a>
            ))}
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <LocaleSwitcher />
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center rounded-md px-3 text-fg-muted transition hover:bg-surface hover:text-fg"
              >
                {signInLabel}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
