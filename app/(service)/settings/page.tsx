import { signOutAction } from "@/app/(service)/actions";
import {
  softDeleteAccountAction,
  updateProfileAction,
} from "@/app/(service)/settings/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LogOut, Trash2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your BlunderLab profile and defaults.",
};

const CITIES = ["Almaty", "Astana", "Shymkent", "Other"] as const;
const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

type PageProps = {
  searchParams?: Promise<{ saved?: string; error?: string }>;
};

export default async function SettingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await supabase
    .from("profiles")
    .select("display_name,city,default_difficulty")
    .eq("id", user.id)
    .single();

  return (
    <main className="container max-w-4xl py-6 md:py-8">
      <header className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          Profile and defaults.
        </h1>
      </header>

      <div className="grid gap-5">
        {params?.saved ? (
          <p className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
            Profile updated.
          </p>
        ) : null}
        {params?.error ? (
          <p className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            Check the form values and try again.
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Training profile</CardTitle>
            <CardDescription>
              City changes affect the default leaderboard filter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateProfileAction} className="grid gap-5">
              <label className="grid gap-2 text-sm">
                <span className="font-medium">Display name</span>
                <input
                  name="displayName"
                  defaultValue={profile.data?.display_name ?? ""}
                  maxLength={40}
                  className="h-10 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none transition focus:border-accent"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium">City</span>
                  <select
                    name="city"
                    defaultValue={profile.data?.city ?? "Other"}
                    className="h-10 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none transition focus:border-accent"
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-medium">Default difficulty</span>
                  <select
                    name="defaultDifficulty"
                    defaultValue={
                      profile.data?.default_difficulty ?? "beginner"
                    }
                    className="h-10 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none transition focus:border-accent"
                  >
                    {DIFFICULTIES.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <Button type="submit" className="w-full sm:w-fit">
                Save profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Sign out keeps your saved games. Delete marks the profile as
              inactive for this prototype.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <form action={signOutAction}>
              <Button type="submit" variant="secondary">
                <LogOut className="size-4" />
                Sign out
              </Button>
            </form>
            <form action={softDeleteAccountAction}>
              <Button type="submit" variant="danger">
                <Trash2 className="size-4" />
                Delete account
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
