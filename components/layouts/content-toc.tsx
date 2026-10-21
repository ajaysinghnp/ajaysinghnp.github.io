"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { ChevronDown, ListTree } from "lucide-react";

import type { ProjectTocItem } from "@/lib/project-toc";

interface ContentTocProps {
  items: ProjectTocItem[];
  aside?: ReactNode; // optional block shown inside the desktop panel
  asidePosition?: "top" | "bottom";
}

export function ContentToc({ items, aside, asidePosition = "top" }: ContentTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !activeId || nav.scrollHeight <= nav.clientHeight) return;

    const link = nav.querySelector<HTMLElement>(".project-toc-desktop a[aria-current='location']");
    if (!link) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const padding = 48;
    if (linkRect.top >= navRect.top + padding && linkRect.bottom <= navRect.bottom - padding)
      return;

    const target =
      nav.scrollTop + (linkRect.top - navRect.top) - nav.clientHeight / 2 + linkRect.height / 2;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nav.scrollTo({ top: Math.max(0, target), behavior: reduceMotion ? "auto" : "smooth" });
  }, [activeId]);

  useEffect(() => {
    const headings = items.flatMap(function flatten(item): string[] {
      return [item.id, ...item.children.flatMap(flatten)];
    });
    const elements = headings
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element instanceof HTMLElement);

    if (!elements.length) return;

    let frame = 0;
    const updateActiveHeading = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const navigationBottom =
          document.querySelector(".site-navigation")?.getBoundingClientRect().bottom ?? 0;
        const compactHeader = document.querySelector(".project-compact-header");
        const compactHeaderBottom = compactHeader?.getBoundingClientRect().bottom ?? 0;
        const activationLine = Math.max(navigationBottom, compactHeaderBottom, 128) + 8;
        const active = elements
          .filter((element) => element.getBoundingClientRect().top <= activationLine)
          .at(-1);

        setActiveId(active?.id ?? elements[0].id);
      });
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [items]);

  const activateItem = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const renderItems = (entries: ProjectTocItem[], nested = false) => (
    <ul className={nested ? "project-toc-children" : "project-toc-list"}>
      {entries.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "location" : undefined}
            className={[
              "project-toc-link hover:bg-[color-mix(in_srgb,var(--site-accent)_9%,transparent)] hover:site-nav-active",
              nested ? "project-toc-child-link" : "",
              activeId === item.id
                ? "shine-border bg-[color-mix(in_srgb,var(--site-accent)_9%,transparent)] font-semibold site-nav-active"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => activateItem(item.id)}
          >
            {item.title}
          </a>
          {item.children.length > 0 && renderItems(item.children, true)}
        </li>
      ))}
    </ul>
  );

  return (
    <nav ref={navRef} className="project-toc" aria-label="Table of contents">
      <details className="project-toc-mobile">
        <summary>
          <span>
            <ListTree className="h-4 w-4" /> On this page
          </span>
          <ChevronDown className="project-toc-chevron h-4 w-4" />
        </summary>
        {renderItems(items)}
      </details>
      <div className="project-toc-desktop">
        {aside && asidePosition === "top" && (
          <div className="mb-4 border-b border-(--site-surface-border) pb-4">{aside}</div>
        )}
        <p className="project-toc-title">
          <ListTree className="h-4 w-4" /> On this page
        </p>
        {renderItems(items)}
        {aside && asidePosition === "bottom" && (
          <div className="mt-4 border-t border-(--site-surface-border) pt-4">{aside}</div>
        )}
      </div>
    </nav>
  );
}
