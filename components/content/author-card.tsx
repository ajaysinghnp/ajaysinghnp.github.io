import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authorHref, bioExcerpt } from "@/lib/content-format";
import type { Author } from "@/types/blog";

interface Props {
  author: Author;
  basePath: string;
  hue: number;
}

export function AuthorCard({ author, basePath, hue }: Props) {
  const summary = bioExcerpt(author.bio);

  return (
    <section
      aria-label="About the author"
      className="shine-border-hover relative mt-10 flex flex-col gap-5 resume-surface rounded-2xl border p-6 sm:flex-row sm:items-center sm:p-8"
    >
      <Avatar className="size-20 shrink-0 ring-1 ring-(--site-surface-border)">
        {author.avatar && (
          <AvatarImage src={author.avatar} alt={author.name} className="object-cover object-top" />
        )}
        <AvatarFallback
          className="text-2xl font-semibold text-white"
          style={{ background: `hsl(${hue} 70% 42%)` }}
        >
          {author.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <p className="section-code">// about the author</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-(--site-text)">
          {author.name}
        </h2>
        {author.role && <p className="text-sm resume-muted">{author.role}</p>}
        {summary && <p className="mt-3 line-clamp-3 text-sm leading-7 resume-muted">{summary}</p>}
        <Link
          href={authorHref(basePath, author)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm site-nav-active hover:underline"
        >
          More from {author.name}
          <span className="sr-only">(opens in a new tab)</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
