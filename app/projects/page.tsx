"use client";

import Link from "next/link";
import { ArrowUpRight, Eye, GitBranch, GitFork, RefreshCw, Star } from "lucide-react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { useMemo } from "react";

import { PROJECT_REPOSITORY_SETTINGS } from "@/data/repos";
import { fetchProjectsFromApi } from "@/lib/projects-client";
import { socialMedia } from "@/data/social";
import type { Project } from "@/types/github";

const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay } }),
};

const compactCount = (count: number) =>
  Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(count);

function distributeProjects(projects: Project[], columnCount: number): Project[][] {
  const columns = Array.from({ length: columnCount }, () => [] as Project[]);

  projects.forEach((project, index) => {
    columns[index % columnCount].push(project);
  });

  return columns;
}

function ProjectCard({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  return (
    <motion.article
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={reveal}
      className={`project-card group relative w-full break-inside-avoid overflow-hidden rounded-xl border transition duration-300 hover:-translate-y-1 ${featured ? "h-full" : ""}`}
    >
      <div aria-hidden="true" className="project-card-glow pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full opacity-40 blur-3xl transition duration-500 group-hover:opacity-100" />
      <Link
        href={`/projects/${project.name}`}
        aria-label={`Open ${project.title}`}
        className="absolute inset-0 z-10 rounded-xl"
      >
        <span className="sr-only">Open project details</span>
      </Link>
      <div className={`pointer-events-none relative z-20 flex h-full flex-col ${featured ? "p-6 sm:p-8" : "p-5 sm:p-6"}`}>
        <div className="flex items-center justify-between">
          <span className="project-card-index font-mono text-xs tracking-[0.14em]">
            ID {project.id}
          </span>
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`View ${project.title} on GitHub`}
            className="project-card-visibility pointer-events-auto relative z-30 flex items-center gap-3 text-[10px] uppercase tracking-[0.12em]"
          >
            <span className="inline-flex items-center gap-1.5" aria-label={`Visibility: ${project.visibility}`}>
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              {project.visibility}
            </span>
            {project.stargazers_count !== undefined && (
              <span className="inline-flex items-center gap-1" title={`${project.stargazers_count} stars`}>
                <Star className="h-3.5 w-3.5" aria-hidden="true" />
                {compactCount(project.stargazers_count)}
              </span>
            )}
            {project.subscribers_count !== undefined && (
              <span className="inline-flex items-center gap-1" title={`${project.subscribers_count} watchers`}>
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                {compactCount(project.subscribers_count)}
              </span>
            )}
            {project.forks !== undefined && (
              <span className="inline-flex items-center gap-1" title={`${project.forks} forks`}>
                <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
                {compactCount(project.forks)}
              </span>
            )}
          </a>
        </div>
        <div className="mt-6">
          <h3 className={`project-card-title ${featured ? "text-3xl sm:text-4xl" : "text-2xl"} font-semibold tracking-[-0.04em] transition`}>
            {project.title}
          </h3>
          <p className={`resume-muted mt-4 ${featured ? "text-base leading-8" : "text-sm leading-7"}`}>
            {project.description || "No description yet. Open the repository to inspect the work."}
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-[var(--site-border)] pt-4">
          <span className="resume-muted text-xs font-medium">
            Updated {new Date(project.updated_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
          </span>
          <span className="project-card-link inline-flex items-center gap-1.5 text-sm transition">
            Read more
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function ProjectsPage() {
  const { data: projects, error, isLoading, mutate } = useSWR<Project[]>(
    "/api/projects",
    fetchProjectsFromApi,
  );
  const orderedProjects = useMemo(
    () => [...(projects ?? [])].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [projects],
  );
  const { featured, selected, remaining } = useMemo(() => {
    const featured = orderedProjects.find((project) => project.name === PROJECT_REPOSITORY_SETTINGS.featuredRepositoryName) ?? orderedProjects[0];
    const selected = orderedProjects
      .filter((project) => project.name !== featured?.name)
      .sort((a, b) =>
        (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0)
        || (b.forks ?? 0) - (a.forks ?? 0)
        || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
      .slice(0, PROJECT_REPOSITORY_SETTINGS.featuredSelectionCount);
    const selectedNames = new Set([featured?.name, ...selected.map((project) => project.name)]);

    return {
      featured,
      selected,
      remaining: orderedProjects
        .filter((project) => !selectedNames.has(project.name))
        .sort(
          (a, b) =>
            new Date(b.date ?? Number.POSITIVE_INFINITY).getTime()
            - new Date(a.date ?? Number.POSITIVE_INFINITY).getTime(),
        ),
    };
  }, [orderedProjects]);
  const twoColumns = useMemo(() => distributeProjects(remaining, 2), [remaining]);
  const threeColumns = useMemo(() => distributeProjects(remaining, 3), [remaining]);

  if (isLoading) {
    return <ProjectsState label="Scanning the project signal..." />;
  }

  if (error) {
    return (
      <ProjectsState
        label="Projects are temporarily unavailable."
        description="GitHub may be limiting requests to its public API. Please try again shortly."
        action={
          <button
            onClick={() => mutate()}
            className="glow-action inline-flex items-center gap-2 rounded px-4 py-3 text-sm font-semibold text-[#090b0d]"
          >
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        }
      />
    );
  }

  return (
    <main className="resume-shell w-full pb-20">
      <header className="grid gap-10 border-b border-[var(--site-border)] pb-14 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div><p className="section-code">// projects / open signal</p><h1 className="mt-5 max-w-4xl text-6xl font-semibold leading-[0.92] tracking-[-0.06em] text-[var(--site-text)] sm:text-8xl">Things I&apos;ve made<span className="text-[var(--site-accent)]">.</span></h1></div>
        <p className="resume-lead max-w-xl text-xl leading-8">A changing index of open-source experiments, practical utilities, and tools built to make a real workflow a little better.</p>
      </header>

      {featured && <section className="mt-14">
        <div className="mb-6">
          <p className="section-code">// featured projects / {String(selected.length + 1).padStart(2, "0")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--site-text)] sm:text-4xl">Featured projects.</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ProjectCard
            project={featured}
            featured
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {selected.map((project) => (
              <ProjectCard
                key={project.name}
                project={project}
              />
            ))}
          </div>
        </div>
      </section>}

      {remaining.length > 0 && <section className="mt-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="section-code">// project index / {String(remaining.length).padStart(2, "0")} repos</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[var(--site-text)] sm:text-5xl">More experiments.</h2>
          </div>
          <Link href={socialMedia.github.href} target="_blank" rel="noreferrer" className="hidden items-center gap-2 text-sm text-cyan-300 transition hover:text-cyan-200 sm:inline-flex">Browse GitHub <GitBranch className="h-4 w-4" /></Link>
        </div>
        <div className="flex flex-col gap-4 sm:hidden">
          {remaining.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
        <div className="hidden gap-4 sm:grid sm:grid-cols-2 xl:hidden">
          {twoColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="grid grid-cols-1 gap-4">
              {column.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          ))}
        </div>
        <div className="hidden gap-4 xl:grid xl:grid-cols-3">
          {threeColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="grid grid-cols-1 gap-4">
              {column.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          ))}
        </div>
      </section>}
    </main>
  );
}

function ProjectsState({
  label,
  description,
  action,
}: {
  label: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <main
      role="status"
      className="resume-shell flex min-h-[55vh] w-full flex-col items-center justify-center gap-5 px-5 text-center"
    >
      <p className="section-code">// projects / signal</p>
      <h1 className="text-3xl text-zinc-50">{label}</h1>
      {description && <p className="resume-muted max-w-lg leading-7">{description}</p>}
      {action}
    </main>
  );
}
