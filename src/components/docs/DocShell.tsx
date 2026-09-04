"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import UnifiedNavbar from "@/components/shared/UnifiedNavbar";
import UnifiedFooter from "@/components/shared/UnifiedFooter";
import PageHero, { type HeroPhoto } from "@/components/shared/PageHero";
import { FadeInView } from "@/components/shared/Motion";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";

/** Public page: navbar + photographic hero + light content + footer. */
export default function DocShell({
  kicker,
  title,
  subtitle,
  photo = "docs",
  actions,
  aside,
  children,
  narrow = false,
}: {
  kicker: string;
  title: ReactNode;
  subtitle?: ReactNode;
  photo?: HeroPhoto;
  actions?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  narrow?: boolean;
}) {
  return (
    <div className={fyte.page}>
      <UnifiedNavbar />
      <PageHero kicker={kicker} title={title} subtitle={subtitle} photo={photo} actions={actions} aside={aside} />
      <div className={cn(fyte.content, narrow && "max-w-3xl")}>{children}</div>
      <UnifiedFooter />
    </div>
  );
}

export type DocSection = {
  icon: LucideIcon;
  title: string;
  content: { heading: string; text: string }[];
};

/** Numbered legal / policy sections with an anchor nav. */
export function DocSections({ sections, updated }: { sections: DocSection[]; updated?: string }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
      <nav className="hidden lg:block">
        <ol className="sticky top-28 space-y-1 text-sm">
          {sections.map((section, index) => (
            <li key={section.title}>
              <a
                href={`#s-${index}`}
                className="block rounded-lg px-3 py-2 text-fyte-muted transition hover:bg-fyte-card hover:text-fyte-ink"
              >
                {index + 1}. {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <div className="space-y-6">
        {updated ? <p className="text-sm text-fyte-muted">Last updated {updated}</p> : null}
        {sections.map((section, index) => (
          <FadeInView key={section.title} id={`s-${index}`} className={cn(fyte.card, "scroll-mt-28")}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fyte-ink text-white">
                <section.icon size={18} />
              </span>
              <h2 className="text-xl font-bold text-fyte-ink">{section.title}</h2>
            </div>
            <dl className="mt-5 grid gap-5">
              {section.content.map((item) => (
                <div key={item.heading}>
                  <dt className="font-semibold text-fyte-ink">{item.heading}</dt>
                  <dd className="mt-1 text-sm leading-7 text-fyte-muted">{item.text}</dd>
                </div>
              ))}
            </dl>
          </FadeInView>
        ))}
      </div>
    </div>
  );
}

/** Dark closing band with a single call to action. */
export function DocCta({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <section className="mt-12 rounded-2xl bg-fyte-ink p-8 text-white shadow-card sm:p-10">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">{body}</p>
        </div>
        <a href={href} className={fyte.glassSolid}>
          {label}
        </a>
      </div>
    </section>
  );
}
