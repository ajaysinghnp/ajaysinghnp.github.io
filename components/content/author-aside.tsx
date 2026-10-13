import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authorHref } from "@/lib/content-format";
import type { Author } from "@/types/blog";

interface Props {
  author: Author;
  basePath: string;
  hue: number;
}

export function AuthorAside({ author, basePath, hue }: Props) {
  return (
    <section aria-label="Author">
      <p className="mb-2 text-[10px] tracking-[0.16em] resume-muted uppercase">Written by</p>
      <Link
        href={authorHref(basePath, author)}
        target="_blank"
        rel="noopener noreferrer"
        className="group shine-border-hover relative flex items-center gap-3 rounded-xl border border-(--site-surface-border) p-3 transition hover:border-(--site-accent)"
      >
        <Avatar className="size-11 shrink-0">
          {author.avatar && (
            <AvatarImage src={author.avatar} alt="" className="object-cover object-top" />
          )}
          <AvatarFallback
            className="text-base font-semibold text-white"
            style={{ background: `hsl(${hue} 70% 42%)` }}
          >
            {author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-(--site-text)">
            {author.name}
            <span className="sr-only">(opens in a new tab)</span>
          </span>
          {author.role && (
            <span className="block truncate text-xs resume-muted">{author.role}</span>
          )}
        </span>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-(--site-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </Link>
    </section>
  );
}
