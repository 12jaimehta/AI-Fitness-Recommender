"use client";

import DocShell, { DocCta, DocSections } from "@/components/docs/DocShell";
import { privacySections } from "@/content/privacy";

export default function PrivacyPolicy() {
  return (
    <DocShell
      kicker="Legal"
      title="Privacy policy"
      subtitle="What we collect, why, and how to get it deleted. Written to be read."
    >
      <DocSections sections={privacySections} updated="September 2026" />
      <DocCta
        title="Questions about your data?"
        body="Ask us directly. We answer privacy questions ourselves, not through a form."
        href="mailto:jaimehtaalerts@gmail.com"
        label="Email us"
      />
    </DocShell>
  );
}
