export const fyte = {
  page: "min-h-screen bg-fyte-page",
  shell: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12",
  /** Content container that sits directly under a PageHero and pulls up over its fade. */
  content: "relative z-10 mx-auto -mt-8 max-w-6xl px-5 pb-20 sm:px-8",
  card: "rounded-2xl border border-fyte-line/80 bg-fyte-card p-5 shadow-card sm:p-6",
  cardHover: "transition hover:-translate-y-0.5 hover:shadow-card-hover",
  panel: "rounded-xl border border-fyte-line bg-fyte-panel p-4",
  title: "text-lg font-semibold text-fyte-ink",
  kicker: "text-xs font-semibold uppercase tracking-wide text-fyte-muted",
  body: "text-sm leading-6 text-fyte-muted",
  label: "mb-3 block text-sm font-semibold text-fyte-ink",
  primary:
    "inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-fyte-ink px-5 text-sm font-semibold text-white transition hover:bg-[#3a3a3a] disabled:opacity-60 sm:w-auto",
  secondary:
    "inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border-2 border-fyte-ink bg-fyte-card px-5 text-sm font-semibold text-fyte-ink transition hover:bg-fyte-ink hover:text-white disabled:opacity-40 sm:w-auto",
  ghost:
    "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold text-fyte-ink hover:bg-fyte-panel disabled:opacity-40",
  /** Frosted pills for use on dark hero photography (matches the landing page CTA). */
  glass:
    "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/50 hover:bg-white/25 disabled:opacity-50",
  glassSolid:
    "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-5 text-sm font-bold text-fyte-ink transition hover:bg-white/90 disabled:opacity-50",
  /** Small stat tile used in hero asides and summary rows. */
  stat: "rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md",
} as const;
