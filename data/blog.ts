import { socialMedia } from "@/data/social";
import type { ContentSource } from "@/types/blog";

export const blogConfig = {
  basePath: "/blog",
  repo: `${socialMedia.github.handle}/blog`,
  // Test branch while developing. Switch to "main" at cutover,
  // either here or with the BLOG_BRANCH environment variable.
  branch: process.env.BLOG_BRANCH || "content",
  dir: "posts",
  revalidateSeconds: 86400, // fallback only; the webhook refreshes on push
  cacheTag: "content:blog",
  listHidden: false,
  // Labels come from folder names ("cloud-devops" -> "Cloud Devops").
  // Add an entry only where that isn't right. Keys can be a full path
  // ("web-development/nextjs") or just the folder name ("data-ai").
  categoryLabels: {
    "cloud-devops": "Cloud & DevOps",
    "data-ai": "Data & AI",
  } as Record<string, string>,
  page: {
    title: "Blog",
    description: "Writing on economics, infrastructure and building things.",
    eyebrow: "blog / notes",
    heading: "Things I write.",
    intro: "Long-form notes on economics, infrastructure and the tools I build along the way.",
  },
} as const;

export const blogSource: ContentSource = {
  key: "blog",
  repo: blogConfig.repo,
  branch: blogConfig.branch,
  dir: blogConfig.dir,
  extensions: [".md", ".mdx"],
  tag: blogConfig.cacheTag,
  revalidate: blogConfig.revalidateSeconds,
  labels: blogConfig.categoryLabels,
  listHidden: blogConfig.listHidden,
};
