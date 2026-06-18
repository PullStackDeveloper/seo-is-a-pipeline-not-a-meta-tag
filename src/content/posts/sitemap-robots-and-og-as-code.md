---
title: Sitemap, robots and OG images are code — generate them
description: A hand-maintained sitemap drifts from reality. Derive it from the same source the pages read.
date: 2026-06-14T09:00:00.000Z
keywords:
  - Next.js sitemap
  - robots.txt
  - opengraph-image
  - next/og
  - SEO automation
author: Fernando Nunes
image: /og/default.png
---

A sitemap you edit by hand lies the day after you forget to update it. In the
App Router, `sitemap.ts` is a function — so point it at the same content source
your pages use and it can never disagree with them:

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  return getAllPosts().map((p) => ({
    url: absoluteUrl(`/posts/${p.slug}`),
    lastModified: p.updated ?? p.date,
  }));
}
```

`robots.ts` is the same idea, and `opengraph-image.tsx` with `next/og` renders a
real PNG per post at build time — no design tool, no stale asset committed to the
repo. Every SEO artifact comes out of one pipeline, reading one source of truth.
