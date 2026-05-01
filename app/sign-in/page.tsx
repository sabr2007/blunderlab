import { SignInForm } from "@/components/auth/sign-in-form";
import { getSafeNextPath } from "@/lib/auth/session";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to BlunderLab with Google or an email magic link.",
};

type PageProps = {
  searchParams?: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function SignInPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params?.next, "/dashboard");

  return (
    <main className="min-h-screen bg-bg">
      <div className="lab-grid pointer-events-none fixed inset-0 -z-10 opacity-20" />
      <div className="container flex min-h-screen flex-col py-6">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/15 text-accent">
              ◇
            </span>
            BlunderLab
          </Link>
          <Link
            href="/play"
            className="text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Play first
          </Link>
        </header>
        <section className="grid flex-1 place-items-center py-10">
          <SignInForm nextPath={nextPath} error={params?.error ?? null} />
        </section>
      </div>
    </main>
  );
}
