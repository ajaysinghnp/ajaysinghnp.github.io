import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { ContentMdx } from "@/components/content/content-mdx";
import { ProjectToc } from "@/components/mdx/project-toc";
import { categoryCrumbs, formatDate, readingMinutes, tagSlug } from "@/lib/content-format";
import { extractProjectToc } from "@/lib/project-toc";
import type { ContentEntry, ContentSource } from "@/types/blog";

interface Props {
  entry: ContentEntry;
  source: ContentSource;
  basePath: string;
  rootLabel: string;
}

export async function PostView({ entry, source, basePath, rootLabel }: Props) {
  const { title, description, date, updated, author, tags } = entry.meta;
  const toc = await extractProjectToc(entry.content);
  const crumbs = categoryCrumbs(entry.category, basePath, source.labels);

  return (
    <main className="pb-16 resume-shell">
      <Link
        href={basePath}
        className="mt-5 mb-6 inline-flex items-center gap-2 rounded-full border border-(--site-surface-border) px-4 py-2 text-sm text-(--site-muted) transition hover:border-(--site-accent) hover:site-nav-active"
      >
        <ArrowLeft className="h-4 w-4" />
        All posts
      </Link>

      <header className="shine-border-hover relative overflow-hidden resume-surface rounded-2xl p-6 sm:p-9 lg:p-12">
        <Breadcrumbs
          className="section-code"
          items={[{ label: rootLabel, href: basePath }, ...crumbs]}
        />
        <h1 className="mt-5 max-w-4xl text-4xl leading-tight font-semibold tracking-[-0.055em] wrap-break-word text-(--site-text) sm:text-6xl">
          {title ?? entry.slug}
        </h1>
        {description && (
          <p className="mt-5 max-w-3xl text-base leading-8 resume-lead sm:text-lg">{description}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t resume-intro pt-5 text-sm resume-muted">
          {author && <span>{author}</span>}
          {date && <time dateTime={date}>{formatDate(date)}</time>}
          {updated && updated !== date && <span>Updated {formatDate(updated)}</span>}
          <span>{readingMinutes(entry.content)} min read</span>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`${basePath}/tag/${tagSlug(tag)}`}
              className="site-nav-active hover:underline"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </header>

      <div className={toc.length ? "project-content-layout" : undefined}>
        {toc.length > 0 && <ProjectToc items={toc} />}
        <div className="min-w-0">
          <ContentMdx
            source={entry.content}
            repo={source.repo}
            branch={source.branch}
            path={entry.path}
          />
        </div>
      </div>
    </main>
  );
}
