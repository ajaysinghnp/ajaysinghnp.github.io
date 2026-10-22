"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowDown, ArrowUp, Search, X } from "lucide-react";

interface SearchResult {
  title: string;
  href: string;
  section: string;
  excerpt: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [resultsQuery, setResultsQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorQuery, setErrorQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey
      ) {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const search = query.trim();
    if (!isOpen || search.replace(/\s/g, "").length < 2) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void (async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(search)}`, {
            signal: controller.signal,
          });
          if (!response.ok) throw new Error("Search request failed");
          const payload = (await response.json()) as { results: SearchResult[] };
          setResults(payload.results);
          setResultsQuery(search);
          setErrorQuery("");
          setActiveIndex(0);
        } catch {
          if (!controller.signal.aborted) {
            setResults([]);
            setResultsQuery(search);
            setErrorQuery(search);
          }
        } finally {
          if (!controller.signal.aborted) setIsLoading(false);
        }
      })();
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [isOpen, query]);

  useEffect(() => {
    if (resultsQuery !== query.trim() || results.length === 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "nearest",
    });
  }, [activeIndex, query, results, resultsQuery]);

  const close = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    setResultsQuery("");
    setErrorQuery("");
  };

  const openResult = (result: SearchResult) => {
    close();
    router.push(result.href);
  };

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    const visibleResults = resultsQuery === query.trim() ? results : [];
    if (!visibleResults.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, visibleResults.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      openResult(visibleResults[activeIndex]);
    }
  };

  const searchableQuery = query.trim().replace(/\s/g, "").length >= 2;
  const visibleResults = resultsQuery === query.trim() ? results : [];
  const isSearchLoading = searchableQuery && isLoading;
  const hasSearchError = searchableQuery && errorQuery === query.trim();

  let resultsContent: React.ReactNode;
  if (isSearchLoading) {
    resultsContent = (
      <p className="px-4 py-8 text-center text-sm text-(--site-muted)" role="status">
        Searching...
      </p>
    );
  } else if (!searchableQuery) {
    resultsContent = (
      <p className="px-4 py-8 text-center text-sm text-(--site-muted)">
        Type at least two characters to search.
      </p>
    );
  } else if (hasSearchError) {
    resultsContent = (
      <p className="px-4 py-8 text-center text-sm text-(--site-muted)" role="status">
        Search is temporarily unavailable. Try again in a moment.
      </p>
    );
  } else if (visibleResults.length) {
    resultsContent = (
      <ul id="global-search-results" role="listbox" aria-label="Search results">
        {visibleResults.map((result, index) => (
          <li key={`${result.href}:${result.title}`}>
            <button
              id={`global-search-result-${index}`}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => openResult(result)}
              className={`light-btn-hover-surface w-full cursor-pointer border py-3 text-left transition ${
                index === activeIndex
                  ? "border-(--site-surface-border) bg-(--site-accent)/10"
                  : "border-transparent hover:bg-(--site-bg)"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="truncate font-medium site-nav-active">{result.title}</span>
                <span className="shrink-0 text-xs text-(--site-muted)">{result.section}</span>
              </span>
              <span className="mt-1 line-clamp-2 block text-sm leading-5 text-(--site-muted)">
                {result.excerpt}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  } else {
    resultsContent = (
      <p className="px-4 py-8 text-center text-sm text-(--site-muted)" role="status">
        No results for &ldquo;{query.trim()}&rdquo;.
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="Search the site"
        aria-keyshortcuts="Meta+K Control+K"
        title="Search the site (⌘K / Ctrl+K)"
        onClick={() => setIsOpen(true)}
        className="light-btn-hover-bg shine-border-hover site-icon-button site-control hover:resume-surface"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="global-search-title"
        onClose={() => setIsOpen(false)}
        onClick={(event) => event.target === event.currentTarget && close()}
        onKeyDown={handleDialogKeyDown}
        className="global-search-dialog fixed inset-x-0 m-0 mx-auto w-[min(42rem,calc(100%-2rem))] overflow-hidden rounded-xl p-0"
      >
        <div className="border-b border-(--site-surface-border) bg-(--site-panel) p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-(--site-surface-border) bg-(--site-accent)/10 text-(--site-accent)">
              <Search className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2 id="global-search-title" className="sr-only">
              Search the site
            </h2>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pages, projects, posts..."
              aria-label="Search pages and content"
              aria-controls="global-search-results"
              aria-describedby="global-search-hint"
              className="min-w-0 flex-1 bg-transparent text-lg font-medium text-(--site-text) outline-none placeholder:text-(--site-muted)"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={close}
              className="site-icon-button inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-(--site-surface-border) bg-(--site-bg) text-(--site-muted) transition hover:text-(--site-text)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[min(30rem,calc(100dvh-12rem))] scroll-p-3 overflow-y-auto p-3 sm:scroll-p-4 sm:p-4">
          {resultsContent}
        </div>

        <div
          id="global-search-hint"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-(--site-surface-border) bg-(--site-panel) px-4 py-3 text-xs text-(--site-muted)"
        >
          <span className="inline-flex items-center gap-1">
            <ArrowUp className="h-3 w-3" /> <ArrowDown className="h-3 w-3" /> to navigate
          </span>
          <span>Enter to open</span>
          <span className="ml-auto inline-flex items-center gap-1">
            <kbd className="rounded border border-(--site-surface-border) px-1">⌘ K</kbd>
            <span>/</span>
            <kbd className="rounded border border-(--site-surface-border) px-1">Ctrl K</kbd>
          </span>
        </div>
      </dialog>
    </>
  );
}
