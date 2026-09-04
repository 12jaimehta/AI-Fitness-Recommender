"use client";

import Link from "next/link";
import { Camera, MessageSquareText, Scale, CalendarCheck, Instagram, Mail } from "lucide-react";
import DocShell, { DocCta } from "@/components/docs/DocShell";
import { FadeInView } from "@/components/shared/Motion";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";

const BELIEFS = [
  {
    title: "A plan is a starting point, not a contract.",
    body: "Real life happens: a wedding, a late night, a vada pav. A good trainer doesn't restart you. They fix the next slot and keep the week on track.",
  },
  {
    title: "Ask, don't assume.",
    body: "Nobody knows how many calories they ate. So the coach asks: how many pav, how much butter, what did you drink. Two or three questions beat a guess.",
  },
  {
    title: "Math, not moralising.",
    body: "A surplus is a number. It becomes steps today or a smaller meal tomorrow. It is never a lecture.",
  },
  {
    title: "Show the real timeline.",
    body: "If a week adds a day to your goal, you see it. Honest numbers are what keep people going past week three.",
  },
];

const LOOP = [
  { icon: MessageSquareText, title: "Tell it what happened", body: "A sentence or a photo. “Ate it” is one tap." },
  { icon: Camera, title: "Answer two questions", body: "Portion, butter, drink. The ones that change the number." },
  { icon: Scale, title: "See the adjustment", body: "Extra steps today, or one lighter meal tomorrow. Nothing else moves." },
  { icon: CalendarCheck, title: "Read the week", body: "Sessions kept, meals kept, weight trend, and what changes next." },
];

export default function AboutUs() {
  return (
    <DocShell
      kicker="About"
      title="A personal trainer's attention, for everyone."
      subtitle="fyteAI is built in India by a small team. The product is a coach that watches your week without judging it."
      photo="workout"
      actions={
        <>
          <Link href="/diet" className={fyte.glassSolid}>
            Try the coach
          </Link>
          <a href="https://www.instagram.com/mhtjai" target="_blank" rel="noreferrer" className={fyte.glass}>
            <Instagram size={16} /> Follow along
          </a>
        </>
      }
    >
      <section className={cn(fyte.card, "p-6 sm:p-10")}>
        <p className={fyte.kicker}>Why this exists</p>
        <p className="mt-3 max-w-3xl text-xl font-semibold leading-relaxed text-fyte-ink sm:text-2xl">
          Everyone who has trained with a good coach knows the feeling: someone notices. Someone remembers you hate
          oats, that Tuesdays are hard, that last week&apos;s weight was a blip. Most people can&apos;t afford that person. We
          think software can do the noticing.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-fyte-ink">How the coach works</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LOOP.map((item, index) => (
            <FadeInView key={item.title} delay={index * 0.04} className={cn(fyte.card, fyte.cardHover)}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fyte-ink text-white">
                <item.icon size={18} />
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-fyte-muted">Step {index + 1}</p>
              <h3 className="mt-1 font-bold text-fyte-ink">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-fyte-muted">{item.body}</p>
            </FadeInView>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-fyte-ink">What we believe</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {BELIEFS.map((item, index) => (
            <FadeInView key={item.title} delay={index * 0.04} className={fyte.card}>
              <h3 className="text-lg font-bold text-fyte-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-fyte-muted">{item.body}</p>
            </FadeInView>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className={fyte.card}>
          <p className={fyte.kicker}>Who builds it</p>
          <p className="mt-2 text-lg font-bold text-fyte-ink">Jai Mehta and a small team</p>
          <p className="mt-1 text-sm leading-6 text-fyte-muted">
            We train, we cook, and we got tired of apps that reset the whole plan every time life got in the way.
          </p>
        </div>
        <div className={fyte.card}>
          <p className={fyte.kicker}>Talk to us</p>
          <a href="mailto:jaimehtaalerts@gmail.com" className="mt-2 inline-flex items-center gap-2 text-lg font-bold text-fyte-ink hover:underline">
            <Mail size={18} /> jaimehtaalerts@gmail.com
          </a>
          <p className="mt-1 text-sm leading-6 text-fyte-muted">Feedback, partnerships, press. A person replies.</p>
        </div>
      </section>

      <DocCta title="See it on your own week." body="Two short forms, then the coach takes over." href="/diet" label="Start free" />
    </DocShell>
  );
}
