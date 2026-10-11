/** Format kobo integer as ₦ naira string. Always attach ₦ prefix. */
export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/** Parse naira string to kobo integer. */
export function parseNaira(naira: string): number {
  const cleaned = naira.replace(/[₦,\s]/g, '');
  return Math.round(parseFloat(cleaned) * 100);
}

/** Format large numbers with k/M suffix. */
export function formatCompact(kobo: number): string {
  const naira = kobo / 100;
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
  if (naira >= 1_000) return `₦${(naira / 1_000).toFixed(0)}k`;
  return formatNaira(kobo);
}
