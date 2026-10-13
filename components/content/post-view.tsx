import Link from "next/link";

import { ArrowLeft, Clock } from "lucide-react";

import { AuthorAside } from "@/components/content/author-aside";
import { AuthorCard } from "@/components/content/author-card";
import { AuthorPill } from "@/components/content/author-pill";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { ContentMdx } from "@/components/content/content-mdx";
import { PostActions } from "@/components/content/post-actions";
import { PostFooter } from "@/components/content/post-footer";
import { ReadingProgress } from "@/components/content/reading-progress";
import { ProjectToc } from "@/components/mdx/project-toc";
import {
  categoryCrumbs,
  categoryHue,
  findAuthor,
  formatDate,
  readingMinutes,
  tagSlug,
} from "@/lib/content-format";
import { listAuthors } from "@/lib/github-content";
import { extractProjectToc } from "@/lib/project-toc";
import type { ContentEntry, ContentSource } from "@/types/blog";

interface Props {
  entry: ContentEntry;
  source: ContentSource;
  basePath: string;
  rootLabel: string;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-(--site-surface-border) px-3 py-1 text-xs resume-muted">
      {children}
    </span>
  );
}

export async function PostView({ entry, source, basePath, rootLabel }: Props) {
  const { title, description, date, updated, author: authorValue, tags } = entry.meta;
  const [toc, authors] = await Promise.all([extractProjectToc(entry.content), listAuthors(source)]);
  const author = findAuthor(authors, authorValue);
  const crumbs = categoryCrumbs(entry.category, basePath, source.labels);
  const hue = categoryHue(entry.category);
  const heading = title ?? entry.slug;

  return (
    <main className="pb-16 resume-shell">
      <ReadingProgress />

      <Link
        href={basePath}
        className="mt-5 mb-6 inline-flex items-center gap-2 rounded-full border border-(--site-surface-border) px-4 py-2 text-sm text-(--site-muted) transition hover:border-(--site-accent) hover:site-nav-active"
      >
        <ArrowLeft className="h-4 w-4" />
        All posts
      </Link>

      <header className="shine-border-hover relative overflow-hidden resume-surface rounded-2xl p-6 sm:p-9 lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ background: `hsl(${hue} 85% 55%)` }}
        />

        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <Breadcrumbs
            className="section-code"
            items={[{ label: rootLabel, href: basePath }, ...crumbs]}
          />
          <PostActions
            title={heading}
            markdown={entry.content}
            contentId="post-content"
            fallbackName={entry.slug}
          />
        </div>

        <h1 className="relative mt-5 max-w-4xl text-4xl leading-tight font-semibold tracking-[-0.055em] wrap-break-word text-(--site-text) sm:text-6xl">
          {heading}
        </h1>
        {description && (
          <p className="relative mt-5 max-w-3xl text-base leading-8 resume-lead sm:text-lg">
            {description}
          </p>
        )}

        <div className="relative mt-8 flex flex-wrap items-center gap-2 border-t resume-intro pt-5">
          {authorValue && (
            <AuthorPill author={author} fallbackName={authorValue} hue={hue} basePath={basePath} />
          )}
          {date && (
            <Pill>
              <time dateTime={date}>{formatDate(date)}</time>
            </Pill>
          )}
          {updated && date && updated.slice(0, 10) !== date.slice(0, 10) && (
            <Pill>Updated {formatDate(updated)}</Pill>
          )}
          <Pill>
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {readingMinutes(entry.content)} min read
          </Pill>
        </div>

        {tags.length > 0 && (
          <div className="relative mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`${basePath}/tag/${tagSlug(tag)}`}
                className="rounded-full border border-(--site-surface-border) px-3 py-1 text-xs site-nav-active transition hover:border-(--site-accent)"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className={toc.length ? "project-content-layout" : undefined}>
        {toc.length > 0 && (
          <ProjectToc
            items={toc}
            aside={
              author ? <AuthorAside author={author} basePath={basePath} hue={hue} /> : undefined
            }
          />
        )}
        <div id="post-content" className="min-w-0">
          <ContentMdx
            source={entry.content}
            repo={source.repo}
            branch={source.branch}
            path={entry.path}
          />
        </div>
      </div>

      {author && toc.length === 0 && <AuthorCard author={author} basePath={basePath} hue={hue} />}

      <PostFooter entry={entry} source={source} basePath={basePath} />
    </main>
  );
}
