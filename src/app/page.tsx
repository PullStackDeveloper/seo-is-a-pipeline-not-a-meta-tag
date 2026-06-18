import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { SITE } from "@/lib/seo";

// Server Component: the post list is in the initial HTML the crawler reads.
export default function Home() {
  const posts = getAllPosts();
  return (
    <main>
      <h1>{SITE.name}</h1>
      <p className="muted">{SITE.description}</p>

      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`}>
              <strong>{post.title}</strong>
            </Link>
            <p style={{ margin: ".35rem 0 0" }}>{post.description}</p>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              · {post.readingTime}
            </time>
          </li>
        ))}
      </ul>
    </main>
  );
}
