"use client";
// app/projects/[name]/header.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Eye,
  GitBranch,
  GitFork,
  Minimize2,
  Star,
} from "lucide-react";
import { marked } from "marked";
import useSWR from "swr";

import { ProjectDescription } from "@/components/mdx/project-description";
import type { Position } from "@/components/ui/notification-bubble";
import { Notification } from "@/components/ui/notification-bubble";
import { socialMedia } from "@/data/social";
import { fetchProjectFromApi } from "@/lib/projects-client";
import type { Project } from "@/types/github";

interface Props {
  project_name: string;
  readme?: string;
}

interface NotificationState {
  id: number;
  message: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  position: Position;
}

const formatCount = (count: number) =>
  Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(count);

const ProjectHeader = ({ project_name, readme }: Props) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isPastHeader, setIsPastHeader] = useState(false);
  const [manuallyCollapsed, setManuallyCollapsed] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const {
    data: project,
    error,
    isLoading,
  } = useSWR<Project | null>(`/api/projects/${encodeURIComponent(project_name)}`, () =>
    fetchProjectFromApi(project_name),
  );

  const copyButtonRef = useRef<HTMLButtonElement>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  async function handleCopyMarkdown(content: string) {
    if (!content || content.trim() === "") {
      console.warn("Failed to copy text: No content provided");

      showNotification("Failed to copy. Try again.", copyButtonRef, "bottom-center");

      return;
    }

    try {
      await navigator.clipboard.writeText(content);

      showNotification("Copied to clipboard", copyButtonRef, "bottom-center");
    } catch (error) {
      console.error("Failed to copy text:", error);

      showNotification("Failed to copy. Try again.", copyButtonRef, "bottom-center");
    }
  }

  async function handleDownloadPDF(content: string) {
    if (!content || content.trim() === "") {
      showNotification(
        "Unable to create PDF: no README content found.",
        copyButtonRef,
        "bottom-center",
      );

      return;
    }

    try {
      const htmlContent = await marked.parse(content);

      const printWindow = window.open("", "_blank", "width=900,height=700");

      if (!printWindow) {
        throw new Error("The print window was blocked by the browser.");
      }

      const documentTitle = `${project?.title ?? "project"} README`
        .replaceAll("-", " ")
        .replace(/[^\w\s-]/g, "")
        .trim();

      printWindow.document.write(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${documentTitle}</title>

          <style>
            :root {
              color-scheme: light;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #17202a;
              font-family:
                Inter,
                ui-sans-serif,
                system-ui,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;
              font-size: 15px;
              line-height: 1.7;
            }

            body {
              padding: 48px;
            }

            .document {
              width: 100%;
              max-width: 820px;
              margin: 0 auto;
            }

            .document-header {
              margin-bottom: 42px;
              padding-bottom: 24px;
              border-bottom: 2px solid #d8dee4;
            }

            .document-label {
              margin: 0 0 10px;
              color: #64748b;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.16em;
              text-transform: uppercase;
            }

            h1,
            h2,
            h3,
            h4,
            h5,
            h6 {
              color: #111827;
              line-height: 1.25;
              page-break-after: avoid;
              break-after: avoid;
            }

            h1 {
              margin: 0;
              font-size: 34px;
              letter-spacing: -0.04em;
            }

            h2 {
              margin-top: 36px;
              margin-bottom: 14px;
              padding-bottom: 6px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 24px;
            }

            h3 {
              margin-top: 28px;
              margin-bottom: 10px;
              font-size: 19px;
            }

            h4,
            h5,
            h6 {
              margin-top: 22px;
              margin-bottom: 8px;
              font-size: 16px;
            }

            p {
              margin: 0 0 16px;
              orphans: 3;
              widows: 3;
            }

            ul,
            ol {
              margin: 0 0 18px;
              padding-left: 28px;
            }

            li {
              margin: 5px 0;
            }

            a {
              color: #0369a1;
              text-decoration: underline;
              overflow-wrap: anywhere;
            }

            blockquote {
              margin: 22px 0;
              padding: 12px 18px;
              border-left: 4px solid #38bdf8;
              background: #f1f5f9;
              color: #475569;
              page-break-inside: avoid;
              break-inside: avoid;
            }

            code {
              padding: 2px 5px;
              border-radius: 4px;
              background: #eef2f7;
              color: #334155;
              font-family:
                "SFMono-Regular",
                Consolas,
                "Liberation Mono",
                monospace;
              font-size: 0.9em;
            }

            pre {
              margin: 20px 0;
              padding: 18px;
              overflow-x: auto;
              border-radius: 8px;
              background: #111827;
              color: #f8fafc;
              font-family:
                "SFMono-Regular",
                Consolas,
                "Liberation Mono",
                monospace;
              font-size: 12px;
              line-height: 1.6;
              white-space: pre-wrap;
              overflow-wrap: anywhere;
              page-break-inside: avoid;
              break-inside: avoid;
            }

            pre code {
              padding: 0;
              background: transparent;
              color: inherit;
              font-size: inherit;
            }

            table {
              width: 100%;
              margin: 22px 0;
              border-collapse: collapse;
              font-size: 14px;
              page-break-inside: avoid;
              break-inside: avoid;
            }

            th,
            td {
              padding: 9px 11px;
              border: 1px solid #cbd5e1;
              text-align: left;
              vertical-align: top;
            }

            th {
              background: #f1f5f9;
              color: #1e293b;
              font-weight: 700;
            }

            img {
              display: block;
              max-width: 100%;
              height: auto;
              margin: 20px auto;
              page-break-inside: avoid;
              break-inside: avoid;
            }

            hr {
              margin: 30px 0;
              border: 0;
              border-top: 1px solid #d8dee4;
            }

            @page {
              size: A4;
              margin: 18mm;
            }

            @media print {
              body {
                padding: 0;
              }

              .document {
                max-width: none;
              }

              a {
                color: inherit;
                text-decoration: none;
              }

              a[href^="http"]::after {
                content: " (" attr(href) ")";
                color: #64748b;
                font-size: 0.8em;
                overflow-wrap: anywhere;
              }
            }
          </style>
        </head>

        <body>
          <main class="document">
            <header class="document-header">
              <p class="document-label">Project README</p>
              <h1>${documentTitle}</h1>
            </header>

            <article>
              ${htmlContent}
            </article>
          </main>
        </body>
      </html>
    `);

      printWindow.document.close();

      printWindow.addEventListener("load", () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      });

      showNotification("PDF ready to print or save.", copyButtonRef, "bottom-center");
    } catch (error) {
      console.error("Failed to generate PDF:", error);

      showNotification("Failed to generate PDF. Try again.", copyButtonRef, "bottom-center");
    }
  }

  function showNotification(
    message: string,
    anchorRef: React.RefObject<HTMLButtonElement | null>,
    position: Position = "bottom-right",
  ) {
    setNotification({
      id: Date.now(),
      message,
      anchorRef,
      position,
    });
  }

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
  }, [updateScrollState, project]);

  const scrollBackToOverview = () => {
    setManuallyCollapsed(false);
    sectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "instant" : "smooth",
      block: "start",
    });
  };

  if (isLoading) {
    return (
      <section
        role="status"
        className="shine-border-hover my-8 animate-pulse resume-surface rounded-2xl p-8"
      >
        <p className="resume-muted">Loading project details...</p>
      </section>
    );
  }

  if (error || !project) {
    return (
      <section role="status" className="shine-border-hover my-8 resume-surface rounded-2xl p-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm site-nav-active hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-(--site-text)">
          {error ? "Project details are unavailable." : "Project not found."}
        </h1>
        {error && <p className="mt-3 resume-muted">Please try again in a moment.</p>}
      </section>
    );
  }

  if (readme === undefined || readme === "") {
    return (
      <section role="status" className="shine-border-hover my-8 resume-surface rounded-2xl p-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm site-nav-active hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-(--site-text)">
          Project details are unavailable.
        </h1>
        <p className="mt-3 resume-muted">Please try again in a moment.</p>
      </section>
    );
  }

  const stats = [
    { label: "Stars", value: project.stargazers_count, icon: Star },
    { label: "Forks", value: project.forks, icon: GitFork },
    { label: "Watchers", value: project.subscribers_count, icon: Eye },
    { label: "Open issues", value: project.open_issues, icon: GitBranch },
  ].filter((stat): stat is typeof stat & { value: number } => stat.value !== undefined);

  const isCompact = isPastHeader || manuallyCollapsed;
  const title = project.title.replaceAll("-", " ");
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: "easeOut" as const };

  return (
    <>
      {notification && (
        <Notification
          key={notification.id}
          message={notification.message}
          anchorRef={notification.anchorRef}
          position={notification.position}
          duration={3000}
        />
      )}
      <section ref={sectionRef} className="project-overview-section pt-5">
        {!manuallyCollapsed && (
          <>
            <Link
              href="/projects"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--site-surface-border) px-4 py-2 text-sm text-(--site-muted) transition hover:border-(--site-accent) hover:site-nav-active"
            >
              <ArrowLeft className="h-4 w-4" />
              All projects
            </Link>

            <div className="shine-border-hover relative overflow-hidden resume-surface rounded-2xl p-6 sm:p-9 lg:p-12">
              <div className="absolute right-1 -mt-8">
                <button
                  ref={copyButtonRef}
                  onClick={() => handleCopyMarkdown(readme)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded px-4 py-2 text-sm font-medium site-nav-active hover:bg-(--site-accent)/10"
                >
                  Copy as Markdown
                </button>
                <button
                  onClick={() => handleDownloadPDF(readme)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded px-4 py-2 text-sm font-medium site-nav-active hover:bg-(--site-accent)/10"
                >
                  Download as PDF
                </button>
              </div>
              <div className="section-code">Project / {project.visibility}</div>
              <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                  <h1 className="max-w-4xl text-4xl leading-tight font-semibold tracking-[-0.055em] wrap-break-word text-(--site-text) sm:text-6xl">
                    {title}
                  </h1>
                  {project.description && (
                    <ProjectDescription className="mt-5 max-w-3xl text-base leading-8 resume-lead sm:text-lg">
                      {project.description}
                    </ProjectDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shine-border inline-flex w-fit items-center gap-2 glow-action rounded px-5 py-3 text-sm font-semibold text-[#090b0d] shine-border-contrast"
                  >
                    <GitBranch className="h-4 w-4" />
                    View on GitHub
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t resume-intro pt-5">
                <span className="text-sm resume-muted">
                  Updated{" "}
                  {new Date(project.updated_at).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {stats.map(({ label, value, icon: Icon }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 text-sm resume-muted"
                    title={`${value} ${label.toLowerCase()}`}
                  >
                    <Icon className="h-4 w-4 site-nav-active" />
                    <span className="font-medium text-(--site-text)">{formatCount(value)}</span>
                    <span>{label}</span>
                  </span>
                ))}
                <Link
                  href={socialMedia.github.href}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-2 text-sm site-nav-active hover:underline"
                >
                  GitHub profile <ArrowUpRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setManuallyCollapsed(true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm resume-muted transition hover:site-nav-active"
                  aria-label="Collapse project overview"
                >
                  <Minimize2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Compact header</span>
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <AnimatePresence>
        {isCompact && (
          <motion.div
            key="project-compact-header"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0, transition }}
            exit={{ opacity: 0, y: -16, transition }}
            className="fixed top-19 left-1/2 z-40 flex w-[80%] -translate-x-1/2 items-center justify-between gap-2 rounded-xl border project-compact-header px-3 py-2 shadow-xl sm:gap-4 sm:px-5"
          >
            <Link
              href="/projects"
              className="inline-flex shrink-0 items-center gap-2 text-sm text-(--site-muted) transition hover:site-nav-active"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">All projects</span>
            </Link>

            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-(--site-text) sm:text-base">
              {title}
            </h2>

            <div className="flex gap-2">
              <button
                ref={copyButtonRef}
                onClick={() => handleCopyMarkdown(readme)}
                className="inline-flex cursor-pointer items-center gap-2 rounded px-4 py-2 text-sm font-medium site-nav-active hover:bg-(--site-accent)/10"
              >
                Copy as Markdown
              </button>
              <button
                onClick={() => handleDownloadPDF(readme)}
                className="inline-flex cursor-pointer items-center gap-2 rounded px-4 py-2 text-sm font-medium site-nav-active hover:bg-(--site-accent)/10"
              >
                Download as PDF
              </button>
              <Link
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium site-nav-active transition hover:underline sm:text-sm"
              >
                <span className="hidden sm:inline">View on GitHub</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <button
              type="button"
              aria-label="Expand project overview"
              title="Show project overview"
              onClick={scrollBackToOverview}
              className="shine-border-hover site-icon-button inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border site-control border-(--site-surface-border) text-(--site-muted) transition hover:bg-cyan-400/[0.14] hover:text-cyan-600"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectHeader;
