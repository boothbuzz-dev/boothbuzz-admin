/**
 * Read/write helpers for exhibitors.image_urls (jsonb array of URL strings in Postgres).
 */

/** Dedupe, trim, keep only fetchable URL shapes for DB + UI. */
export function normalizeExhibitorImageUrlsForWrite(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    if (typeof u !== 'string') continue;
    const t = u.trim();
    if (!t || t.startsWith('blob:')) continue;
    if (!(t.startsWith('http://') || t.startsWith('https://') || t.startsWith('/'))) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/**
 * Value sent to Supabase for `image_urls` (jsonb column).
 * Always a JSON array; never null so NOT NULL + DEFAULT '[]' work.
 */
export function exhibitorImageUrlsColumnValue(urls: string[]): string[] {
  return normalizeExhibitorImageUrlsForWrite(urls);
}
