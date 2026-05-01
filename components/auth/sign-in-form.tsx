"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

const emailSchema = z.string().trim().email();

type SignInFormProps = {
  nextPath: string;
  error?: string | null;
};

type Status =
  | { kind: "idle" }
  | { kind: "loading"; label: string }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export function SignInForm({ nextPath, error }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>(
    error
      ? { kind: "error", message: authErrorMessage(error) }
      : { kind: "idle" },
  );
  const isLoading = status.kind === "loading";

  async function continueWithGoogle() {
    setStatus({ kind: "loading", label: "Opening Google..." });

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
        message: err instanceof Error ? err.message : "Google sign-in failed.",
      });
    }
  }

  async function continueWithEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);

    if (!parsed.success) {
      setStatus({ kind: "error", message: "Enter a valid email address." });
      return;
    }

    const cleanEmail = parsed.data;
    setStatus({ kind: "loading", label: "Sending magic link..." });

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
        message: err instanceof Error ? err.message : "Email sign-in failed.",
      });
    }
  }

  return (
    <Card className="w-full max-w-md border-accent/30 bg-surface/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-accent" />
          Sign in to BlunderLab
        </CardTitle>
        <CardDescription>
          Keep your reviews, unlock the dashboard, and turn past mistakes into
          daily training.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          className="w-full"
          disabled={isLoading}
          onClick={continueWithGoogle}
        >
          {isLoading && status.label === "Opening Google..." ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-fg-muted">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="space-y-3" onSubmit={continueWithEmail}>
          <label className="grid gap-2 text-sm">
            <span className="text-fg-muted">Email magic link</span>
            <input
              type="email"
              value={email}
              disabled={isLoading}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="you@example.com"
              className="h-10 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none transition focus:border-accent"
            />
          </label>
          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && status.label === "Sending magic link..." ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Mail className="size-4" />
            )}
            Send magic link
          </Button>
        </form>

        {status.kind === "sent" ? (
          <p className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
            Magic link sent to {status.email}. Open it on this device to finish
            sign-in.
          </p>
        ) : null}

        {status.kind === "error" ? (
          <p className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {status.message}
          </p>
        ) : null}

        <div className="flex items-center justify-between pt-2 text-sm">
          <Link href="/play" className="text-fg-muted hover:text-fg">
            Try without account
          </Link>
          <Link
            href={nextPath}
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            Continue <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function getRedirectTo(nextPath: string): string {
  const url = new URL("/auth/callback", window.location.origin);
  url.searchParams.set("next", nextPath);
  return url.toString();
}

function authErrorMessage(error: string): string {
  if (error === "auth_callback_failed") {
    return "The sign-in link could not be verified. Try again.";
  }

  if (error === "auth_required") {
    return "Sign in with Google or email to open this area.";
  }

  return "Sign-in failed. Try again.";
}
