import { normalizeExhibitorImageUrlsForWrite } from '../lib/exhibitorImageDb';

/**
 * Static default exhibitor profile image (served from /public).
 * Use getDefaultExhibitorProfileUrl() when persisting to DB so API clients get a stable fetchable URL.
 */
export const DEFAULT_EXHIBITOR_PROFILE_PATH = 'default-exhibitor-profile.svg';

/** Absolute URL to the default avatar, suitable for `portfolio_image_url` in the database. */
export function getDefaultExhibitorProfileUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const base = import.meta.env.BASE_URL || '/';
    const path =
      base === '/' || base === ''
        ? `/${DEFAULT_EXHIBITOR_PROFILE_PATH}`
        : `${base.replace(/\/$/, '')}/${DEFAULT_EXHIBITOR_PROFILE_PATH}`;
    return `${window.location.origin}${path}`;
  }
  return `/${DEFAULT_EXHIBITOR_PROFILE_PATH}`;
}

/** Keep only persisted URLs (http(s) or same-origin path); drop blobs and empty strings. */
export function sanitizeExhibitorImageUrlList(urls: unknown[]): string[] {
  if (!Array.isArray(urls)) return [];
  return normalizeExhibitorImageUrlsForWrite(urls.filter((u): u is string => typeof u === 'string'));
}

/** Reject blob: preview URLs; allow http(s) and app-relative paths for DB fields. */
export function normalizePersistableImageUrl(s: string | null | undefined): string | null {
  const t = (s || '').trim();
  if (!t || t.startsWith('blob:')) return null;
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('/')) return t;
  return null;
}
