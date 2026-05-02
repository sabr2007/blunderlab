"use client";

import { signOutAction } from "@/app/(service)/actions";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Crown,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";
import { useTranslations } from "next-intl";

const NAV_ITEMS = [
  { href: "/play", labelKey: "play", icon: Swords },
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/daily-blunder", labelKey: "daily", icon: Sparkles },
  { href: "/leaderboard", labelKey: "leaderboard", icon: Trophy },
  { href: "/settings", labelKey: "settings", icon: Settings },
] as const;

type AppShellProps = {
  children: React.ReactNode;
  user: {
    email: string | null;
    displayName: string;
    city: string;
  };
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const t = useTranslations("common");

  return (
    <div className="min-h-screen bg-bg">
      <div className="lab-grid pointer-events-none fixed inset-0 -z-10 opacity-15" />
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border bg-surface/80 lg:flex lg:flex-col">
          <div className="border-b border-border p-5">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/15 text-accent">
                ◇
              </span>
              BlunderLab
            </Link>
          </div>
          <nav className="grid gap-1 p-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-fg-muted hover:bg-bg/50 hover:text-fg",
                  )}
                >
                  <Icon className="size-4" />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-border p-4">
            <div className="mb-3">
              <LocaleSwitcher />
            </div>
            <div className="rounded-md border border-border bg-bg/40 p-3">
              <p className="truncate text-sm font-medium">{user.displayName}</p>
              <p className="mt-1 truncate text-xs text-fg-muted">
                {user.email ?? "No email"}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-fg-muted">
                  <BarChart3 className="size-3" />
                  {user.city}
                </span>
                <form action={signOutAction}>
                  <Button type="submit" variant="ghost" size="sm">
                    <LogOut className="size-4" />
                  </Button>
                </form>
              </div>
            </div>
            <Button asChild variant="secondary" className="mt-3 w-full">
              <Link href="/pro">
                <Crown className="size-4" />
                {t("proWaitlist")}
              </Link>
            </Button>
          </div>
        </aside>

        <div className="min-w-0 pb-20 lg:pb-0">
          <header className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur lg:hidden">
            <div className="container flex h-14 items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/15 text-accent">
                  ◇
                </span>
                BlunderLab
              </Link>
              <Link
                href="/pro"
                className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs text-fg-muted"
              >
                <Crown className="size-3" />
                {t("pro")}
              </Link>
            </div>
          </header>

          {children}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 backdrop-blur lg:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "grid h-16 place-items-center text-[11px]",
                active ? "text-accent" : "text-fg-muted",
              )}
            >
              <span className="grid gap-1 place-items-center">
                <Icon className="size-4" />
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
