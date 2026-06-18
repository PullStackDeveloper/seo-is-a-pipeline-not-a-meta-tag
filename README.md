# Next.js SEO Pipeline

A minimal **Next.js 16 (App Router)** blog where every SEO artifact is *derived
from one source of truth* — the markdown files in `src/content/posts`. Nothing
SEO-related is written twice, and nothing is maintained by hand.

This is the companion repo to the article *"SEO in the Next.js App Router isn't a
meta tag — it's a pipeline."*

## The source of truth

Each post is a markdown file with frontmatter:

```
src/content/posts/<slug>.md
```

`src/lib/posts.ts` reads them, validates required fields, and is the only thing
the rest of the app talks to.

## What's derived from it

| Concern | Where | Reads from |
| --- | --- | --- |
| Per-page metadata + canonical | `app/posts/[slug]/page.tsx` → `generateMetadata` | `getPostBySlug` |
| `metadataBase` (absolute URLs) | `app/layout.tsx` | `lib/seo.ts` |
| Article structured data (JSON-LD) | `components/JsonLd.tsx` | the post record |
| OG image (real PNG per post) | `app/posts/[slug]/opengraph-image.tsx` (`next/og`) | the post record |
| Prerendered routes | `generateStaticParams` + `dynamicParams = false` | `getAllSlugs` |
| `sitemap.xml` | `app/sitemap.ts` | `getAllPosts` |
| `robots.txt` | `app/robots.ts` | `lib/seo.ts` |

## The `'use client'` boundary

`app/posts/[slug]/page.tsx` stays a Server Component so `generateMetadata` works.
The only client island is `components/ReadingProgress.tsx`. Move `'use client'`
up to the page and you silently lose metadata for the whole route.

## The pipeline guard

`scripts/check-seo.mjs` validates the source of truth (required frontmatter, no
duplicate slugs, description length). It runs as `prebuild` and in CI
(`.github/workflows/seo-check.yml`), so a post with broken SEO never builds.

## Run it

```bash
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL
npm install
npm run dev                  # http://localhost:3000
npm run seo:check            # validate posts
npm run build                # build + prove every SEO artifact is produced
```

After a build, inspect the artifacts:

- `/sitemap.xml`, `/robots.txt`
- view source on any `/posts/<slug>` → `<title>`, canonical, OG tags, JSON-LD
- `/posts/<slug>/opengraph-image` → the generated PNG
