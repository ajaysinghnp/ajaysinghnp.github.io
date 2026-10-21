"use client";

import { useEffect, useState } from "react";

import { ArrowDown, ArrowUp } from "lucide-react";

const SHOW_AFTER = 400;
const END_THRESHOLD = 200;

const buttonClass =
  "shine-border-hover site-icon-button site-control inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-(--site-surface-border) text-(--site-muted) shadow-lg transition hover:text-cyan-600";

export function ScrollButtons() {
  const [canGoTop, setCanGoTop] = useState(false);
  const [canGoBottom, setCanGoBottom] = useState(false);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        setCanGoTop(doc.scrollTop > SHOW_AFTER);
        setCanGoBottom(max > SHOW_AFTER && max - doc.scrollTop > END_THRESHOLD);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollTo = (top: number) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };

  if (!canGoTop && !canGoBottom) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2 sm:right-6 sm:bottom-6">
      {canGoTop && (
        <button
          type="button"
          aria-label="Scroll to top"
          title="Go to top"
          onClick={() => scrollTo(0)}
          className={buttonClass}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
      {canGoBottom && (
        <button
          type="button"
          aria-label="Scroll to bottom"
          title="Go to bottom"
          onClick={() => scrollTo(document.documentElement.scrollHeight)}
          className={buttonClass}
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
