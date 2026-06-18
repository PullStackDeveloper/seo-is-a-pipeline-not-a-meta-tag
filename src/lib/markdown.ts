import { Marked } from "marked";
import markedShiki from "marked-shiki";
import { createHighlighter, type Highlighter } from "shiki";

// Syntax highlighting runs at build time (SSG): Shiki turns code blocks into
// HTML with inline colors, so the highlighted code is in the prerendered HTML
// the crawler reads — no client-side JS, no flash of unstyled code.
const THEME = "material-theme-ocean";
const LANGS = ["ts", "tsx", "js", "jsx", "bash", "json", "yaml", "css", "html", "md"];

let highlighterPromise: Promise<Highlighter> | null = null;
function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({ themes: [THEME], langs: LANGS });
  }
  return highlighterPromise;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

let markedPromise: Promise<Marked> | null = null;
function getMarked() {
  if (!markedPromise) {
    markedPromise = (async () => {
      const highlighter = await getHighlighter();
      const loaded = new Set(highlighter.getLoadedLanguages());
      return new Marked().use(
        markedShiki({
          highlight(code, lang) {
            // Mermaid blocks aren't highlighted — they're emitted as raw text in
            // a <pre class="mermaid"> for the client Mermaid runner to draw.
            if (lang === "mermaid") {
              return `<pre class="mermaid">${escapeHtml(code)}</pre>`;
            }
            const language = lang && loaded.has(lang) ? lang : "text";
            return highlighter.codeToHtml(code, { lang: language, theme: THEME });
          },
        }),
      );
    })();
  }
  return markedPromise;
}

export async function renderMarkdown(markdown: string): Promise<string> {
  const marked = await getMarked();
  return marked.parse(markdown) as Promise<string>;
}
