import Link from "next/link";

import { ArrowUpRight, Eye, GitBranch, GitFork, Star } from "lucide-react";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Pill } from "@/components/content/pill";
import { ContentPage } from "@/components/layouts/content-page";
import { MDX } from "@/components/mdx/mdx";
import { ProjectDescription } from "@/components/mdx/project-description";
import { socialMedia } from "@/data/social";
import type { ProjectTocItem } from "@/lib/project-toc";
import type { Project, ProjectReadme } from "@/types/github";

interface Props {
  project: Project;
  readme: ProjectReadme;
  toc: ProjectTocItem[];
}

const compactCount = (count: number) =>
  Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(count);

const monthYear = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function ProjectView({ project, readme, toc }: Props) {
  const title = project.title.replaceAll("-", " ");

  const stats = [
    { label: "Stars", value: project.stargazers_count, icon: Star },
    { label: "Forks", value: project.forks, icon: GitFork },
    { label: "Watchers", value: project.subscribers_count, icon: Eye },
    { label: "Open issues", value: project.open_issues, icon: GitBranch },
  ].filter((stat): stat is typeof stat & { value: number } => stat.value !== undefined);

  return (
    <ContentPage
      backHref="/projects"
      backLabel="All projects"
      label={
        <Breadcrumbs
          className="section-code"
          items={[{ label: "Projects", href: "/projects" }, { label: project.visibility }]}
        />
      }
      title={title}
      description={
        project.description && (
          <ProjectDescription className="mt-5 max-w-3xl text-base leading-8 resume-lead sm:text-lg">
            {project.description}
          </ProjectDescription>
        )
      }
      titleAside={
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
      }
      meta={
        <>
          <Pill>Updated {monthYear.format(new Date(project.updated_at))}</Pill>
          {stats.map(({ label, value, icon: Icon }) => (
            <Pill key={label} title={`${value} ${label.toLowerCase()}`}>
              <Icon className="h-3.5 w-3.5 site-nav-active" aria-hidden="true" />
              <span className="font-medium site-nav-active">{compactCount(value)}</span>
              {label}
            </Pill>
          ))}
        </>
      }
      metaEnd={
        <Link
          href={socialMedia.github.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm site-nav-active hover:underline"
        >
          GitHub profile <ArrowUpRight className="h-4 w-4" />
        </Link>
      }
      compactLinks={
        <Link
          href={project.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium site-nav-active transition hover:underline sm:text-sm"
        >
          <span className="hidden sm:inline">View on GitHub</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      }
      markdown={readme.content}
      fileName={project.name}
      toc={toc}
    >
      <MDX
        source={readme.content}
        repository={readme.repository}
        branch={readme.branch}
        readmePath={readme.path}
      />
    </ContentPage>
  );
}
