import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

import { ContentMdx } from "@/components/content/content-mdx";
import { ProjectToc } from "@/components/mdx/project-toc";
import { formatDate, readingMinutes, tagSlug } from "@/lib/content-format";
import { contentSources, getEntry } from "@/lib/github-content";
import { extractProjectToc } from "@/lib/project-toc";

export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(contentSources.blog, slug);
  if (!entry) return { title: "Post not found" };

  const { title, description, date, updated, author, tags } = entry.meta;

  return {
    title: title ?? slug,
    description,
    authors: author ? [{ name: author }] : undefined,
    keywords: tags,
    openGraph: { type: "article", publishedTime: date, modifiedTime: updated },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const source = contentSources.blog;
  const entry = await getEntry(source, slug);

  if (!entry) notFound();

  const { title, description, date, updated, author, tags } = entry.meta;
  const toc = await extractProjectToc(entry.content);

  return (
    <main className="pb-16 resume-shell">
      <Link
        href="/blog"
        className="mt-5 mb-6 inline-flex items-center gap-2 rounded-full border border-(--site-surface-border) px-4 py-2 text-sm text-(--site-muted) transition hover:border-(--site-accent) hover:site-nav-active"
      >
        <ArrowLeft className="h-4 w-4" />
        All posts
      </Link>

      <header className="shine-border-hover relative overflow-hidden resume-surface rounded-2xl p-6 sm:p-9 lg:p-12">
        <div className="section-code">Blog / Post</div>
        <h1 className="mt-5 max-w-4xl text-4xl leading-tight font-semibold tracking-[-0.055em] wrap-break-word text-(--site-text) sm:text-6xl">
          {title ?? slug}
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
              href={`/blog/tag/${tagSlug(tag)}`}
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
