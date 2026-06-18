import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO 8601
  updated?: string; // ISO 8601
  keywords: string[];
  author: string;
  image: string;
  readingTime: string;
  draft: boolean;
  content: string; // raw markdown body
};

const REQUIRED_FIELDS = ["title", "description", "date"] as const;

function estimateReadingTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function readPost(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), "utf8");
  const { data, content } = matter(raw);

  // Frontmatter is the single source of truth — fail loud at build time if a
  // post is missing a field the SEO pipeline depends on, instead of shipping a
  // page with a blank <title>.
  const missing = REQUIRED_FIELDS.filter((field) => !data[field]);
  if (missing.length) {
    throw new Error(`Post "${slug}" is missing required frontmatter: ${missing.join(", ")}`);
  }

  const keywords = Array.isArray(data.keywords)
    ? data.keywords
    : String(data.keywords ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  return {
    slug,
    title: data.title,
    description: data.description,
    date: new Date(data.date).toISOString(),
    updated: data.updated ? new Date(data.updated).toISOString() : undefined,
    keywords,
    author: data.author ?? "Fernando Nunes",
    image: data.image ?? "/og/default.png",
    readingTime: estimateReadingTime(content),
    draft: Boolean(data.draft),
    content,
  };
}

/** All published posts, newest first. Drafts are excluded everywhere. */
export function getAllPosts(): Post[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(readPost)
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(POSTS_DIR, file))) return null;
  const post = readPost(file);
  return post.draft ? null : post;
}

export function getAllSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
