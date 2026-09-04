"use client";

import { useEffect, useState } from "react";
import PageHero, { type HeroPhoto } from "@/components/shared/PageHero";
import { fyte } from "@/shared/lib/ui";

export default function AiThoughtStream({
  photo,
  kicker,
  title,
  subtitle,
  thoughts,
}: {
  photo: HeroPhoto;
  kicker: string;
  title: string;
  subtitle: string;
  thoughts: string[];
}) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (thoughts.length === 0) {
      setDoneCount(0);
      setTyped("");
    }
  }, [thoughts.length]);

  const nextLine = reduceMotion ? null : doneCount < thoughts.length ? thoughts[doneCount] : null;

  useEffect(() => {
    if (!nextLine) return;
    let i = 0;
    const step = nextLine.length > 70 ? 3 : 2;
    const id = window.setInterval(() => {
      i = Math.min(nextLine.length, i + step);
      setTyped(nextLine.slice(0, i));
      if (i >= nextLine.length) {
        window.clearInterval(id);
        setDoneCount((count) => count + 1);
        setTyped("");
      }
    }, 16);
    return () => window.clearInterval(id);
  }, [nextLine]);

  const visible = reduceMotion ? thoughts : thoughts.slice(0, doneCount);
  const active = !reduceMotion && nextLine ? typed : "";
  const caughtUp = visible.length === thoughts.length && !active;

  return (
    <div className={fyte.page}>
      <PageHero photo={photo} kicker={kicker} title={title} subtitle={subtitle} />
      <div className={fyte.content}>
        <section className="rounded-2xl bg-fyte-ink p-6 text-white shadow-card sm:p-8" aria-live="polite" aria-busy>
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Thinking</p>
          </div>

          <ol className="mt-5 space-y-3">
            {visible.map((line, index) => (
              <li key={`${index}-${line}`} className="flex gap-3 text-sm leading-6 text-white/70">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/35" />
                <span>{line}</span>
              </li>
            ))}
            {active ? (
              <li className="flex gap-3 text-sm leading-6 text-white">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                <span>
                  {active}
                  <span className="fyte-caret" aria-hidden />
                </span>
              </li>
            ) : caughtUp ? (
              <li className="flex gap-3 text-sm leading-6 text-white/55">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
                <span>{thoughts.length ? "Working…" : "Starting…"}</span>
              </li>
            ) : null}
          </ol>

          <div className="mt-8 h-px overflow-hidden bg-white/10">
            <div className="fyte-thought-scan h-px w-1/3 bg-white/70" />
          </div>
        </section>
      </div>
    </div>
  );
}
