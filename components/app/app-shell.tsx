"use client";

import { signOutAction } from "@/app/(service)/actions";
import { BrandLogo } from "@/components/common/brand-logo";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChevronLeft,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  Swords,
  Trophy,
  User as UserIcon,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/play", labelKey: "play", icon: Swords },
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/daily-blunder", labelKey: "daily", icon: Sparkles },
  { href: "/leaderboard", labelKey: "leaderboard", icon: Trophy },
] as const;

const COLLAPSED_KEY = "blunderlab:sidebar-collapsed";

type AppShellProps = {
  children: React.ReactNode;
  user: {
    email: string | null;
    displayName: string;
    city: string;
    identityLabel?: string;
  };
};

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const t = useTranslations("common");

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(COLLAPSED_KEY);
    if (saved === "1") setCollapsed(true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed, hydrated]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger; the effect just resets state
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarWidth = collapsed ? 76 : 256;

  return (
    <div className="relative min-h-screen bg-bg">
      <div
        aria-hidden
        className="hero-orb pointer-events-none fixed left-[-10%] top-[-10%] -z-10 h-[680px] w-[680px] opacity-60"
      />
      <div
        aria-hidden
        className="lab-grid pointer-events-none fixed inset-0 -z-10 opacity-15"
      />

      {/* MOBILE TOP BAR ---------------------------------------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl lg:hidden">
        <div className="container flex h-14 items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="btn-ghost grid size-9 place-items-center rounded-md"
          >
            <Menu className="size-4" />
          </button>
          <Link
            href="/"
            aria-label="BlunderLab"
            className="inline-flex items-center"
          >
            <BrandLogo variant="horizontal" className="h-6 w-auto" />
          </Link>
          <Link
            href="/pro"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated px-2.5 py-1.5 text-xs text-fg-muted"
          >
            <Crown className="size-3 text-accent" /> {t("pro")}
          </Link>
        </div>
      </header>

      {/* MOBILE DRAWER ---------------------------------------- */}
      <div
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={mobileOpen ? 0 : -1}
          className={cn(
            "absolute inset-0 cursor-default bg-[oklch(8%_0.006_70/0.72)] backdrop-blur-sm transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 max-w-[88vw] flex-col border-r border-border bg-bg-elevated transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-border p-4">
            <Link
              href="/"
              aria-label="BlunderLab"
              onClick={() => setMobileOpen(false)}
              className="inline-flex"
            >
              <BrandLogo variant="horizontal" className="h-10 w-auto" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="btn-ghost grid size-9 place-items-center rounded-md"
            >
              <X className="size-4" />
            </button>
          </div>
          <SidebarBody
            pathname={pathname}
            user={user}
            t={t}
            collapsed={false}
            onNavigate={() => setMobileOpen(false)}
          />
        </aside>
      </div>

      {/* DESKTOP SHELL --------------------------------------- */}
      <div
        className="hidden lg:grid lg:min-h-screen"
        style={{ gridTemplateColumns: `${sidebarWidth}px minmax(0, 1fr)` }}
      >
        <aside
          className="sticky top-0 z-30 flex h-screen flex-col border-r border-border bg-bg-elevated/80 backdrop-blur-xl transition-[width] duration-300 ease-out"
          style={{ width: sidebarWidth }}
        >
          <div
            className={cn(
              "flex h-16 items-center border-b border-border px-3",
              collapsed ? "justify-center" : "justify-between",
            )}
          >
            {collapsed ? (
              <Link href="/" aria-label="BlunderLab">
                <BrandLogo variant="icon" className="size-11" />
              </Link>
            ) : (
              <Link
                href="/"
                aria-label="BlunderLab"
                className="inline-flex items-center"
              >
                <BrandLogo variant="horizontal" className="ml-1 h-10 w-auto" />
              </Link>
            )}
          </div>

          <SidebarBody
            pathname={pathname}
            user={user}
            t={t}
            collapsed={collapsed}
          />

          <div className="border-t border-border p-2">
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((v) => !v)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs text-fg-subtle transition hover:bg-surface hover:text-fg-muted",
                collapsed && "justify-center",
              )}
            >
              <ChevronLeft
                className={cn(
                  "size-4 transition-transform duration-300",
                  collapsed && "rotate-180",
                )}
              />
              <span
                className={cn(
                  "sidebar-fade overflow-hidden whitespace-nowrap",
                  collapsed && "w-0 -translate-x-2 opacity-0",
                )}
              >
                Collapse
              </span>
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 border-b border-border/70 bg-bg/75 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-end gap-3 px-6">
              <LocaleSwitcher compact />
              <Link
                href="/pro"
                className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/15"
              >
                <Crown className="size-3.5" />
                {t("proWaitlist")}
              </Link>
            </div>
          </header>

          <div className="min-h-0 flex-1">{children}</div>
        </div>
      </div>

      {/* MOBILE CONTENT (single column) ---------------------- */}
      <div className="min-w-0 pb-20 lg:hidden">{children}</div>

      {/* MOBILE BOTTOM NAV ---------------------------------- */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-bg-elevated/95 backdrop-blur-xl lg:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "grid h-16 place-items-center text-[11px] transition",
                active ? "text-accent" : "text-fg-muted hover:text-fg",
              )}
            >
              <span className="grid place-items-center gap-1">
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

