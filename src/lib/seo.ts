/**
 * Single place where the site's identity lives. Everything SEO-related —
 * metadataBase, canonical URLs, sitemap, robots, OG images — reads from here,
 * so there is exactly one URL to change when the domain moves.
 */
export const SITE = {
  name: "Next.js SEO Pipeline",
  title: "Next.js SEO Pipeline — a hands-on companion repo",
  description:
    "A minimal Next.js App Router blog that derives every SEO artifact — metadata, JSON-LD, sitemap, robots, OG images — from one markdown source of truth.",
  // Override per-environment with NEXT_PUBLIC_SITE_URL (see .env.example).
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nextjs-seo-pipeline.example.com").replace(/\/+$/, ""),
  author: "Fernando Nunes",
  locale: "en_US",
} as const;

/** Build an absolute URL — required for canonical links and OG/Twitter images. */
export function absoluteUrl(pathname = ""): string {
  if (!pathname) return SITE.url;
  return `${SITE.url}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
