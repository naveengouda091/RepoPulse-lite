export function toSafeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0
  }).format(toSafeCount(value));
}
