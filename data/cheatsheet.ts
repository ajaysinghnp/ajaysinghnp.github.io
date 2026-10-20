import { blogSource } from "@/data/blog";
import { socialMedia } from "@/data/social";
import type { ContentSection, ContentSource } from "@/types/blog";

export const cheatsheetConfig = {
  basePath: "/cheatsheet",
  repo: `${socialMedia.github.handle}/Cheatsheets`,
  // Test branch while developing. Switch to "main" at cutover,
  // either here or with the CHEATSHEET_BRANCH environment variable.
  branch: process.env.CHEATSHEET_BRANCH || "main",
  dir: "sheets",
  revalidateSeconds: 86400, // fallback only; the webhook refreshes on push
  cacheTag: "content:cheatsheet",
  listHidden: false,
  // Labels come from folder names ("search-engines" -> "Search Engines").
  categoryLabels: {} as Record<string, string>,
  page: {
    title: "Cheatsheets",
    description: "Commands, short procedures and running notes, kept in one place.",
    eyebrow: "cheatsheet / reference",
    heading: "Quick references.",
    intro:
      "Commands, short procedures and running notes on Linux, Git, security tooling, smart-home flashing and project setup.",
  },
} as const;

export const cheatsheetSource: ContentSource = {
  key: "cheatsheet",
  repo: cheatsheetConfig.repo,
  branch: cheatsheetConfig.branch,
  dir: cheatsheetConfig.dir,
  authorsFrom: blogSource, // author profiles live in the blog repo
  extensions: [".md", ".mdx"],
  tag: cheatsheetConfig.cacheTag,
  revalidate: cheatsheetConfig.revalidateSeconds,
  labels: cheatsheetConfig.categoryLabels,
  listHidden: cheatsheetConfig.listHidden,
};

export const cheatsheetSection: ContentSection = {
  source: cheatsheetSource,
  basePath: cheatsheetConfig.basePath,
  rootLabel: "Cheatsheets",
  itemLabel: "sheet",
  list: "reference",
  authorBasePath: "/blog", // author pages live under the blog
  page: cheatsheetConfig.page,
};
