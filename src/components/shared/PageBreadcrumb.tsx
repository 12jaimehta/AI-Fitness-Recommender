"use client";

import Link from "next/link";
import { useUser } from "@/lib/hooks/use-user";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function PageBreadcrumb({
  items,
  className = "mb-8",
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  const { isSignedIn } = useUser();
  const homeHref = isSignedIn ? "/dashboard" : "/";
  const resolved = items.map((item) =>
    item.label === "Home" ? { ...item, href: homeHref } : item
  );

  return (
    <nav aria-label="Breadcrumb" className={`text-left ${className}`}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        {resolved.map((item, index) => {
          const isLast = index === resolved.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span className="text-gray-300">/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-[#282828]">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "font-medium text-[#282828]" : ""}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
