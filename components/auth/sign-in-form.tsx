"use client";

import { ensureAnonymousUser } from "@/lib/supabase/anonymous";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  ArrowRight,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { z } from "zod";

const emailSchema = z.string().trim().email();

type SignInFormProps = {
  nextPath: string;
  guestPath: string;
  error?: string | null;
};

type Status =
  | { kind: "idle" }
  | { kind: "loading"; label: string }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export function SignInForm({ nextPath, guestPath, error }: SignInFormProps) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>(
    error
      ? { kind: "error", message: authErrorMessage(error, t) }
      : { kind: "idle" },
  );
  const isLoading = status.kind === "loading";

  async function continueAsGuest() {
    setStatus({ kind: "loading", label: t("guestStarting") });

    try {
      await ensureAnonymousUser();
      window.location.assign(guestPath);
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : t("guestFailed"),
      });
    }
  }

  async function continueWithGoogle() {
    setStatus({ kind: "loading", label: t("openingGoogle") });

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = getRedirectTo(nextPath);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && !user.is_anonymous) {
        window.location.assign(nextPath);
        return;
      }

      const result = user?.is_anonymous
        ? await supabase.auth.linkIdentity({
            provider: "google",
            options: { redirectTo },
          })
        : await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo },
          });

      if (result.error) {
        setStatus({ kind: "error", message: result.error.message });
        return;
      }

      if (result.data.url) {
        window.location.assign(result.data.url);
      }
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : t("googleFailed"),
      });
    }
  }

  async function continueWithEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);

    if (!parsed.success) {
      setStatus({ kind: "error", message: t("emailInvalid") });
      return;
    }

    const cleanEmail = parsed.data;
    setStatus({ kind: "loading", label: t("sendingMagicLink") });

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = getRedirectTo(nextPath);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && !user.is_anonymous) {
        window.location.assign(nextPath);
        return;
      }

      const result = user?.is_anonymous
        ? await supabase.auth.updateUser(
            { email: cleanEmail },
            { emailRedirectTo: redirectTo },
          )
        : await supabase.auth.signInWithOtp({
            email: cleanEmail,
            options: {
              emailRedirectTo: redirectTo,
              shouldCreateUser: true,
            },
          });

      if (result.error) {
        setStatus({ kind: "error", message: result.error.message });
        return;
      }

      setStatus({ kind: "sent", email: cleanEmail });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : t("emailFailed"),
      });
    }
  }

  return (
    <div className="surface-card surface-grain w-full max-w-md p-7 md:p-8">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-full border border-accent/35 bg-accent/12 text-accent">
          <ShieldCheck className="size-4" />
        </span>
        <h1 className="text-xl font-semibold tracking-tight">
          {t("signInTitle")}
        </h1>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">
        {t("signInText")}
      </p>

      <div className="mt-7 space-y-4">
        <button
          type="button"
          className="btn-primary inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          onClick={continueWithGoogle}
        >
          {isLoading &&
          status.kind === "loading" &&
          status.label === t("openingGoogle") ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          {t("google")}
        </button>

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
          <span className="h-px flex-1 bg-border" />
          {t("or")}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-3" onSubmit={continueWithEmail}>
          <label className="grid gap-2 text-sm">
            <span className="text-xs uppercase tracking-[0.16em] text-fg-subtle">
              {t("emailLabel")}
            </span>
            <input
              type="email"
              value={email}
              disabled={isLoading}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="you@example.com"
              className="h-11 rounded-lg border border-border bg-bg px-3.5 text-sm text-fg outline-none transition focus:border-accent focus:shadow-[0_0_0_3px_oklch(78%_0.16_72/0.18)]"
            />
          </label>
          <button
            type="submit"
            className="btn-secondary inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading &&
            status.kind === "loading" &&
            status.label === t("sendingMagicLink") ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Mail className="size-4" />
            )}
            {t("emailButton")}
          </button>
        </form>

        {status.kind === "sent" ? (
          <p
            className="rounded-lg border p-3 text-sm"
            style={{
              borderColor: "oklch(74% 0.15 145 / 0.35)",
              background: "oklch(74% 0.15 145 / 0.10)",
              color: "var(--color-success)",
            }}
          >
            {t("magicLinkSent", { email: status.email })}
          </p>
        ) : null}

        {status.kind === "error" ? (
          <p
            className="rounded-lg border p-3 text-sm"
            style={{
              borderColor: "oklch(64% 0.22 25 / 0.35)",
              background: "oklch(64% 0.22 25 / 0.10)",
              color: "var(--color-danger)",
            }}
          >
            {status.message}
          </p>
        ) : null}

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-fg-subtle">
          <span className="h-px flex-1 bg-border" />
          {t("or")}
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={continueAsGuest}
          disabled={isLoading}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-bg/40 text-sm font-medium text-fg transition hover:border-border-strong hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading &&
          status.kind === "loading" &&
          status.label === t("guestStarting") ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UserRound className="size-4" />
          )}
          {t("tryWithoutAccount")}
        </button>

        <div className="flex justify-center border-t border-border pt-4 text-sm">
          <a
            href={nextPath}
            className="-mx-2 inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-accent transition hover:bg-accent/10 md:min-h-6"
          >
            {t("continue")} <ArrowRight className="size-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function getRedirectTo(nextPath: string): string {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", nextPath);
  return url.toString();
}

function authErrorMessage(
  error: string,
  t: ReturnType<typeof useTranslations<"auth">>,
): string {
  if (error === "auth_callback_failed") {
    return t("authCallbackFailed");
  }

  if (error === "auth_required") {
    return t("authRequired");
  }

  return t("signInFailed");
}
