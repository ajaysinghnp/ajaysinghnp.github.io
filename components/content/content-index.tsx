import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import {
  categoryHref,
  categoryLabel,
  type CategorySummary,
  entryHref,
  formatDate,
  readingMinutes,
  type TagSummary,
} from "@/lib/content-format";
import { cn } from "@/lib/utils";
import type { ContentEntry } from "@/types/blog";

interface Props {
  entries: ContentEntry[];
  categories: CategorySummary[]; // chips to show: the children of the current level
  tags: TagSummary[];
  labels: Record<string, string>;
  basePath: string;
  activeCategory?: string;
  activeTag?: string;
  eyebrow: React.ReactNode;
  heading: string;
  intro: string;
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border border-(--site-surface-border) px-4 py-2 text-sm text-(--site-muted) transition hover:border-(--site-accent)",
        active && "border-(--site-accent) site-nav-active",
      )}
    >
      {children}
    </Link>
  );
}

export function ContentIndex({
  entries,
  categories,
  tags,
  labels,
  basePath,
  activeCategory,
  activeTag,
  eyebrow,
  heading,
  intro,
}: Props) {
  return (
    <main className="w-full pb-20 resume-shell">
      <header className="grid gap-10 border-b resume-intro pb-14 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div>
          <div className="section-code">{eyebrow}</div>
          <h1 className="sparkle-text mt-5 max-w-4xl text-6xl leading-[0.92] font-semibold tracking-[-0.06em] sm:text-8xl">
            {heading}
          </h1>
        </div>
        <p className="max-w-xl text-xl leading-8 resume-lead">{intro}</p>
      </header>

      <nav aria-label="Categories" className="mt-10 flex flex-wrap gap-2">
        <Chip href={basePath} active={!activeCategory && !activeTag}>
          All
        </Chip>
        {categories.map((category) => (
          <Chip key={category.path} href={categoryHref(basePath, category.path)} active={false}>
            {category.label} <span className="opacity-60">{category.count}</span>
          </Chip>
        ))}
      </nav>

      {tags.length > 0 && (
        <nav aria-label="Tags" className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Chip
              key={tag.slug}
              href={`${basePath}/tag/${tag.slug}`}
              active={tag.slug === activeTag}
            >
              #{tag.name}
            </Chip>
          ))}
        </nav>
      )}

      {entries.length === 0 ? (
        <p className="mt-10 resume-muted">Nothing here yet.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <Link
              key={entry.path}
              href={entryHref(basePath, entry)}
              className="group shine-border-hover relative flex h-full flex-col rounded-xl border project-card p-5 transition duration-300 hover:-translate-y-1 sm:p-6"
            >
              <div className="flex items-center justify-between font-mono text-xs tracking-[0.14em] project-card-index">
                <span>{categoryLabel(entry.category, labels)}</span>
                {entry.meta.date && (
                  <time dateTime={entry.meta.date}>{formatDate(entry.meta.date)}</time>
                )}
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] project-card-title">
                {entry.meta.title ?? entry.slug}
              </h2>
              {entry.meta.description && (
                <p className="mt-3 text-sm leading-7 resume-muted">{entry.meta.description}</p>
              )}
              <div className="mt-auto flex items-center justify-between border-t resume-intro pt-4 text-xs resume-muted">
                <span>{readingMinutes(entry.content)} min read</span>
                <span className="inline-flex items-center gap-1.5 text-sm project-card-link">
                  Read
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
