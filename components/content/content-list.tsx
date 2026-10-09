"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { motion, MotionConfig } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";

import { pillClass } from "@/components/content/chip";
import { PostCard } from "@/components/content/post-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { PostSummary } from "@/types/blog";

type Sort = "newest" | "oldest";
type Option = { value: string; label: string };

const ALL = "all";

const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });
const monthLabel = (month: string) =>
  monthFormat.format(new Date(Date.UTC(2000, Number(month) - 1, 1)));

const LENGTHS = [
  { value: "short", label: "Under 5 min", test: (minutes: number) => minutes < 5 },
  { value: "medium", label: "5–10 min", test: (minutes: number) => minutes >= 5 && minutes < 10 },
  { value: "long", label: "10+ min", test: (minutes: number) => minutes >= 10 },
];

const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={reveal}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Undated posts always sort last.
const byDate = (direction: 1 | -1) => (a: PostSummary, b: PostSummary) => {
  if (!a.date && !b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;
  return a.date.localeCompare(b.date) * direction;
};

function groupByYear(posts: PostSummary[]) {
  const groups = new Map<string, PostSummary[]>();

  for (const post of posts) {
    const year = post.date?.slice(0, 4) ?? "Undated";
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }

  return [...groups].map(([year, items]) => ({ year, posts: items }));
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const current = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Filter by ${label.toLowerCase()}`}
          className={cn(
            pillClass,
            "inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm",
            value !== ALL && "border-(--site-accent) site-nav-active",
          )}
        >
          <span className="resume-muted">{label}</span>
          <span>{current?.label}</span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface Props {
  posts: PostSummary[];
  showFeatured: boolean;
}

export function ContentList({ posts, showFeatured }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [year, setYear] = useState(ALL);
  const [month, setMonth] = useState(ALL);
  const [length, setLength] = useState(ALL);
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

  const yearOptions = useMemo<Option[]>(() => {
    const years = new Set(posts.flatMap((post) => (post.date ? [post.date.slice(0, 4)] : [])));
    return [
      { value: ALL, label: "All" },
      ...[...years]
        .sort()
        .reverse()
        .map((value) => ({ value, label: value })),
    ];
  }, [posts]);

  const monthOptions = useMemo<Option[]>(() => {
    const months = new Set<string>();

    for (const post of posts) {
      if (post.date && (year === ALL || post.date.startsWith(year))) {
        months.add(post.date.slice(5, 7));
      }
    }

    return [
      { value: ALL, label: "All" },
      ...[...months].sort().map((value) => ({ value, label: monthLabel(value) })),
    ];
  }, [posts, year]);

  const lengthOptions = useMemo<Option[]>(
    () => [
      { value: ALL, label: "Any" },
      ...LENGTHS.filter((rule) => posts.some((post) => rule.test(post.minutes))),
    ],
    [posts],
  );

  const { groups, leadKey, total, filtering } = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const lengthRule = LENGTHS.find((rule) => rule.value === length);

    const matches = indexed
      .filter(({ post, haystack }) => {
        if (!terms.every((term) => haystack.includes(term))) return false;
        if (year !== ALL && !post.date?.startsWith(year)) return false;
        if (month !== ALL && post.date?.slice(5, 7) !== month) return false;
        if (lengthRule && !lengthRule.test(post.minutes)) return false;
        return true;
      })
      .map(({ post }) => post)
      .sort(byDate(sort === "newest" ? -1 : 1));

    const active = terms.length > 0 || year !== ALL || month !== ALL || length !== ALL;
    const lead = showFeatured && !active && sort === "newest" ? matches[0] : undefined;

    return {
      groups: active ? [{ year: "", posts: matches }] : groupByYear(matches),
      leadKey: lead?.key,
      total: matches.length,
      filtering: active,
    };
  }, [indexed, query, sort, year, month, length, showFeatured]);

  function clearAll() {
    setQuery("");
    setYear(ALL);
    setMonth(ALL);
    setLength(ALL);
  }

  return (
    <MotionConfig reducedMotion="user">
      <section className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <label className="shine-border-hover relative block min-w-56 flex-1 rounded-full border border-(--site-surface-border) transition focus-within:border-(--site-accent) sm:max-w-md">
            <span className="sr-only">Search posts</span>
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
              placeholder="Search posts and tags"
              className="w-full rounded-full bg-transparent py-2.5 pr-12 pl-11 text-sm text-(--site-text) outline-none placeholder:text-(--site-muted)"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-(--site-muted) hover:text-(--site-text)"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 rounded border border-(--site-surface-border) px-1.5 text-[10px] text-(--site-muted)">
                /
              </kbd>
            )}
          </label>

          <FilterSelect
            label="Year"
            value={year}
            options={yearOptions}
            onChange={(value) => {
              setYear(value);
              setMonth(ALL);
            }}
          />
          <FilterSelect label="Month" value={month} options={monthOptions} onChange={setMonth} />
          {lengthOptions.length > 2 && (
            <FilterSelect
              label="Length"
              value={length}
              options={lengthOptions}
              onChange={setLength}
            />
          )}

          <div
            role="group"
            aria-label="Sort posts"
            className={cn(pillClass, "inline-flex p-1 text-sm")}
          >
            {(["newest", "oldest"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={sort === value}
                onClick={() => setSort(value)}
                className={cn(
                  "rounded-full px-3 py-1 capitalize transition",
                  sort === value
                    ? "bg-(--site-accent)/15 site-nav-active"
                    : "text-(--site-muted) hover:text-(--site-text)",
                )}
              >
                {value}
              </button>
            ))}
          </div>

          {filtering && (
            <button
              type="button"
              onClick={clearAll}
              className="text-sm site-nav-active hover:underline"
            >
              Clear filters
            </button>
          )}

          <p className="ml-auto text-sm resume-muted" aria-live="polite">
            {total} {total === 1 ? "post" : "posts"}
          </p>
        </div>

        {total === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-lg text-(--site-text)">No posts match these filters.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-3 text-sm site-nav-active hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          groups.map((group, index) => (
            <div key={group.year || "results"} className={index === 0 ? "mt-8" : "mt-12"}>
              {group.year && (
                <div className="mb-5 flex items-baseline gap-3">
                  <h2 className="text-3xl font-semibold tracking-tighter text-(--site-text)">
                    {group.year}
                  </h2>
                  <span className="font-mono text-xs resume-muted">
                    {String(group.posts.length).padStart(2, "0")}
                  </span>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {group.posts.map((post) => {
                  const isLead = post.key === leadKey;

                  return (
                    <Reveal key={post.key} className={isLead ? "sm:col-span-2" : undefined}>
                      <PostCard post={post} variant={isLead ? "featured" : "default"} />
                    </Reveal>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>
    </MotionConfig>
  );
}
