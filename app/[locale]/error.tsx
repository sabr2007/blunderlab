"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

export default function LocaleError({ reset }: { reset: () => void }) {
  const t = useTranslations("errors");
  const common = useTranslations("common");

  return (
    <main className="min-h-screen bg-bg">
      <div className="lab-grid pointer-events-none fixed inset-0 -z-10 opacity-20" />
      <div className="container grid min-h-screen place-items-center py-10">
        <section className="max-w-xl rounded-md border border-danger/35 bg-danger/5 p-6 text-center">
          <AlertTriangle className="mx-auto size-8 text-danger" />
          <h1 className="mt-4 text-3xl font-semibold tracking-normal md:text-4xl">
            {t("errorTitle")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            {t("errorText")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button type="button" onClick={reset}>
              <RotateCcw className="size-4" />
              {common("tryAgain")}
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">{common("backToLanding")}</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
