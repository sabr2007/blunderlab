import { completeOnboardingAction } from "@/app/onboarding/actions";
import {
  getDisplayName,
  getSafeNextPath,
  isRealUser,
} from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Choose your BlunderLab skill level and city.",
};

const SKILLS = [
  {
    value: "beginner",
    label: "Beginner",
    description: "I know the rules and play casually.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "I spot tactics and know basic openings.",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "I play seriously and want sharper diagnostics.",
  },
] as const;

const CITIES = ["Almaty", "Astana", "Shymkent", "Other"] as const;

type PageProps = {
  searchParams?: Promise<{
    next?: string;
    name?: string;
    error?: string;
  }>;
};

export default async function OnboardingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params?.next, "/dashboard");
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isRealUser(user)) {
    redirect(`/sign-in?next=${encodeURIComponent("/onboarding")}`);
  }

  const profile = await supabase
    .from("profiles")
    .select("display_name,deleted_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile.data?.display_name && !profile.data.deleted_at) {
    redirect(nextPath);
  }

  const suggestedName = params?.name?.trim() || getDisplayName(user);

  return (
    <main className="min-h-screen bg-bg">
      <div className="lab-grid pointer-events-none fixed inset-0 -z-10 opacity-20" />
      <div className="container grid min-h-screen place-items-center py-10">
        <form
          action={completeOnboardingAction}
          className="w-full max-w-3xl rounded-md border border-border bg-surface/90 p-5 md:p-7"
        >
          <input type="hidden" name="next" value={nextPath} />
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Setup
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
              Tune BlunderLab to your games.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              Your level controls the default Stockfish opponent. Your city is
              only used for the local improvers leaderboard.
            </p>
          </div>

          {params?.error ? (
            <p className="mt-5 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              Check your display name, level, and city before continuing.
            </p>
          ) : null}

          <div className="mt-6 grid gap-6">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-fg">Display name</span>
              <input
                name="displayName"
                defaultValue={suggestedName}
                maxLength={40}
                className="h-10 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none transition focus:border-accent"
              />
            </label>

            <fieldset>
              <legend className="text-sm font-medium text-fg">
                Skill level
              </legend>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {SKILLS.map((skill) => (
                  <label
                    key={skill.value}
                    className="cursor-pointer rounded-md border border-border bg-bg/40 p-4 transition has-[:checked]:border-accent has-[:checked]:bg-accent/10"
                  >
                    <input
                      type="radio"
                      name="skill"
                      value={skill.value}
                      defaultChecked={skill.value === "beginner"}
                      className="sr-only"
                    />
                    <span className="block font-medium">{skill.label}</span>
                    <span className="mt-2 block text-sm text-fg-muted">
                      {skill.description}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-fg">City</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <label
                    key={city}
                    className="cursor-pointer rounded-md border border-border bg-bg/40 px-4 py-2 text-sm transition has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:checked]:text-accent"
                  >
                    <input
                      type="radio"
                      name="city"
                      value={city}
                      defaultChecked={city === "Almaty"}
                      className="sr-only"
                    />
                    {city}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-fg-muted">
              You can change these later in Settings.
            </p>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-bg transition hover:opacity-90"
            >
              Open dashboard
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
