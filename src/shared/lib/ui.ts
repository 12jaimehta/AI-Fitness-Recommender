export const fyte = {
  page: "min-h-screen bg-fyte-page",
  shell: "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12",
  card: "rounded-2xl border border-fyte-line bg-fyte-card p-5 sm:p-6",
  panel: "rounded-xl border border-fyte-line bg-fyte-panel p-4",
  title: "text-lg font-semibold text-fyte-ink",
  kicker: "text-xs font-semibold uppercase tracking-wide text-fyte-muted",
  body: "text-sm leading-6 text-fyte-muted",
  label: "mb-3 block text-sm font-semibold text-fyte-ink",
  primary:
    "inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-xl bg-fyte-ink px-5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto",
  secondary:
    "inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-xl border-2 border-fyte-ink bg-fyte-card px-5 text-sm font-semibold text-fyte-ink disabled:opacity-40 sm:w-auto",
  ghost:
    "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-xl px-4 text-sm font-semibold text-fyte-ink hover:bg-fyte-panel disabled:opacity-40",
} as const;
