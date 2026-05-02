import { signOutAction } from "@/app/(service)/actions";
import { updateProfileAction } from "@/app/(service)/settings/actions";
import { DeleteAccountForm } from "@/components/settings/delete-account-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations("settingsPage");
  const authT = await getTranslations("auth");
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
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          {t("title")}
        </h1>
      </header>

      <div className="grid gap-5">
        {params?.saved ? (
          <p className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
            {t("updated")}
          </p>
        ) : null}
        {params?.error ? (
          <p className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {params.error === "confirm-delete"
              ? t("confirmDeleteError")
              : t("formError")}
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t("trainingProfile")}</CardTitle>
            <CardDescription>{t("trainingProfileDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateProfileAction} className="grid gap-5">
              <label className="grid gap-2 text-sm">
                <span className="font-medium">{t("displayName")}</span>
                <input
                  name="displayName"
                  defaultValue={profile.data?.display_name ?? ""}
                  maxLength={40}
                  className="h-10 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none transition focus:border-accent"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium">{t("city")}</span>
                  <select
                    name="city"
                    defaultValue={profile.data?.city ?? "Other"}
                    className="h-10 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none transition focus:border-accent"
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city === "Other" ? t("cityOther") : city}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-medium">{t("defaultDifficulty")}</span>
                  <select
                    name="defaultDifficulty"
                    defaultValue={
                      profile.data?.default_difficulty ?? "beginner"
                    }
                    className="h-10 rounded-md border border-border bg-bg px-3 text-sm text-fg outline-none transition focus:border-accent"
                  >
                    {DIFFICULTIES.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>
                        {authT(`skills.${difficulty}.label`)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <Button type="submit" className="w-full sm:w-fit">
                {t("save")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-warning/30">
          <CardHeader>
            <CardTitle>{t("account")}</CardTitle>
            <CardDescription>{t("accountDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <form action={signOutAction}>
              <Button type="submit" variant="secondary">
                <LogOut className="size-4" />
                {t("signOut")}
              </Button>
            </form>
            <DeleteAccountForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
