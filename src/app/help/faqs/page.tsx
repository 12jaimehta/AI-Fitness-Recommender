"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import DocShell, { DocCta } from "@/components/docs/DocShell";
import { Collapse, FadeIn } from "@/components/shared/Motion";
import { faqCategories, faqData } from "@/content/faqs";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";

type CategoryId = keyof typeof faqData;

export default function FAQs() {
  const [category, setCategory] = useState<CategoryId>("general");
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqData[category].map((item) => ({ ...item, category }));
    return (Object.keys(faqData) as CategoryId[]).flatMap((key) =>
      faqData[key]
        .filter((item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q))
        .map((item) => ({ ...item, category: key }))
    );
  }, [category, query]);

  return (
    <DocShell
      kicker="Help"
      title="Questions, answered"
      subtitle="Search, or pick a topic."
      aside={
        <label className="flex h-12 w-full items-center gap-3 rounded-full border border-white/30 bg-white/10 px-4 text-white backdrop-blur-md lg:w-80">
          <Search size={18} className="shrink-0 text-white/70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-white/60"
          />
        </label>
      }
    >
      {!query ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {faqCategories.map((item) => {
            const active = item.id === category;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCategory(item.id as CategoryId);
                  setOpen(null);
                }}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition",
                  active ? "bg-fyte-ink text-white shadow-card" : "border border-fyte-line bg-fyte-card text-fyte-ink hover:border-fyte-ink"
                )}
              >
                <item.icon size={16} />
                {item.name}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mb-6 text-sm text-fyte-muted">
          {items.length} result{items.length === 1 ? "" : "s"} for “{query}”
        </p>
      )}

      <FadeIn key={`${category}-${query}`} className={cn(fyte.card, "divide-y divide-fyte-line p-0 sm:p-0")}>
        {items.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-fyte-muted">Nothing matched. Try another word or contact us.</p>
        ) : null}
        {items.map((item) => {
          const id = `${item.category}-${item.question}`;
          const expanded = open === id;
          return (
            <div key={id}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : id)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
              >
                <span className="font-semibold text-fyte-ink">{item.question}</span>
                <ChevronDown size={18} className={cn("shrink-0 text-fyte-muted transition", expanded && "rotate-180")} />
              </button>
              <Collapse open={expanded}>
                <p className="px-5 pb-5 text-sm leading-7 text-fyte-muted sm:px-6">{item.answer}</p>
              </Collapse>
            </div>
          );
        })}
      </FadeIn>

      <DocCta
        title="Didn't find it?"
        body="Write to us. Real answers, usually the same day."
        href="/help/contact"
        label="Contact support"
      />
    </DocShell>
  );
}
