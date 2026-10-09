import type { Metadata } from "next";

import { ContentIndex } from "@/components/content/content-index";
import { blogConfig } from "@/data/blog";
import { childCategories, collectTags } from "@/lib/content-format";
import { contentSources, listEntries } from "@/lib/github-content";

export const metadata: Metadata = {
  title: blogConfig.page.title,
  description: blogConfig.page.description,
};

export default async function BlogPage() {
  const source = contentSources.blog;
  const entries = await listEntries(source);

  return (
    <ContentIndex
      entries={entries}
      categories={childCategories(entries, "", source.labels)}
      tags={collectTags(entries)}
      labels={source.labels}
      basePath={blogConfig.basePath}
      eyebrow={blogConfig.page.eyebrow}
      heading={blogConfig.page.heading}
      intro={blogConfig.page.intro}
    />
  );
}
