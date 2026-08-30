export function clampSize(min: number, max: number): string {
  const width = typeof window !== "undefined" ? window.innerWidth : 1200;
  if (width < 768) return `${min}px`;
  if (width > 1200) return `${max}px`;
  return `${min + (max - min) * ((width - 768) / (1200 - 768))}px`;
}

export function isMobile(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 768;
}
