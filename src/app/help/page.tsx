"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DocShell, { DocCta } from "@/components/docs/DocShell";
import { FadeInView } from "@/components/shared/Motion";
import { helpCenterItems } from "@/content/help-center";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";

export default function HelpCenter() {
  return (
    <DocShell kicker="Help" title="How can we help?" subtitle="Short answers. If you can't find it here, write to us and a person replies.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {helpCenterItems.map((item, index) => (
          <FadeInView key={item.title} delay={index * 0.04}>
            <Link href={item.link} className={cn(fyte.card, fyte.cardHover, "group flex h-full flex-col")}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-fyte-ink text-white">
                <item.icon size={20} />
              </span>
              <h2 className="mt-5 text-lg font-bold text-fyte-ink">{item.title}</h2>
              <p className="mt-1 flex-1 text-sm leading-6 text-fyte-muted">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-fyte-ink">
                Open <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          </FadeInView>
        ))}
      </div>
      <DocCta
        title="Still stuck?"
        body="Email us. We read everything and answer within a day."
        href="/help/contact"
        label="Contact support"
      />
    </DocShell>
  );
}
