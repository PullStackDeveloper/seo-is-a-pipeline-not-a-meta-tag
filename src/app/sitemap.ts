import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/seo";

// Derived from the SAME source the pages read — so the sitemap can never list a
// post that doesn't exist, or miss one that does. Served at /sitemap.xml.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: posts[0]?.updated ?? posts[0]?.date,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/posts/${post.slug}`),
      lastModified: post.updated ?? post.date,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
