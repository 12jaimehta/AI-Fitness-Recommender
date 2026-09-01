import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} aria-hidden />;
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">{children}</div>
    </div>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 ${className}`}>{children}</div>;
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
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-8 w-48 sm:h-9" />
      <Skeleton className="mt-2 h-4 w-28" />
      <CoachSkeleton />
      <Card className="mb-5">
        <Skeleton className="h-4 w-16" />
        <div className="mt-4">
          <FillBarsSkeleton />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </Card>
      <div className="grid gap-2 sm:grid-cols-2">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </PageShell>
  );
}

export function ProgressSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-6 h-8 w-40 sm:h-9" />
      <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      <div className="mt-8 border-b border-gray-200 pb-6" />
      <Card className="mb-6">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-2 h-4 w-64 max-w-full" />
        <Skeleton className="mt-4 h-12 w-full max-w-sm rounded-xl" />
      </Card>
      <Card className="mb-6">
        <Skeleton className="h-5 w-40" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </Card>
      <div className="mt-6 grid max-w-xl grid-cols-2 gap-3">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
      <Card className="mt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
          <div>
            <Skeleton className="h-5 w-44" />
            <Skeleton className="mt-2 h-4 w-64 max-w-full" />
          </div>
          <div className="grid w-full grid-cols-3 gap-2 lg:w-auto lg:min-w-[24rem]">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <Skeleton className="mt-4 h-64 w-full rounded-xl" />
      </Card>
      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </PageShell>
  );
}

export function TrainersSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-6 h-8 w-36 sm:h-9" />
      <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      <div className="mt-8 border-b border-gray-200 pb-6" />
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
      <Skeleton className="mb-4 h-6 w-36" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i}>
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="mt-4 h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-full" />
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
    <PageShell>
      <Skeleton className="h-4 w-40" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr,1fr]">
        <div>
          <div className="mb-5 flex items-start gap-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <div className="mt-6 flex gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
        <Card>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-4 h-11 w-full rounded-xl" />
          <Skeleton className="mt-4 h-24 w-full rounded-xl" />
          <Skeleton className="mt-4 h-11 w-full rounded-xl" />
        </Card>
      </div>
    </PageShell>
  );
}

export function FormPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <Card className="mb-6">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
          <Skeleton className="mt-2 h-4 w-2/3 max-w-lg" />
        </Card>
        <div className="flex flex-col lg:flex-row lg:gap-16">
          <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-gray-200 lg:pr-10">
            <Skeleton className="mb-12 h-8 w-56 border-b border-gray-200 pb-4" />
            <div className="space-y-8 pt-12">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 pt-0.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-2 h-3 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </aside>
          <main className="flex-1 lg:pt-4">
            <div className="mb-8 flex items-center gap-6 overflow-hidden border-b border-gray-200 pb-3 lg:hidden">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex shrink-0 items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
            <div className="mb-8 flex flex-col items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1 h-8 w-64 max-w-full" />
              <Skeleton className="mt-2 h-4 w-72 max-w-full" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-12 w-full rounded-xl" />
            <Skeleton className="mt-8 h-4 w-40" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Skeleton className="h-36 w-full rounded-2xl" />
              <Skeleton className="h-36 w-full rounded-2xl" />
            </div>
            <div className="mt-10 flex justify-end">
              <Skeleton className="h-11 w-28 rounded-xl" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-6 h-8 w-40 sm:h-9" />
      <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      <div className="mt-8 border-b border-gray-200 pb-6" />
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={i === 0 ? "sm:col-span-2" : ""}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-24 w-full rounded-xl" />
        <Skeleton className="mt-6 h-11 w-40 rounded-xl" />
      </Card>
    </PageShell>
  );
}

export function BecomeTrainerSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-6 h-8 w-56 sm:h-9" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      <div className="mt-8 border-b border-gray-200 pb-6" />
      <div className="grid gap-8 lg:grid-cols-[1fr,1.4fr]">
        <Card>
          <Skeleton className="h-5 w-40" />
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
          <Skeleton className="mt-6 h-11 w-full rounded-xl" />
        </Card>
      </div>
    </PageShell>
  );
}

function PlanItemCardSkeleton() {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-2 h-4 w-56 max-w-full" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
      <Skeleton className="mt-4 h-4 w-28" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
    </article>
  );
}

export function PlanResultSkeleton() {
  return (
    <PageShell>
      <Skeleton className="mb-8 h-4 w-48" />
      <header className="mb-8 border-b border-gray-200 pb-6">
        <Skeleton className="h-8 w-52 sm:h-9" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      </header>
      <Card className="mb-8">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-lg" />
        <Skeleton className="mt-4 h-10 w-44 rounded-xl" />
      </Card>
      <section className="mb-8">
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-2 h-6 w-20" />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-2 h-6 w-20" />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-2 h-6 w-20" />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-2 h-6 w-20" />
          </div>
        </div>
      </section>
      <section className="mb-8">
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="space-y-4">
          <PlanItemCardSkeleton />
          <PlanItemCardSkeleton />
          <PlanItemCardSkeleton />
        </div>
      </section>
      <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6">
        <Skeleton className="h-11 w-36 rounded-xl" />
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
    </PageShell>
  );
}

export function CheckoutSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-4 w-48" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr,1fr]">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-40" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
        </div>
        <Card>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-3 h-8 w-28" />
          <Skeleton className="mt-4 h-11 w-full rounded-xl" />
        </Card>
      </div>
    </PageShell>
  );
}
