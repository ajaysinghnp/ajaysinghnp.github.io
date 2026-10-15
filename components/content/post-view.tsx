import Link from "next/link";

import { Clock } from "lucide-react";

import { AuthorAside } from "@/components/content/author-aside";
import { AuthorCard } from "@/components/content/author-card";
import { AuthorPill } from "@/components/content/author-pill";
import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { pillClass } from "@/components/content/chip";
import { ContentMdx } from "@/components/content/content-mdx";
import { Pill } from "@/components/content/pill";
import { PostActions } from "@/components/content/post-actions";
import { PostFooter } from "@/components/content/post-footer";
import { ContentPage } from "@/components/layouts/content-page";
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
import { cn } from "@/lib/utils";
import type { ContentEntry, ContentSource } from "@/types/blog";

interface Props {
  entry: ContentEntry;
  source: ContentSource;
  basePath: string;
  rootLabel: string;
  backLabel?: string; // e.g. "All sheets"
  authorBasePath?: string; // where author pages live, when different from basePath
}

export async function PostView({
  entry,
  source,
  basePath,
  rootLabel,
  backLabel = "All posts",
  authorBasePath,
}: Props) {
  const { title, description, date, updated, author: authorValue, tags, details } = entry.meta;
  const authorBase = authorBasePath ?? basePath;
  const [toc, authors] = await Promise.all([extractProjectToc(entry.content), listAuthors(source)]);
  const author = findAuthor(authors, authorValue);
  const crumbs = categoryCrumbs(entry.category, basePath, source.labels);
  const hue = categoryHue(entry.category);
  const heading = title ?? entry.slug;

  return (
    <ContentPage
      backHref={basePath}
      backLabel={backLabel}
      label={
        <Breadcrumbs
          className="section-code"
          items={[{ label: rootLabel, href: basePath }, ...crumbs]}
        />
      }
      chips={
        tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`${basePath}/tag/${tagSlug(tag)}`}
                  className={cn(pillClass, "inline-block px-3 py-1 text-xs")}
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        )
      }
      title={heading}
      description={
        description && (
          <p className="mt-5 max-w-3xl text-base leading-8 resume-lead sm:text-lg">{description}</p>
        )
      }
      meta={
        <>
          {authorValue && (
            <AuthorPill
              author={author}
              fallbackName={authorValue}
              hue={hue}
              basePath={authorBase}
            />
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
          {details.map(({ label, value }) => (
            <Pill key={label}>
              <span className="capitalize">{label}</span>
              <span className="text-(--site-text)">{value}</span>
            </Pill>
          ))}
        </>
      }
      metaEnd={<PostActions actions={["link"]} size="compact" title={heading} />}
      markdown={`# ${heading}\n\n${entry.content}`}
      fileName={entry.slug}
      glow={`hsl(${hue} 85% 55%)`}
      toc={toc}
      tocAside={author && <AuthorAside author={author} basePath={authorBase} hue={hue} />}
      footer={
        <>
          {author && toc.length === 0 && (
            <AuthorCard author={author} basePath={authorBase} hue={hue} />
          )}
          <PostFooter entry={entry} source={source} basePath={basePath} />
        </>
      }
    >
      <ContentMdx
        source={entry.content}
        repo={source.repo}
        branch={source.branch}
        path={entry.path}
      />
    </ContentPage>
  );
}
