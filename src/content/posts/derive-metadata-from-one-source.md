---
title: One source of truth for metadata in the Next.js App Router
description: Why per-page metadata in Next.js should be derived from your content, never hand-written twice.
date: 2026-06-10T09:00:00.000Z
keywords:
  - Next.js App Router
  - generateMetadata
  - metadataBase
  - canonical URL
  - Open Graph
author: Fernando Nunes
image: /og/default.png
---

In the App Router, `generateMetadata` runs on the server, per route. That is the
whole point: the crawler reads the HTML the server produced, so the metadata has
to exist *before* the page renders — not in a `useEffect`, not on the client.

The mistake I see most is writing the `<title>` and description twice: once in
the visible page, once in the metadata. They drift within a week. Instead, both
read the same record:

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = absoluteUrl(`/posts/${slug}`);
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: { type: "article", url, publishedTime: post.date },
  };
}
```

`absoluteUrl` exists because `canonical` and Open Graph URLs must be absolute.
That is also why `metadataBase` lives in the root layout — set it once, and
every relative image or URL resolves against it.
