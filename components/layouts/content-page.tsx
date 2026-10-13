"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowLeft, Minimize2 } from "lucide-react";

import { PostActions } from "@/components/content/post-actions";
import { ReadingProgress } from "@/components/content/reading-progress";
import { CONTENT_ID } from "@/components/layouts/content-ids";
import { ContentToc } from "@/components/layouts/content-toc";
import type { ProjectTocItem } from "@/lib/project-toc";
import { cn } from "@/lib/utils";

interface Props {
  backHref: string;
  backLabel: string; // e.g. "All posts"
  label: ReactNode; // breadcrumb, left of the header's top row
  chips?: ReactNode; // tags, next to the label
  title: string;
  description?: ReactNode;
  titleAside?: ReactNode; // beside the title on wide screens (e.g. the GitHub button)
  meta?: ReactNode; // left of the meta strip
  metaEnd?: ReactNode; // right of the meta strip, before the compact toggle
  compactLinks?: ReactNode; // extra links in the sticky compact bar
  markdown: string; // what "Copy as Markdown" copies
  fileName: string; // PDF name fallback
  glow?: string; // CSS colour of the header glow
  toc: ProjectTocItem[];
  tocAside?: ReactNode;
  footer?: ReactNode;
  children: ReactNode; // the rendered content
}

export function ContentPage({
  backHref,
  backLabel,
  label,
  chips,
  title,
  description,
  titleAside,
  meta,
  metaEnd,
  compactLinks,
  markdown,
  fileName,
  glow = "var(--site-accent)",
  toc,
  tocAside,
  footer,
  children,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isPastHeader, setIsPastHeader] = useState(false);
  const [manuallyCollapsed, setManuallyCollapsed] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const updateScrollState = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const navigation = document.querySelector(".site-navigation");
    const navigationBottom = navigation?.getBoundingClientRect().bottom ?? 0;
    setIsPastHeader(section.getBoundingClientRect().bottom <= navigationBottom);
  }, []);

  useEffect(() => {
    let frame = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateScrollState);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollBackToOverview = () => {
    setManuallyCollapsed(false);
    sectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "instant" : "smooth",
      block: "start",
    });
  };

  const isCompact = isPastHeader || manuallyCollapsed;
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: "easeOut" as const };

  return (
    <main className="pb-16 resume-shell">
      <ReadingProgress />

      <section ref={sectionRef} className="project-overview-section pt-5">
        {!manuallyCollapsed && (
          <>
            <Link
              href={backHref}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--site-surface-border) px-4 py-2 text-sm text-(--site-muted) transition hover:border-(--site-accent) hover:site-nav-active"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>

            <header className="shine-border-hover relative overflow-hidden resume-surface rounded-2xl p-6 sm:p-9 lg:p-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-25 blur-3xl"
                style={{ background: glow }}
              />

              <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
                  {label}
                  {chips}
                </div>
                <PostActions
                  actions={["markdown", "pdf"]}
                  title={title}
                  markdown={markdown}
                  fallbackName={fileName}
                />
              </div>

              <div
                className={cn(
                  "relative mt-5 grid gap-8",
                  titleAside && "lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end",
                )}
              >
                <div>
                  <h1 className="max-w-4xl text-4xl leading-tight font-semibold tracking-[-0.055em] wrap-break-word text-(--site-text) sm:text-6xl">
                    {title}
                  </h1>
                  {description}
                </div>
                {titleAside && <div className="flex gap-2">{titleAside}</div>}
              </div>

              <div className="relative mt-8 flex flex-wrap items-center gap-2 border-t resume-intro pt-5">
                {meta}
                <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
                  {metaEnd}
                  <button
                    type="button"
                    onClick={() => setManuallyCollapsed(true)}
                    aria-label="Collapse overview"
                    className="inline-flex cursor-pointer items-center gap-1.5 text-sm resume-muted transition hover:site-nav-active"
                  >
                    <Minimize2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Compact header</span>
                  </button>
                </div>
              </div>
            </header>
          </>
        )}
      </section>

      <AnimatePresence>
        {isCompact && (
          <motion.div
            key="content-compact-header"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0, transition }}
            exit={{ opacity: 0, y: -16, transition }}
            className="fixed top-19 left-1/2 z-40 flex w-[80%] -translate-x-1/2 items-center justify-between gap-2 rounded-xl border project-compact-header px-3 py-2 shadow-xl sm:gap-4 sm:px-5"
          >
            <Link
              href={backHref}
              className="inline-flex shrink-0 items-center gap-2 text-sm text-(--site-muted) transition hover:site-nav-active"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>

            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-(--site-text) sm:text-base">
              {title}
            </h2>

            <div className="flex items-center gap-2">
              <PostActions
                actions={["markdown", "pdf"]}
                size="compact"
                title={title}
                markdown={markdown}
                fallbackName={fileName}
              />
              {compactLinks}
            </div>

            <button
              type="button"
              aria-label="Expand overview"
              title="Show overview"
              onClick={scrollBackToOverview}
              className="shine-border-hover site-icon-button inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border site-control border-(--site-surface-border) text-(--site-muted) transition hover:bg-cyan-400/[0.14] hover:text-cyan-600"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={toc.length ? "project-content-layout" : undefined}>
        {toc.length > 0 && <ContentToc items={toc} aside={tocAside} />}
        <div id={CONTENT_ID} className="min-w-0">
          {children}
        </div>
      </div>

      {footer}
    </main>
  );
}
