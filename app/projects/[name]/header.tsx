"use client";

import { ProjectDescription } from "@/components/project-description";
import { socialMedia } from "@/data/social";
import { fetchProjectFromApi } from "@/lib/projects-client";
import type { Project } from "@/types/github";
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
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";

interface Props {
  project_name: string;
}

const formatCount = (count: number) =>
  Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(count);

const ProjectHeader = ({ project_name }: Props) => {
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
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
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
          className="inline-flex items-center gap-2 text-sm text-[var(--site-accent)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-[var(--site-text)]">
          {error ? "Project details are unavailable." : "Project not found."}
        </h1>
        {error && <p className="mt-3 resume-muted">Please try again in a moment.</p>}
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
      <section ref={sectionRef} className="project-overview-section pt-5">
        {!manuallyCollapsed && (
          <>
            <Link
              href="/projects"
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--site-surface-border)] px-4 py-2 text-sm text-[var(--site-muted)] transition hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
            >
              <ArrowLeft className="h-4 w-4" />
              All projects
            </Link>

            <div className="shine-border-hover overflow-hidden resume-surface rounded-2xl p-6 sm:p-9 lg:p-12">
              <div className="section-code">Project / {project.visibility}</div>
              <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div>
                  <h1 className="max-w-4xl text-4xl leading-tight font-semibold tracking-[-0.055em] break-words text-[var(--site-text)] sm:text-6xl">
                    {title}
                  </h1>
                  {project.description && (
                    <ProjectDescription className="mt-5 max-w-3xl text-base leading-8 resume-lead sm:text-lg">
                      {project.description}
                    </ProjectDescription>
                  )}
                </div>
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

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--site-border)] pt-5">
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
                    <Icon className="h-4 w-4 text-[var(--site-accent)]" />
                    <span className="font-medium text-[var(--site-text)]">
                      {formatCount(value)}
                    </span>
                    <span>{label}</span>
                  </span>
                ))}
                <Link
                  href={socialMedia.github.href}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-2 text-sm text-[var(--site-accent)] hover:underline"
                >
                  GitHub profile <ArrowUpRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setManuallyCollapsed(true)}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm resume-muted transition hover:text-[var(--site-accent)]"
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
            className="fixed top-[4.75rem] left-1/2 z-40 flex w-[80%] -translate-x-1/2 items-center justify-between gap-2 rounded-xl border project-compact-header px-3 py-2 shadow-xl sm:gap-4 sm:px-5"
          >
            <Link
              href="/projects"
              className="inline-flex shrink-0 items-center gap-2 text-sm text-[var(--site-muted)] transition hover:text-[var(--site-accent)]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">All projects</span>
            </Link>

            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--site-text)] sm:text-base">
              {title}
            </h2>

            <Link
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[var(--site-accent)] transition hover:underline sm:text-sm"
            >
              <span className="hidden sm:inline">View on GitHub</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              aria-label="Expand project overview"
              title="Show project overview"
              onClick={scrollBackToOverview}
              className="shine-border-hover site-icon-button inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border site-control border-[var(--site-surface-border)] text-[var(--site-muted)] transition hover:bg-cyan-400/[0.14] hover:text-cyan-600"
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
