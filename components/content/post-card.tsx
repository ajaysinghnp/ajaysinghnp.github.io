import Link from "next/link";

import { ArrowUpRight, Clock } from "lucide-react";

import { pillClass } from "@/components/content/chip";
import { formatDate } from "@/lib/content-format";
import { cn } from "@/lib/utils";
import type { PostSummary } from "@/types/blog";

const MAX_TAGS = 3;

const variants = {
  default: {
    padding: "p-5 sm:p-6",
    title: "text-2xl",
    description: "text-sm leading-7",
  },
  featured: {
    padding: "p-6 sm:p-10",
    title: "text-3xl sm:text-5xl",
    description: "max-w-3xl text-base leading-8",
  },
  compact: {
    padding: "p-5 sm:p-6",
    title: "text-lg",
    description: "text-sm leading-7",
  },
} as const;

interface Props {
  post: PostSummary;
  variant?: keyof typeof variants;
}

export function PostCard({ post, variant = "default" }: Props) {
  const styles = variants[variant];
  const compact = variant === "compact";
  const featured = variant === "featured";
  const Heading = compact ? "h3" : "h2";
  const accent = `hsl(${post.hue} 85% 55%)`;
  const visibleTags = post.tagLinks.slice(0, MAX_TAGS);
  const hiddenTags = post.tagLinks.length - visibleTags.length;

  let badge: string | null = null;
  if (featured) badge = "Latest";
  else if (post.isNew) badge = "New";

  return (
    <article className="group shine-border-hover relative h-full overflow-hidden rounded-xl border project-card transition duration-300 hover:-translate-y-1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full opacity-25 blur-3xl transition duration-500 group-hover:opacity-60"
        style={{ background: accent }}
      />
      <Link
        href={post.href}
        aria-label={`Read ${post.title}`}
        className="absolute inset-0 z-10 rounded-xl"
      />

      <div className={cn("pointer-events-none relative z-20 flex h-full flex-col", styles.padding)}>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-2 font-mono tracking-[0.14em] project-card-index uppercase">
            <i className="h-2 w-2 rounded-full" style={{ background: accent }} />
            {post.categoryName}
          </span>
          {badge && (
            <span className="rounded-full border border-(--site-accent) px-2 py-0.5 text-[10px] tracking-widest site-nav-active uppercase">
              {badge}
            </span>
          )}
          {post.date && (
            <time dateTime={post.date} className="ml-auto resume-muted">
              {formatDate(post.date)}
            </time>
          )}
        </div>

        <Heading
          className={cn("mt-5 font-semibold tracking-[-0.04em] project-card-title", styles.title)}
        >
          {post.title}
        </Heading>

        {post.description && !compact && (
          <p className={cn("mt-3 line-clamp-3 resume-muted", styles.description)}>
            {post.description}
          </p>
        )}

        {!compact && visibleTags.length > 0 && (
          <ul className="mt-4 flex flex-wrap items-center gap-2">
            {visibleTags.map((tag) => (
              <li key={tag.href}>
                <Link
                  href={tag.href}
                  className={cn(
                    pillClass,
                    "pointer-events-auto relative z-30 inline-block px-2.5 py-0.5 text-xs",
                  )}
                >
                  #{tag.name}
                </Link>
              </li>
            ))}
            {hiddenTags > 0 && <li className="text-xs resume-muted">+{hiddenTags}</li>}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t resume-intro pt-4 text-xs resume-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {post.minutes} min
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm project-card-link">
            Read
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
