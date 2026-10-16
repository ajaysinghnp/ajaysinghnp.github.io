import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { ContentIndex } from "@/components/content/content-index";
import { PostView } from "@/components/content/post-view";
import {
  authorHref,
  categoryCrumbs,
  categoryLabel,
  childCategories,
  collectTags,
  findAuthor,
  plural,
  tagSlug,
} from "@/lib/content-format";
import { getEntry, listAuthors, listEntries } from "@/lib/github-content";
import type { ContentSection } from "@/types/blog";

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/* ---------- index ---------- */

export async function SectionIndex({ section }: { section: ContentSection }) {
  const { source, basePath, page } = section;
  const entries = await listEntries(source);

  return (
    <ContentIndex
      entries={entries}
      categories={childCategories(entries, "", source.labels)}
      tags={collectTags(entries)}
      labels={source.labels}
      basePath={basePath}
      eyebrow={page.eyebrow}
      heading={page.heading}
      intro={page.intro}
      list={section.list}
      itemLabel={section.itemLabel}
    />
  );
}

/* ---------- /<section>/a/b/c: a post if one exists, otherwise a category ---------- */

async function resolve(section: ContentSection, path: string[]) {
  const { source } = section;

  if (path.length > 1) {
    const entry = await getEntry(source, path[path.length - 1], path.slice(0, -1).join("/"));
    if (entry) return { kind: "post" as const, entry };
  }

  // Hidden categories have no index page of their own, so only listed entries count here.
  const category = path.join("/");
  const all = await listEntries(source);
  const entries = all.filter(
    (e) => e.category === category || e.category.startsWith(`${category}/`),
  );

  return entries.length > 0 ? { kind: "category" as const, category, entries, all } : null;
}

export async function pathMetadata(section: ContentSection, path: string[]): Promise<Metadata> {
  const { source } = section;
  const resolved = await resolve(section, path);

  if (!resolved) return { title: "Not found" };
  if (resolved.kind === "category") {
    return { title: categoryLabel(resolved.category, source.labels) };
  }

  const { entry } = resolved;
  const { title, description, date, updated, author, tags } = entry.meta;

  const authorList = await listAuthors(source);
  const resolvedAuthor = findAuthor(authorList, author);

  let authorMeta: Metadata["authors"];
  if (resolvedAuthor) {
    authorMeta = [
      {
        name: resolvedAuthor.name,
        url: authorHref(section.authorBasePath ?? section.basePath, resolvedAuthor),
      },
    ];
  } else if (author) {
    authorMeta = [{ name: author }];
  }

  return {
    title: title ?? entry.slug,
    description,
    authors: authorMeta,
    keywords: tags,
    robots: entry.hidden ? { index: false, follow: false } : undefined,
    openGraph: { type: "article", publishedTime: date, modifiedTime: updated },
  };
}

export async function SectionPath({ section, path }: { section: ContentSection; path: string[] }) {
  const { source, basePath, rootLabel, itemLabel } = section;
  const resolved = await resolve(section, path);

  if (!resolved) notFound();

  if (resolved.kind === "post") {
    return (
      <PostView
        entry={resolved.entry}
        source={source}
        basePath={basePath}
        rootLabel={rootLabel}
        backLabel={`All ${itemLabel}s`}
        authorBasePath={section.authorBasePath}
      />
    );
  }

  const { category, entries, all } = resolved;
  const label = categoryLabel(category, source.labels);
  const crumbs = categoryCrumbs(category, basePath, source.labels);

  return (
    <ContentIndex
      entries={entries}
      categories={childCategories(all, category, source.labels)}
      tags={collectTags(entries)}
      labels={source.labels}
      basePath={basePath}
      activeCategory={category}
      eyebrow={
        <Breadcrumbs
          items={[
            { label: rootLabel.toLowerCase(), href: basePath },
            ...crumbs.map((crumb, index) =>
              index === crumbs.length - 1 ? { label: crumb.label } : crumb,
            ),
          ]}
        />
      }
      heading={`${label}.`}
      intro={`${plural(entries.length, itemLabel)} in ${label}.`}
      list={section.list}
      itemLabel={itemLabel}
    />
  );
}

/* ---------- /<section>/tag/<tag> ---------- */

export function tagMetadata(section: ContentSection, tag: string): Metadata {
  return { title: `${capitalize(section.itemLabel)}s tagged ${decodeURIComponent(tag)}` };
}

export async function SectionTag({ section, tag }: { section: ContentSection; tag: string }) {
  const { source, basePath, rootLabel, itemLabel } = section;
  const all = await listEntries(source);
  const allTags = collectTags(all);
  const current = allTags.find((t) => t.slug === tag);

  if (!current) notFound();

  const entries = all.filter((e) => e.meta.tags.some((t) => tagSlug(t) === tag));

  return (
    <ContentIndex
      entries={entries}
      categories={childCategories(all, "", source.labels)}
      tags={allTags}
      labels={source.labels}
      basePath={basePath}
      activeTag={tag}
      eyebrow={`${rootLabel.toLowerCase()} / tag / ${tag}`}
      heading={`${current.name}.`}
      intro={`${plural(current.count, itemLabel)} tagged ${current.name}.`}
      list={section.list}
      itemLabel={itemLabel}
    />
  );
}
