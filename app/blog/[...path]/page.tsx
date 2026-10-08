import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { ContentIndex } from "@/components/content/content-index";
import { PostView } from "@/components/content/post-view";
import { blogConfig } from "@/data/blog";
import { categoryCrumbs, categoryLabel, childCategories, collectTags } from "@/lib/content-format";
import { contentSources, getEntry, listEntries } from "@/lib/github-content";

export const dynamicParams = true;

type Props = { params: Promise<{ path: string[] }> };

export async function generateStaticParams() {
  return [];
}

// /blog/a/b/c is a post (category "a/b", slug "c") if one exists, otherwise the category "a/b/c".
async function resolve(path: string[]) {
  const source = contentSources.blog;

  if (path.length > 1) {
    const entry = await getEntry(source, path[path.length - 1], path.slice(0, -1).join("/"));
    if (entry) return { kind: "post" as const, entry };
  }

  // Hidden categories have no index page of their own, so only listed posts count here.
  const category = path.join("/");
  const all = await listEntries(source);
  const entries = all.filter(
    (e) => e.category === category || e.category.startsWith(`${category}/`),
  );

  return entries.length > 0 ? { kind: "category" as const, category, entries, all } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const resolved = await resolve(path);
  const source = contentSources.blog;

  if (!resolved) return { title: "Not found" };
  if (resolved.kind === "category") {
    return { title: categoryLabel(resolved.category, source.labels) };
  }

  const { entry } = resolved;
  const { title, description, date, updated, author, tags } = entry.meta;

  return {
    title: title ?? entry.slug,
    description,
    authors: author ? [{ name: author }] : undefined,
    keywords: tags,
    robots: entry.hidden ? { index: false, follow: false } : undefined,
    openGraph: { type: "article", publishedTime: date, modifiedTime: updated },
  };
}

export default async function BlogPathPage({ params }: Props) {
  const { path } = await params;
  const resolved = await resolve(path);
  const source = contentSources.blog;

  if (!resolved) notFound();

  if (resolved.kind === "post") {
    return (
      <PostView
        entry={resolved.entry}
        source={source}
        basePath={blogConfig.basePath}
        rootLabel="Blog"
      />
    );
  }

  const { category, entries, all } = resolved;
  const label = categoryLabel(category, source.labels);
  const crumbs = categoryCrumbs(category, blogConfig.basePath, source.labels);

  return (
    <ContentIndex
      entries={entries}
      categories={childCategories(all, category, source.labels)}
      tags={collectTags(entries)}
      labels={source.labels}
      basePath={blogConfig.basePath}
      activeCategory={category}
      eyebrow={
        <Breadcrumbs
          items={[
            { label: "blog", href: blogConfig.basePath },
            ...crumbs.map((crumb, index) =>
              index === crumbs.length - 1 ? { label: crumb.label } : crumb,
            ),
          ]}
        />
      }
      heading={`${label}.`}
      intro={`${entries.length} ${entries.length === 1 ? "post" : "posts"} in ${label}.`}
    />
  );
}
