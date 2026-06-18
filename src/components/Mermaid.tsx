"use client";

import { useEffect } from "react";

/**
 * Renders any <pre class="mermaid"> in the page into SVG, on the client.
 * Mermaid is imported dynamically inside the effect so it never runs during
 * SSR (it touches `document`) — the diagram source still ships as readable text
 * in the prerendered HTML, the drawing just happens after hydration.
 *
 * Each block is rendered on its own with try/catch, so one diagram failing to
 * parse can't take the others down (and the error is logged, not swallowed).
 */
export function Mermaid() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { default: mermaid } = await import("mermaid");
      if (cancelled) return;

      mermaid.initialize({ startOnLoad: false, theme: "dark" });

      const blocks = Array.from(document.querySelectorAll<HTMLElement>("pre.mermaid"));
      for (let i = 0; i < blocks.length; i++) {
        const el = blocks[i];
        if (cancelled || el.dataset.processed) continue;
        const source = (el.textContent ?? "").trim();
        try {
          const { svg } = await mermaid.render(`mermaid-svg-${i}`, source);
          if (cancelled) return;
          el.innerHTML = svg;
          el.dataset.processed = "true";
        } catch (err) {
          console.error(`Mermaid: failed to render diagram #${i}`, err);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
