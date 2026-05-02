import { BrandLogo } from "@/components/common/brand-logo";
import { LocaleSwitcher } from "@/components/common/locale-switcher";
import { Link } from "@/i18n/navigation";
import { Github } from "lucide-react";

type Column = {
  heading: string;
  items: ReadonlyArray<{
    label: string;
    href: string;
    external?: boolean;
  }>;
};

type Props = {
  productHeading: string;
  resourcesHeading: string;
  companyHeading: string;
  tagline: string;
  rights: string;
  product: Column["items"];
  resources: Column["items"];
  company: Column["items"];
};

export function MarketingFooter({
  productHeading,
  resourcesHeading,
  companyHeading,
  tagline,
  rights,
  product,
  resources,
  company,
}: Props) {
  return (
    <footer className="relative mt-24 border-t border-border bg-bg/60">
      <div className="absolute inset-x-0 top-0 -z-10 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="container grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="flex flex-col gap-5">
          <Link href="/" aria-label="BlunderLab" className="inline-flex">
            <BrandLogo variant="full" className="h-20 w-20 opacity-90" />
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-fg-muted">
            {tagline}
          </p>
          <LocaleSwitcher />
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          <FooterColumn heading={productHeading} items={product} />
          <FooterColumn heading={resourcesHeading} items={resources} />
          <FooterColumn heading={companyHeading} items={company} />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-fg-subtle md:flex-row">
          <p>{rights}</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/sabr2007/blunderlab"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="grid size-11 place-items-center rounded-md transition hover:bg-surface hover:text-fg-muted md:size-7"
            >
              <Github className="size-4" />
            </a>
            <span aria-hidden className="size-1 rounded-full bg-border" />
            <span>nFactorial Incubator 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ heading, items }: Column) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="text-eyebrow text-fg-subtle">{heading}</p>
      <ul className="grid gap-2.5 text-fg-muted">
        {items.map((item) => (
          <li key={item.href}>
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="-mx-2 inline-flex min-h-11 items-center rounded-md px-2 transition hover:text-fg md:min-h-6"
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                className="-mx-2 inline-flex min-h-11 items-center rounded-md px-2 transition hover:text-fg md:min-h-6"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
