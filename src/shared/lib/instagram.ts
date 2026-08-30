export function normalizeInstagramHandle(value: string | null | undefined) {
  const raw = (value || "").trim();
  if (!raw) return null;
  const cleaned = raw
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .replace(/[^a-zA-Z0-9._]/g, "")
    .slice(0, 30);
  return cleaned || null;
}

export function instagramProfileUrl(handle: string | null | undefined) {
  const normalized = normalizeInstagramHandle(handle);
  if (!normalized) return null;
  return `https://www.instagram.com/${normalized}/`;
}

export function instagramDisplay(handle: string | null | undefined) {
  const normalized = normalizeInstagramHandle(handle);
  return normalized ? `@${normalized}` : null;
}
