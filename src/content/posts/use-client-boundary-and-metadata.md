---
title: The 'use client' boundary is a SEO decision, not a styling one
description: Put 'use client' too high in the tree and you silently lose generateMetadata for the whole route.
date: 2026-06-12T09:00:00.000Z
keywords:
  - use client
  - React Server Components
  - Next.js metadata
  - hydration
  - client boundary
author: Fernando Nunes
image: /og/default.png
---

`generateMetadata` and `metadata` only work in Server Components. The moment you
put `'use client'` at the top of a page so you can use a hook, that route can no
longer export metadata. Next does not error — it just stops emitting your tags.

The fix is to keep the page a Server Component and push the interactivity down
into a small client child:

```tsx
// page.tsx stays a Server Component — metadata still works
import { ReadingProgress } from "@/components/ReadingProgress";

export default async function PostPage({ params }) {
  const { slug } = await params;
  // ...server render...
  return (
    <article>
      <ReadingProgress />   {/* the only 'use client' island */}
      {/* content */}
    </article>
  );
}
```

The rule I follow: `'use client'` goes on the smallest leaf that actually needs
the browser, never on a layout or a page. Interactivity is an island, not a
flood.