type SidebarBodyProps = {
  pathname: string;
  user: AppShellProps["user"];
  t: ReturnType<typeof useTranslations>;
  collapsed: boolean;
  onNavigate?: () => void;
};

function SidebarBody({
  pathname,
  user,
  t,
  collapsed,
  onNavigate,
}: SidebarBodyProps) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto py-3">
      <nav className="grid gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-accent/12 text-accent"
                  : "text-fg-muted hover:bg-surface hover:text-fg",
                collapsed && "justify-center px-0",
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute inset-y-1 left-0 w-0.5 rounded-r-full bg-accent"
                />
              ) : null}
              <Icon
                className={cn(
                  "size-4 shrink-0 transition",
                  active ? "text-accent" : "group-hover:text-fg",
                )}
              />
              <span
                className={cn(
                  "sidebar-fade overflow-hidden whitespace-nowrap",
                  collapsed && "w-0 -translate-x-1 opacity-0",
                )}
              >
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}

        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            "group mt-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-fg-muted transition hover:bg-surface hover:text-fg",
            collapsed && "justify-center px-0",
          )}
        >
          <UserIcon className="size-4 shrink-0" />
          <span
            className={cn(
              "sidebar-fade overflow-hidden whitespace-nowrap",
              collapsed && "w-0 -translate-x-1 opacity-0",
            )}
          >
            {t("settings")}
          </span>
        </Link>
      </nav>

      <div className="mt-auto border-t border-border px-2 pt-3">
        {!collapsed ? (
          <div className="rounded-lg border border-border bg-bg/50 p-3">
            <div className="flex items-center gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-bg-elevated text-xs uppercase text-fg-muted">
                {user.displayName.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {user.displayName}
                </p>
                <p className="truncate text-xs text-fg-subtle">
                  {user.email ?? "No email"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-fg-muted">
                <BarChart3 className="size-3" />
                {user.city}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  className="btn-ghost grid size-8 place-items-center rounded-md"
                >
                  <LogOut className="size-3.5" />
                </button>
              </form>
            </div>
            {user.identityLabel ? (
              <span className="mt-3 inline-flex w-full items-center justify-center rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-accent">
                {user.identityLabel}
              </span>
            ) : null}
            <Link
              href="/pro"
              onClick={onNavigate}
              className="btn-secondary mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md py-2 text-xs"
            >
              <Crown className="size-3.5 text-accent" />
              {t("proWaitlist")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="grid size-8 place-items-center rounded-full border border-border bg-bg-elevated text-xs uppercase text-fg-muted">
              {user.displayName.slice(0, 1)}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                aria-label="Sign out"
                className="btn-ghost grid size-8 place-items-center rounded-md"
              >
                <LogOut className="size-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
