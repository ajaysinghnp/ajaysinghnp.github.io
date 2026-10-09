import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { ContentIndex } from "@/components/content/content-index";
import { blogConfig } from "@/data/blog";
import { childCategories, collectTags, tagSlug } from "@/lib/content-format";
import { contentSources, listEntries } from "@/lib/github-content";

export const dynamicParams = true;

type Props = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `Posts tagged ${decodeURIComponent(tag)}` };
}

export default async function BlogTagPage({ params }: Props) {
  const { tag } = await params;
  const source = contentSources.blog;
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
      basePath={blogConfig.basePath}
      activeTag={tag}
      eyebrow={`blog / tag / ${tag}`}
      heading={`${current.name}.`}
      intro={`${current.count} ${current.count === 1 ? "post" : "posts"} tagged ${current.name}.`}
    />
  );
}
