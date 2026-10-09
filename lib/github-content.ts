import "server-only";

import matter from "gray-matter";

import { blogSource } from "@/data/blog";
import type { ContentEntry, ContentRef, ContentSource } from "@/types/blog";

import { githubToken } from "./github-config";
import { GitHubHttpError } from "./projects";

const GITHUB_API = "https://api.github.com";

export const contentSources = { blog: blogSource } satisfies Record<string, ContentSource>;

async function ghFetch(url: string, source: ContentSource, accept = "application/vnd.github+json") {
  const res = await fetch(url, {
    headers: {
      Accept: accept,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    },
    next: { revalidate: source.revalidate, tags: [source.tag] },
  });

  if (!res.ok) throw new GitHubHttpError(res.status, url);
  return res;
}

const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// "_drafts" -> { name: "drafts", hidden: true }; anything not kebab-case is rejected.
function parseCategory(segment: string): { name: string; hidden: boolean } | null {
  const hidden = segment.startsWith("_");
  const name = hidden ? segment.slice(1) : segment;
  return NAME.test(name) ? { name, hidden } : null;
}

function toRef(categorySegments: string[], slug: string, path: string): ContentRef | null {
  if (!NAME.test(slug)) return null;

  const categories: { name: string; hidden: boolean }[] = [];
  for (const segment of categorySegments) {
    const parsed = parseCategory(segment);
    if (!parsed) return null;
    categories.push(parsed);
  }

  return {
    slug,
    category: categories.map((c) => c.name).join("/"),
    hidden: categories.some((c) => c.hidden),
    path,
  };
}

// One API call returns every path in the repo; the folder conventions are interpreted here.
export async function listRefs(source: ContentSource): Promise<ContentRef[]> {
  const url = `${GITHUB_API}/repos/${source.repo}/git/trees/${encodeURIComponent(source.branch)}?recursive=1`;
  const { tree } = (await (await ghFetch(url, source)).json()) as {
    tree: { path: string; type: string }[];
  };

  const prefix = source.dir ? `${source.dir.replace(/\/$/, "")}/` : "";
  const standalone: ContentRef[] = [];
  const resourcePosts = new Map<string, ContentRef[]>();

  for (const node of tree) {
    if (node.type !== "blob" || !node.path.startsWith(prefix)) continue;

    const segments = node.path.slice(prefix.length).split("/");
    const file = segments[segments.length - 1];
    const ext = source.extensions.find((e) => file.toLowerCase().endsWith(e));
    const postDir = segments.findIndex((s) => s.startsWith("@"));

    if (postDir === 0) continue; // a post must sit inside a category

    if (postDir === -1) {
      // Standalone post: <categories...>/<slug>.md
      if (!ext || segments.length < 2 || file.toLowerCase().startsWith("readme")) continue;
      const ref = toRef(segments.slice(0, -1), file.slice(0, -ext.length), node.path);
      if (ref) standalone.push(ref);
      continue;
    }

    // Resource-backed post: only a Markdown file directly inside @post/ is content.
    if (!ext || segments.length !== postDir + 2) continue;
    const ref = toRef(segments.slice(0, postDir), segments[postDir].slice(1), node.path);
    if (!ref) continue;

    const key = segments.slice(0, postDir + 1).join("/");
    resourcePosts.set(key, [...(resourcePosts.get(key) ?? []), ref]);
  }

  const refs = [...standalone];

  for (const [dir, candidates] of resourcePosts) {
    if (candidates.length === 1) refs.push(candidates[0]);
    else
      console.warn(
        `${dir}: expected exactly one Markdown file, found ${candidates.length}; skipped.`,
      );
  }

  // Keep the first of any duplicate (category, slug) pair, e.g. "drafts/" and "_drafts/".
  const seen = new Set<string>();
  return refs
    .sort((a, b) => a.path.localeCompare(b.path))
    .filter((ref) => {
      const key = `${ref.category}/${ref.slug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : undefined;

// YAML turns bare timestamps into Date objects.
const asIso = (value: unknown) => (value instanceof Date ? value.toISOString() : asString(value));

async function readEntry(source: ContentSource, ref: ContentRef): Promise<ContentEntry> {
  const encoded = ref.path.split("/").map(encodeURIComponent).join("/");
  const res = await ghFetch(
    `${GITHUB_API}/repos/${source.repo}/contents/${encoded}?ref=${encodeURIComponent(source.branch)}`,
    source,
    "application/vnd.github.raw+json",
  );

  const { data, content } = matter(await res.text());

  return {
    ...ref,
    // The page header already shows the title, so drop a leading "# Title" from the body.
    content: content.replace(/^\s*#\s+.+\r?\n+/, ""),
    draft: data.published === false || data.draft === true,
    meta: {
      title: asString(data.title),
      description: asString(data.excerpt) ?? asString(data.description),
      date: asIso(data.created_at) ?? asIso(data.date),
      updated: asIso(data.updated_at),
      author: asString(data.author),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    },
  };
}

// Every published post, hidden ones included.
export async function listAllEntries(source: ContentSource): Promise<ContentEntry[]> {
  const entries = await Promise.all((await listRefs(source)).map((ref) => readEntry(source, ref)));

  return entries
    .filter((entry) => !entry.draft)
    .sort((a, b) => (b.meta.date ?? "").localeCompare(a.meta.date ?? ""));
}

// What listings show: hidden categories are left out unless the source opts in.
export async function listEntries(source: ContentSource): Promise<ContentEntry[]> {
  const all = await listAllEntries(source);
  return source.listHidden ? all : all.filter((entry) => !entry.hidden);
}

// Looks the post up in the repo tree first, so URL params can never reach arbitrary files.
// `category` is the logical path ("web-development/nextjs"); omit it to match by slug alone.
export async function getEntry(
  source: ContentSource,
  slug: string,
  category?: string,
): Promise<ContentEntry | null> {
  const ref = (await listRefs(source)).find(
    (r) => r.slug === slug && (category === undefined || r.category === category),
  );
  if (!ref) return null;

  const entry = await readEntry(source, ref);
  return entry.draft ? null : entry;
}
