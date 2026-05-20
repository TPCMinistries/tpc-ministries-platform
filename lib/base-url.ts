// Canonical base URL for emails, canonical tags, sitemaps, internal fetches.
// Prefers NEXT_PUBLIC_SITE_URL (set per-env in Vercel); falls back to the
// legacy NEXT_PUBLIC_URL var; finally to the production domain so emails and
// SEO tags never leak localhost into production.

const PROD_FALLBACK = 'https://tpcmin.org'

export function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL
    || process.env.NEXT_PUBLIC_URL
    || PROD_FALLBACK
  return url.replace(/\/+$/, '')
}
