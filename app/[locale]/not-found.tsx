import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function LocaleNotFound() {
  const t = await getTranslations("errors");
  const common = await getTranslations("common");

  return (
    <main className="min-h-screen bg-bg">
      <div className="lab-grid pointer-events-none fixed inset-0 -z-10 opacity-20" />
      <div className="container grid min-h-screen place-items-center py-10">
        <section className="max-w-xl rounded-md border border-border bg-surface/90 p-6 text-center">
          <p className="font-mono text-sm text-accent">404</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
            {t("notFoundTitle")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            {t("notFoundText")}
          </p>
          <Button asChild className="mt-6">
            <Link href="/">{common("backToLanding")}</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
