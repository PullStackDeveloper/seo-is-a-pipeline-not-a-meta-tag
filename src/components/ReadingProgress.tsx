"use client";

import { useEffect, useState } from "react";

/**
 * The ONLY client component on a post page. It needs the browser (scroll
 * position), so it carries the 'use client' boundary — keeping it on this small
 * leaf is what lets the page itself stay a Server Component and keep its
 * generateMetadata. Interactivity is an island, not a flood.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
      setProgress(Math.min(100, Math.max(0, scrolled * 100)));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        insetInline: 0,
        top: 0,
        height: 3,
        width: `${progress}%`,
        background: "var(--accent, #3b82f6)",
        transition: "width 80ms linear",
        zIndex: 50,
      }}
    />
  );
}
