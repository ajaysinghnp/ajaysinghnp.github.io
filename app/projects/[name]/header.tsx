"use client";

import { socialMedia } from "@/data/social";
import { fetchProjectFromApi } from "@/lib/projects-client";
import type { Project } from "@/types/github";
import { ArrowLeft, ArrowUpRight, Eye, GitBranch, GitFork, Star } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

interface Props {
  project_name: string;
}

const formatCount = (count: number) =>
  Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(count);

const ProjectHeader = ({ project_name }: Props) => {
  const {
    data: project,
    error,
    isLoading,
  } = useSWR<Project | null>(
    `/api/projects/${encodeURIComponent(project_name)}`,
    () => fetchProjectFromApi(project_name),
  );

  if (isLoading) {
    return (
      <section role="status" className="resume-panel my-8 animate-pulse rounded-2xl p-8">
        <p className="resume-muted">Loading project details...</p>
      </section>
    );
  }

  if (error || !project) {
    return (
      <section role="status" className="resume-panel my-8 rounded-2xl p-8">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--site-accent)] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-[var(--site-text)]">
          {error ? "Project details are unavailable." : "Project not found."}
        </h1>
        {error && <p className="resume-muted mt-3">Please try again in a moment.</p>}
      </section>
    );
  }

  const stats = [
    { label: "Stars", value: project.stargazers_count, icon: Star },
    { label: "Forks", value: project.forks, icon: GitFork },
    { label: "Watchers", value: project.subscribers_count, icon: Eye },
    { label: "Open issues", value: project.open_issues, icon: GitBranch },
  ].filter((stat): stat is typeof stat & { value: number } => stat.value !== undefined);

  return (
    <section className="pt-5">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-muted)] transition hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
      >
        <ArrowLeft className="h-4 w-4" />
        All projects
      </Link>

      <div className="resume-panel mt-6 overflow-hidden rounded-2xl p-6 sm:p-9 lg:p-12">
        <div className="section-code">Project / {project.visibility}</div>
        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h1 className="max-w-4xl break-words text-4xl font-semibold leading-tight tracking-[-0.055em] text-[var(--site-text)] sm:text-6xl">
              {project.title.replaceAll("-", " ")}
            </h1>
            {project.description && (
              <p className="resume-lead mt-5 max-w-3xl text-base leading-8 sm:text-lg">
                {project.description}
              </p>
            )}
          </div>
          <Link
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="glow-action inline-flex w-fit items-center gap-2 rounded px-5 py-3 text-sm font-semibold text-[#090b0d]"
          >
            <GitBranch className="h-4 w-4" />
            View on GitHub
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--site-border)] pt-5">
          <span className="resume-muted text-sm">
            Updated {new Date(project.updated_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </span>
          {stats.map(({ label, value, icon: Icon }) => (
            <span key={label} className="resume-muted inline-flex items-center gap-2 text-sm" title={`${value} ${label.toLowerCase()}`}>
              <Icon className="h-4 w-4 text-[var(--site-accent)]" />
              <span className="font-medium text-[var(--site-text)]">{formatCount(value)}</span>
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
        </div>
      </div>
    </section>
  );
};

export default ProjectHeader;
