import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} aria-hidden />;
}

/** Dark hero placeholder matching PageHero's footprint. */
export function HeroSkeleton({ size = "md", aside = false }: { size?: "sm" | "md"; aside?: boolean }) {
  return (
    <div className={`bg-[#161616] ${size === "sm" ? "pt-28 pb-10 lg:pt-32 lg:pb-12" : "pt-32 pb-14 lg:pt-36 lg:pb-20"}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="h-3 w-20 animate-pulse rounded bg-white/15" />
          <div className="mt-4 h-10 w-72 max-w-full animate-pulse rounded-lg bg-white/15 sm:h-12" />
          <div className="mt-4 h-4 w-96 max-w-full animate-pulse rounded bg-white/10" />
        </div>
        {aside ? <div className="h-16 w-full animate-pulse rounded-2xl bg-white/10 lg:w-80" /> : null}
      </div>
    </div>
  );
}

function PageShell({
  children,
  hero = "md",
  aside = false,
  width = "max-w-6xl",
}: {
  children: ReactNode;
  hero?: "sm" | "md";
  aside?: boolean;
  width?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSkeleton size={hero} aside={aside} />
      <div className={`relative z-10 mx-auto -mt-8 ${width} px-5 pb-20 sm:px-8`}>{children}</div>
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-card sm:p-6 ${className}`}>{children}</div>;
}

function Row() {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3.5 w-28" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-16 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function CoachSkeleton() {
  return (
    <Card className="mb-5">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-5 w-3/4 max-w-md" />
    </Card>
  );
}

export function FillBarsSkeleton({ bars = 3 }: { bars?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: bars }, (_, i) => (
        <div key={i}>
          <div className="flex justify-between gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="mt-2 h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-2 h-4 w-20" />
        </div>
        <Skeleton className="h-7 w-10" />
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}

export function DashboardSkeleton() {
  return <ProgressSkeleton />;
}

export function ProgressSkeleton() {
  return (
    <PageShell aside width="max-w-2xl">
      <Card>
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-10" />
        </div>
        <div className="mt-2 divide-y divide-gray-200">
          <Row />
          <Row />
          <Row />
        </div>
      </Card>
      <Card className="mt-4">
        <Skeleton className="h-5 w-20" />
        <Row />
      </Card>
      <Card className="mt-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-2 h-4 w-56" />
      </Card>
    </PageShell>
  );
}

export function TrainersSkeleton() {
  return (
    <PageShell aside>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-1.5 h-3 w-20" />
              </div>
            </div>
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-2/3" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-5 h-10 w-20 rounded-xl" />
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

export function TrainerProfileSkeleton() {
  return (
    <PageShell aside>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <Skeleton className="h-3 w-12" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <div className="mt-5 flex gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </Card>
        <Card>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-5 h-12 w-full rounded-xl" />
          <Skeleton className="mt-4 h-24 w-full rounded-xl" />
          <Skeleton className="mt-5 h-11 w-full rounded-xl" />
        </Card>
      </div>
    </PageShell>
  );
}

export function FormPageSkeleton() {
  return (
    <PageShell hero="sm" aside width="max-w-2xl">
      <Card className="p-6 sm:p-8">
        <Skeleton className="mb-8 h-1 w-full rounded-full" />
        <div className="space-y-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Skeleton className="mb-2 h-4 w-16" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-16" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-24" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>
        <div className="mt-10 flex justify-end">
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      </Card>
    </PageShell>
  );
}

export function ProfileSkeleton() {
  return (
    <PageShell aside width="max-w-3xl">
      <Card className="p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={i === 0 || i === 5 ? "sm:col-span-2" : ""}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-24 w-full rounded-xl" />
        <Skeleton className="mt-8 h-11 w-40 rounded-xl" />
      </Card>
    </PageShell>
  );
}

export function BecomeTrainerSkeleton() {
  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Card>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </Card>
        <Card>
          <Skeleton className="mx-auto h-24 w-24 rounded-full" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl sm:col-span-2" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="mt-8 h-11 w-48 rounded-xl" />
        </Card>
      </div>
    </PageShell>
  );
}

export function PlanResultSkeleton() {
  return (
    <PageShell aside>
      <div className="mb-4 flex items-end justify-between">
        <Skeleton className="h-7 w-40" />
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-12 rounded-full" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-6 w-64 max-w-full" />
              </div>
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
            <div className="mt-4 flex gap-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

export function CheckoutSkeleton() {
  return (
    <PageShell aside>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
        </Card>
        <Card>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-3 h-9 w-28" />
          <Skeleton className="mt-5 h-11 w-full rounded-xl" />
        </Card>
      </div>
    </PageShell>
  );
}
