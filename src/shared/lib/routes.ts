const EXACT_PATHS = new Set([
  "/",
  "/about",
  "/privacy",
  "/terms",
  "/help",
  "/help/faqs",
  "/help/contact",
  "/help/getting-started",
  "/sign-up",
  "/sign-in",
  "/dashboard",
  "/diet",
  "/diet/plan",
  "/workout",
  "/workout/plan",
  "/progress",
  "/my-profile",
  "/fyte-connect",
  "/fyte-connect/become-trainer",
]);

const PREFIX_PATHS = ["/sign-in/", "/auth/"];

const SINGLE_SEGMENT_PREFIXES = [
  "/fyte-connect/trainers/",
  "/fyte-connect/checkout/",
  "/fyte-connect/creators/",
];

export function isApiPath(pathname: string) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

export function isKnownAppPath(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (EXACT_PATHS.has(path)) return true;
  if (PREFIX_PATHS.some((prefix) => path.startsWith(prefix))) return true;
  return SINGLE_SEGMENT_PREFIXES.some((prefix) => {
    if (!path.startsWith(prefix)) return false;
    const rest = path.slice(prefix.length);
    return Boolean(rest) && !rest.includes("/");
  });
}
