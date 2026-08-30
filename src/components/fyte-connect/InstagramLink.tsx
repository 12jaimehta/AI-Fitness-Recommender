"use client";

import { instagramDisplay, instagramProfileUrl } from "@/shared/lib/instagram";

export default function InstagramLink({
  handle,
  compact = false,
  className = "",
}: {
  handle?: string | null;
  compact?: boolean;
  className?: string;
}) {
  const href = instagramProfileUrl(handle);
  const label = instagramDisplay(handle);
  if (!href || !label) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open Instagram ${label}`}
      className={`inline-flex items-center justify-center rounded-xl border-2 border-[#282828] bg-white text-sm font-semibold text-[#282828] transition hover:bg-[#282828] hover:text-white ${
        compact ? "px-4 py-2.5" : "px-5 py-2.5"
      } ${className}`}
    >
      Instagram {label}
    </a>
  );
}
