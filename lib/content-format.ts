import { slug } from "github-slugger";

import type { ContentEntry } from "@/types/blog";

export const prettifyCategory = (value: string) =>
  value.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const readingMinutes = (text: string) =>
  Math.max(1, Math.round(text.trim().split(/\s+/).length / 220));

export const formatDate = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(
        new Date(iso),
      )
    : null;

/* ---------- tags ---------- */

export const tagSlug = (tag: string) => slug(tag);

export interface TagSummary {
  name: string;
  slug: string;
  count: number;
}

export function collectTags(entries: ContentEntry[]): TagSummary[] {
  const map = new Map<string, TagSummary>();

  for (const entry of entries) {
    for (const name of entry.meta.tags) {
      const key = tagSlug(name);
      const current = map.get(key);
      if (current) current.count += 1;
      else map.set(key, { name, slug: key, count: 1 });
    }
  }

  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/* ---------- categories (nested) ---------- */

export const categoryLabel = (path: string, labels: Record<string, string> = {}) => {
  const last = path.split("/").pop() ?? path;
  return labels[path] ?? labels[last] ?? prettifyCategory(last);
};

export const categoryHref = (basePath: string, path: string) =>
  `${basePath}/${path.split("/").map(encodeURIComponent).join("/")}`;

export const entryHref = (basePath: string, entry: ContentEntry) =>
  `${categoryHref(basePath, entry.category)}/${encodeURIComponent(entry.slug)}`;

export interface CategorySummary {
  path: string;
  label: string;
  count: number; // posts in this category and everything beneath it
}

// The categories directly under `parent` ("" = top level).
export function childCategories(
  entries: ContentEntry[],
  parent: string,
  labels: Record<string, string> = {},
): CategorySummary[] {
  const prefix = parent ? `${parent}/` : "";
  const counts = new Map<string, number>();

  for (const entry of entries) {
    if (parent && !entry.category.startsWith(prefix)) continue;
    const rest = entry.category.slice(prefix.length);
    if (!rest) continue;

    const segment = rest.split("/")[0];
    counts.set(segment, (counts.get(segment) ?? 0) + 1);
  }

  return [...counts]
    .map(([segment, count]) => ({
      path: prefix + segment,
      label: categoryLabel(prefix + segment, labels),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function categoryCrumbs(
  category: string,
  basePath: string,
  labels: Record<string, string> = {},
) {
  const parts = category.split("/");

  return parts.map((_, index) => {
    const path = parts.slice(0, index + 1).join("/");
    return { label: categoryLabel(path, labels), href: categoryHref(basePath, path) };
  });
}
