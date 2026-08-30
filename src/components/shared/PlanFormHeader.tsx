"use client";

import Link from "next/link";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";

export default function PlanFormHeader({
  currentLabel,
  currentPlanHref,
  currentPlanText,
}: {
  currentLabel: string;
  currentPlanHref?: string;
  currentPlanText?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 text-left sm:flex-row sm:items-center sm:justify-between">
      <PageBreadcrumb
        className="mb-0"
        items={[{ label: "Home" }, { label: currentLabel }]}
      />
      {currentPlanHref && currentPlanText ? (
        <Link
          href={currentPlanHref}
          className="inline-flex w-fit items-center justify-center rounded-xl border-2 border-[#282828] bg-white px-5 py-2.5 text-sm font-semibold text-[#282828] transition hover:bg-[#282828] hover:text-white"
        >
          {currentPlanText}
        </Link>
      ) : null}
    </div>
  );
}
