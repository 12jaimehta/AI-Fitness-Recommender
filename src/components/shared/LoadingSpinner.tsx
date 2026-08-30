"use client";

export default function LoadingSpinner() {
  return (
    <div
      className="w-16 h-16 rounded-full border-4 border-[#282828]/20 border-t-[#282828] animate-spin"
      aria-label="Loading"
    />
  );
}
