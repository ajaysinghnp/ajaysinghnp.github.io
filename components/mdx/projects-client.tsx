"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowUpRight, Eye, GitBranch, GitFork, Star } from "lucide-react";

import { ProjectDescription } from "@/components/mdx/project-description";
import { PROJECT_REPOSITORY_SETTINGS } from "@/data/repos";
import { socialMedia } from "@/data/social";
import { getProjectPreviewSrc, PROJECT_PREVIEW_MANIFEST_PATH } from "@/lib/project-preview";
import type { Project } from "@/types/github";

const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay } }),
};

const compactCount = (count: number) =>
  Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(count);

function FeaturedProjectPreview({ project }: { project: Project }) {
  const [previewVersion, setPreviewVersion] = useState<string | null>(null);
  const [failedVersion, setFailedVersion] = useState<string | null>(null);
  const previewUrl = project.homepage || project.url;
  let previewHost = project.name;

  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const checkPreview = async () => {
      try {
        const response = await fetch(`${PROJECT_PREVIEW_MANIFEST_PATH}?check=${Date.now()}`, {
          cache: "no-store",
        });

        if (response.ok) {
          const manifest = (await response.json()) as {
            repository: string;
            generatedAt: string;
          };

          if (isMounted && manifest.repository === project.name) {
            setPreviewVersion(manifest.generatedAt);
          }
        } else if (response.status !== 404) {
          console.warn(`Could not check featured preview: ${response.status}`);
        }
      } catch (error) {
        console.warn("Could not check featured preview availability.", error);
      }

      if (isMounted && process.env.NODE_ENV === "development") {
        timer = setTimeout(() => {
          void checkPreview();
        }, 2_000);
      }
    };

    void checkPreview();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [project.name]);

  try {
    previewHost = new URL(previewUrl).host;
  } catch {
    previewHost = project.name;
  }

  if (!previewVersion || failedVersion === previewVersion) return null;

  return (
    <div className="relative mt-7 aspect-video w-full overflow-hidden rounded-lg border border-(--site-surface-border) project-card-preview">
      <Image
        src={`${getProjectPreviewSrc(project.name, "light")}?v=${encodeURIComponent(previewVersion)}`}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 45vw"
        className="project-card-preview-light project-card-preview-theme object-cover object-top transition duration-700 group-hover:scale-[1.03]"
        priority
        onError={() => setFailedVersion(previewVersion)}
      />
      <Image
        src={`${getProjectPreviewSrc(project.name, "dark")}?v=${encodeURIComponent(previewVersion)}`}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 45vw"
        className="project-card-preview-dark project-card-preview-theme object-cover object-top transition duration-700 group-hover:scale-[1.03]"
        priority
        onError={() => setFailedVersion(previewVersion)}
      />
      <div className="absolute inset-x-0 top-0 z-10 flex h-5 items-center gap-1.5 border-b resume-intro px-2 project-card-preview-bar sm:h-8 sm:gap-2 sm:px-3">
        <span className="flex gap-1" aria-hidden="true">
          <i className="project-card-preview-dot sm:size-[0.38rem]" />
          <i className="project-card-preview-dot sm:size-[0.38rem]" />
          <i className="project-card-preview-dot sm:size-[0.38rem]" />
        </span>
        <span className="truncate text-[9px] sm:text-[10px]">{previewHost}</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 project-card-preview-fade" />
    </div>
  );
}

function distributeProjects(projects: Project[], columnCount: number): Project[][] {
  const columns = Array.from({ length: columnCount }, () => [] as Project[]);

  projects.forEach((project, index) => {
    columns[index % columnCount].push(project);
  });

  return columns;
}

