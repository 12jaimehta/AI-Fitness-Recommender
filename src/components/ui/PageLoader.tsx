"use client";

export default function PageLoader({
  title = "Loading...",
  subtitle,
  overlay = false,
}: {
  title?: string;
  subtitle?: string;
  overlay?: boolean;
}) {
  const body = (
    <div
      className={`flex flex-col items-center justify-center bg-gray-50 ${
        overlay ? "min-h-screen" : "min-h-[70vh]"
      }`}
    >
      <div
        className="h-16 w-16 rounded-full border-4 border-[#282828]/20 border-t-[#282828] animate-spin"
        aria-hidden
      />
      <p className="mt-6 text-base tracking-wide text-gray-600">{title}</p>
      {subtitle ? <p className="mt-2 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  );

  if (overlay) {
    return <div className="fixed inset-0 z-60 bg-gray-50">{body}</div>;
  }

  return body;
}
