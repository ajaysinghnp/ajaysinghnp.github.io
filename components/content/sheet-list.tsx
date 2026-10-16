"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { motion, MotionConfig } from "framer-motion";
import { ArrowUpRight, Search, X } from "lucide-react";

import { pillClass } from "@/components/content/chip";
import { PostCard } from "@/components/content/post-card";
import { categoryHref, plural } from "@/lib/content-format";
import { cn } from "@/lib/utils";
import type { PostSummary } from "@/types/blog";

type Sort = "az" | "newest";

const SORTS: { value: Sort; label: string }[] = [
  { value: "az", label: "A–Z" },
  { value: "newest", label: "Newest" },
];

const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={reveal}
    >
      {children}
    </motion.div>
  );
}

const byTitle = (a: PostSummary, b: PostSummary) => a.title.localeCompare(b.title);

// Undated sheets always sort last.
const byNewest = (a: PostSummary, b: PostSummary) => {
  if (!a.date && !b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;
  return b.date.localeCompare(a.date);
};

interface Props {
  posts: PostSummary[];
  basePath: string;
  itemLabel: string;
}

// Reference-style listing: grouped by top-level category, alphabetical by default.
export function SheetList({ posts, basePath, itemLabel }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("az");
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses the search box, like most docs sites.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;

      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      inputRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const indexed = useMemo(
    () =>
      posts.map((post) => ({
        post,
        haystack: [post.title, post.description ?? "", post.categoryName, ...post.tags]
          .join(" ")
          .toLowerCase(),
      })),
    [posts],
  );

  const { groups, total } = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const compare = sort === "az" ? byTitle : byNewest;

    const matches = indexed
      .filter(({ haystack }) => terms.every((term) => haystack.includes(term)))
      .map(({ post }) => post)
      .sort(compare);

    if (terms.length > 0) {
      return { groups: [{ key: "", label: "", posts: matches }], total: matches.length };
    }

    const byCategory = new Map<string, { label: string; posts: PostSummary[] }>();
    for (const post of matches) {
      const group = byCategory.get(post.topCategory) ?? { label: post.topCategoryName, posts: [] };
      group.posts.push(post);
      byCategory.set(post.topCategory, group);
    }

    return {
      groups: [...byCategory]
        .map(([key, group]) => ({ key, ...group }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      total: matches.length,
    };
  }, [indexed, query, sort]);

  return (
    <MotionConfig reducedMotion="user">
      <section className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <label className="shine-border-hover relative block min-w-56 flex-1 rounded-full border border-(--site-surface-border) transition focus-within:border-(--site-accent) sm:max-w-md">
            <span className="sr-only">Search {itemLabel}s</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-(--site-muted)"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === "Escape" && setQuery("")}
              placeholder={`Search ${itemLabel}s and tags`}
              className="w-full rounded-full bg-transparent py-2.5 pr-12 pl-11 text-sm site-nav-active outline-none placeholder:text-(--site-muted)"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-(--site-muted) hover:site-nav-active"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rounded border border-(--site-surface-border) px-1.5 text-[10px] text-(--site-muted)">
                /
              </kbd>
            )}
          </label>

          <div
            role="group"
            aria-label="Sort sheets"
            className={cn(pillClass, "inline-flex p-1 text-sm")}
          >
            {SORTS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={sort === option.value}
                onClick={() => setSort(option.value)}
                className={cn(
                  "rounded-full px-3 py-1 transition",
                  sort === option.value
                    ? "bg-(--site-accent)/15 site-nav-active"
                    : "text-(--site-muted) hover:site-nav-active",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <p className="ml-auto text-sm resume-muted" aria-live="polite">
            {plural(total, itemLabel)}
          </p>
        </div>

        {total === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-lg site-nav-active">
              No {itemLabel}s match &ldquo;{query}&rdquo;.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-3 text-sm resume-muted hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          groups.map((group, index) => (
            <div key={group.key || "results"} className={index === 0 ? "mt-8" : "mt-12"}>
              {group.label && (
                <div className="mb-5 flex items-baseline gap-3">
                  <h2 className="text-3xl font-semibold tracking-tighter site-nav-active">
                    {group.label}
                  </h2>
                  <span className="font-mono text-xs resume-muted">
                    {String(group.posts.length).padStart(2, "0")}
                  </span>
                  <Link
                    href={categoryHref(basePath, group.key)}
                    className="ml-auto inline-flex items-center gap-1 text-sm site-nav-active hover:underline"
                  >
                    View all
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.posts.map((post) => (
                  <Reveal key={post.key}>
                    <PostCard post={post} />
                  </Reveal>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </MotionConfig>
  );
}
