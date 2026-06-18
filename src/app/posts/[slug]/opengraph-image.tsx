import { ImageResponse } from "next/og";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { SITE } from "@/lib/seo";

// Prerender one OG image per post at build time, matching the page routes.
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// File-convention OG image: Next auto-wires this into the route's metadata, and
// next/og renders a real 1200x630 PNG per post at build time — no design tool,
// no stale asset committed to the repo.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Article cover";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? SITE.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0b0c10 0%, #111827 100%)",
          color: "#e6e8eb",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#3b82f6", letterSpacing: 1 }}>{SITE.name}</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>{title}</div>
        <div style={{ fontSize: 26, color: "#9aa3ad" }}>{SITE.author}</div>
      </div>
    ),
    { ...size },
  );
}
