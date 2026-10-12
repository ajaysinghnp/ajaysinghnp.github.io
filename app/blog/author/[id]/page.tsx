import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { AuthorView } from "@/components/content/author-view";
import { blogConfig } from "@/data/blog";
import { bioExcerpt, findAuthor, toSummary } from "@/lib/content-format";
import { contentSources, listAuthors, listEntries } from "@/lib/github-content";

export const dynamicParams = true;

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return [];
}

async function load(id: string) {
  const source = contentSources.blog;
  const authors = await listAuthors(source);
  const author = authors.find((a) => a.id === id);

  if (!author) return null;

  const entries = await listEntries(source);
  const posts = entries
    .filter((entry) => findAuthor(authors, entry.meta.author)?.id === author.id)
    .map((entry) => toSummary(entry, blogConfig.basePath, source.labels));

  return { author, posts, source };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await load(id);

  if (!data) return { title: "Author not found" };

  const { author } = data;
  return {
    title: author.name,
    description: author.role ?? bioExcerpt(author.bio, 160),
  };
}

export default async function BlogAuthorPage({ params }: Props) {
  const { id } = await params;
  const data = await load(id);

  if (!data) notFound();

  return (
    <AuthorView
      author={data.author}
      posts={data.posts}
      source={data.source}
      basePath={blogConfig.basePath}
    />
  );
}
