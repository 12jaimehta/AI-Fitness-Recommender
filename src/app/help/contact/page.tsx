"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Clock, MessageCircle } from "lucide-react";
import DocShell from "@/components/docs/DocShell";
import FormInput from "@/components/shared/FormInput";
import FormSelect from "@/components/shared/FormSelect";
import FormTextarea from "@/components/shared/FormTextarea";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";

const SUPPORT_EMAIL = "jaimehtaalerts@gmail.com";

const SUBJECTS = [
  { value: "general", label: "General question" },
  { value: "technical", label: "Something is broken" },
  { value: "billing", label: "Billing" },
  { value: "feedback", label: "Feedback" },
];

const QUICK = [
  {
    q: "How do I change one meal without redoing the plan?",
    a: "On the Coach page tap “Swap” on that meal. You get three options inside the same calorie budget.",
  },
  {
    q: "I ate something off-plan. What now?",
    a: "Tap “Something else”, type it or add a photo, answer two or three questions. The coach tells you the extra steps for today or adjusts tomorrow.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your rows are protected by row-level security and never shared. You can ask us to delete everything.",
  },
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });
  const set = (key: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const subjectLabel = SUBJECTS.find((item) => item.value === form.subject)?.label || "Question";
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`[fyteAI] ${subjectLabel}`)}&body=${encodeURIComponent(
    `${form.message}\n\n— ${form.name || "Anonymous"}${form.email ? ` (${form.email})` : ""}`
  )}`;
  const ready = form.message.trim().length > 0;

  return (
    <DocShell
      kicker="Help"
      title="Talk to a person"
      subtitle="One inbox, read by the people who build fyteAI. Replies within a day."
      aside={
        <a href={`mailto:${SUPPORT_EMAIL}`} className={cn(fyte.stat, "flex items-center gap-3 text-white transition hover:bg-white/15")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-fyte-ink">
            <Mail size={18} />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-white/60">Email</span>
            <span className="block font-semibold">{SUPPORT_EMAIL}</span>
          </span>
        </a>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (ready) window.location.href = mailto;
          }}
          className={cn(fyte.card, "p-6 sm:p-8")}
        >
          <h2 className="text-xl font-bold text-fyte-ink">Send a message</h2>
          <p className={`mt-1 ${fyte.body}`}>Opens in your mail app with everything filled in.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FormInput label="Name" placeholder="Your name" value={form.name} onChange={set("name")} />
            <FormInput label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
          </div>
          <div className="mt-5">
            <FormSelect label="Topic" compact value={form.subject} onChange={set("subject")} options={SUBJECTS} required />
          </div>
          <div className="mt-5">
            <FormTextarea label="Message" placeholder="What happened, and what you expected." value={form.message} onChange={set("message")} rows={6} required />
          </div>
          <button type="submit" disabled={!ready} className={`${fyte.primary} mt-6`}>
            Send email
          </button>
        </form>

        <aside className="space-y-4">
          <div className={fyte.card}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fyte-ink text-white">
                <Clock size={18} />
              </span>
              <div>
                <p className="font-bold text-fyte-ink">Response time</p>
                <p className="text-sm text-fyte-muted">Under 24 hours, every day.</p>
              </div>
            </div>
          </div>
          <div className={fyte.card}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fyte-ink text-white">
                <MessageCircle size={18} />
              </span>
              <p className="font-bold text-fyte-ink">Quick answers</p>
            </div>
            <dl className="mt-4 space-y-4">
              {QUICK.map((item) => (
                <div key={item.q}>
                  <dt className="text-sm font-semibold text-fyte-ink">{item.q}</dt>
                  <dd className="mt-1 text-sm leading-6 text-fyte-muted">{item.a}</dd>
                </div>
              ))}
            </dl>
            <Link href="/help/faqs" className="mt-4 inline-block text-sm font-semibold text-fyte-ink underline-offset-4 hover:underline">
              All questions →
            </Link>
          </div>
        </aside>
      </div>
    </DocShell>
  );
}
