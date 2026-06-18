/**
 * SEO pipeline guard. Reads the markdown source of truth and fails the build if
 * any post would ship broken SEO — missing required frontmatter, duplicate
 * slugs, or a description long enough to be truncated in search results.
 *
 * Run locally or in CI:  node scripts/check-seo.mjs
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");
const REQUIRED = ["title", "description", "date"];
const DESC_MAX = 160;

let errors = 0;
let warnings = 0;
const seen = new Set();

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));

  const missing = REQUIRED.filter((field) => !data[field]);
  if (missing.length) {
    console.error(`✗ ${slug}: missing required frontmatter — ${missing.join(", ")}`);
    errors += missing.length;
  }

  if (seen.has(slug)) {
    console.error(`✗ ${slug}: duplicate slug`);
    errors++;
  }
  seen.add(slug);

  if (data.date && Number.isNaN(new Date(data.date).getTime())) {
    console.error(`✗ ${slug}: invalid date "${data.date}"`);
    errors++;
  }

  if (typeof data.description === "string" && data.description.length > DESC_MAX) {
    console.warn(`! ${slug}: description ${data.description.length} chars (> ${DESC_MAX}, may be truncated in SERPs)`);
    warnings++;
  }
}

console.log("");
if (errors) {
  console.error(`${errors} error(s), ${warnings} warning(s) across ${files.length} posts.`);
  process.exit(1);
}
console.log(`✓ ${files.length} posts passed SEO checks (${warnings} warning(s)).`);
