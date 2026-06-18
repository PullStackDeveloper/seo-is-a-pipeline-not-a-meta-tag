import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { renderMarkdown } from "@/lib/markdown";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { absoluteUrl, SITE } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { ReadingProgress } from "@/components/ReadingProgress";
import { Mermaid } from "@/components/Mermaid";

type Params = Promise<{ slug: string }>;

// Prerender every known post at build time, and 404 anything not in the list —
// a route that isn't generated effectively doesn't exist for the crawler.
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}
export const dynamicParams = false;

// Runs on the server, before render. The metadata reads the SAME post record
// the page body does, so the <title> can never drift from the visible heading.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = absoluteUrl(`/posts/${slug}`);
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      siteName: SITE.name,
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.content);

  // Article structured data — tells search engines this is an article, by whom,
  // and when. Emitted server-side, so it's in the HTML the crawler first sees.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@type": "Person", name: post.author },
    keywords: post.keywords.join(", "),
    mainEntityOfPage: absoluteUrl(`/posts/${post.slug}`),
    image: absoluteUrl(post.image),
  };

  return (
    <main>
      <ReadingProgress />
      <Mermaid />
      <JsonLd data={jsonLd} />

      <p className="muted">
        <Link href="/">← all posts</Link>
      </p>

      <article>
        <h1>{post.title}</h1>
        <p className="muted">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>{" "}
          · {post.readingTime} · {post.author}
        </p>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </main>
  );
}
