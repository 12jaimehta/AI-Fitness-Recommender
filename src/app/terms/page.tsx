"use client";

import DocShell, { DocCta, DocSections } from "@/components/docs/DocShell";
import { termsSections } from "@/content/terms";

export default function TermsOfService() {
  return (
    <DocShell
      kicker="Legal"
      title="Terms of service"
      subtitle="The agreement between you and fyteAI. Plain language where the law allows."
    >
      <DocSections sections={termsSections} updated="September 2026" />
      <DocCta
        title="Something unclear?"
        body="If a clause doesn't make sense, tell us and we'll explain it or fix it."
        href="mailto:jaimehtaalerts@gmail.com"
        label="Email us"
      />
    </DocShell>
  );
}