function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <motion.article
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={reveal}
      className={`group shine-border-hover relative w-full break-inside-avoid overflow-hidden rounded-xl border project-card transition duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--project-card-accent)_50%,transparent)] hover:shadow-[var(--project-card-hover-shadow)] ${featured ? "h-full" : ""}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full project-card-glow opacity-40 blur-3xl transition duration-500 group-hover:opacity-100"
      />
      <Link
        href={`/projects/${project.name}`}
        aria-label={`Open ${project.title}`}
        className="absolute inset-0 z-10 rounded-xl"
      >
        <span className="sr-only">Open project details</span>
      </Link>
      <div
        className={`pointer-events-none relative z-20 flex h-full flex-col ${featured ? "p-6 sm:p-8" : "p-5 sm:p-6"}`}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs tracking-[0.14em] project-card-index">
            ID {project.id}
          </span>
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`View ${project.title} on GitHub`}
            className="pointer-events-auto relative z-30 flex items-center gap-3 text-[10px] tracking-[0.12em] project-card-visibility uppercase"
          >
            <span
              className="inline-flex items-center gap-1.5"
              aria-label={`Visibility: ${project.visibility}`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              {project.visibility}
            </span>
            {project.stargazers_count !== undefined && (
              <span
                className="inline-flex items-center gap-1"
                title={`${project.stargazers_count} stars`}
              >
                <Star className="h-3.5 w-3.5" aria-hidden="true" />
                {compactCount(project.stargazers_count)}
              </span>
            )}
            {project.subscribers_count !== undefined && (
              <span
                className="inline-flex items-center gap-1"
                title={`${project.subscribers_count} watchers`}
              >
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
          <h3
            className={`project-card-title group-hover:project-card-index ${featured ? "text-3xl sm:text-4xl" : "text-2xl"} font-semibold tracking-[-0.04em] transition`}
          >
            {project.title}
          </h3>
          <ProjectDescription
            className={`mt-4 resume-muted ${featured ? "text-base leading-8" : "text-sm leading-7"}`}
          >
            {project.description || "No description yet. Open the repository to inspect the work."}
          </ProjectDescription>
        </div>
        {featured && <FeaturedProjectPreview project={project} />}
        <div className="mt-auto flex items-center justify-between border-t resume-intro pt-4">
          <span className="text-xs font-medium resume-muted">
            Updated{" "}
            {new Date(project.updated_at).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            })}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm project-card-link transition group-hover:project-card-index">
            Read more
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export function ProjectsClient({ projects }: { projects: Project[] }) {
  const orderedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      ),
    [projects],
  );
  const { featured, selected, remaining } = useMemo(() => {
    const featured =
      orderedProjects.find(
        (project) => project.name === PROJECT_REPOSITORY_SETTINGS.featuredRepositoryName,
      ) ?? orderedProjects[0];
    const selected = orderedProjects
      .filter((project) => project.name !== featured?.name)
      .sort(
        (a, b) =>
          (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0) ||
          (b.forks ?? 0) - (a.forks ?? 0) ||
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
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
            new Date(b.date ?? Number.POSITIVE_INFINITY).getTime() -
            new Date(a.date ?? Number.POSITIVE_INFINITY).getTime(),
        ),
    };
  }, [orderedProjects]);
  const twoColumns = useMemo(() => distributeProjects(remaining, 2), [remaining]);
  const threeColumns = useMemo(() => distributeProjects(remaining, 3), [remaining]);

  return (
    <main className="w-full pb-20 resume-shell">
      <header className="grid gap-10 border-b resume-intro pb-14 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div>
          <p className="section-code">projects / open signal</p>
          <h1 className="sparkle-text mt-5 max-w-4xl text-6xl leading-[0.92] font-semibold tracking-[-0.06em] sm:text-8xl">
            Things I&apos;ve made.
          </h1>
        </div>
        <p className="max-w-xl text-xl leading-8 resume-lead">
          A changing index of open-source experiments, practical utilities, and tools built to make
          a real workflow a little better.
        </p>
      </header>

      {featured && (
        <section className="mt-14">
          <div className="mb-6">
            <p className="section-code">
              // featured projects / {String(selected.length + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tighter text-(--site-text) sm:text-4xl">
              Featured projects.
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ProjectCard key={featured.name} project={featured} featured />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {selected.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {remaining.length > 0 && (
        <section className="mt-20">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="section-code">
                project index / {String(remaining.length).padStart(2, "0")} repos
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tighter text-(--site-text) sm:text-5xl">
                More experiments.
              </h2>
            </div>
            <Link
              href={`${socialMedia.github.href}?tab=repositories`}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 text-sm site-nav-active transition hover:text-(--site-text) sm:inline-flex"
            >
              Browse GitHub <GitBranch className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-4 sm:hidden">
            {remaining.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </div>
          <div className="hidden gap-4 sm:grid sm:grid-cols-2 xl:hidden">
            {twoColumns.map((column, columnIndex) => (
              <div key={`col-sm-${columnIndex + 1}`} className="grid grid-cols-1 gap-4">
                {column.map((project) => (
                  <ProjectCard key={project.name} project={project} />
                ))}
              </div>
            ))}
          </div>
          <div className="hidden gap-4 xl:grid xl:grid-cols-3">
            {threeColumns.map((column, columnIndex) => (
              <div key={`col-xl-${columnIndex + 1}`} className="grid grid-cols-1 gap-4">
                {column.map((project) => (
                  <ProjectCard key={project.name} project={project} />
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export function ProjectsState({
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
      className="flex min-h-[55vh] w-full flex-col items-center justify-center gap-5 px-5 text-center resume-shell"
    >
      <p className="section-code">projects / signal</p>
      <h1 className="text-3xl text-[var(--site-text)]">{label}</h1>
      {description && <p className="max-w-lg leading-7 resume-muted">{description}</p>}
      {action}
    </main>
  );
}
