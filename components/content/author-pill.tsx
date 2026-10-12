import Link from "next/link";

import { pillClass } from "@/components/content/chip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authorHref } from "@/lib/content-format";
import { cn } from "@/lib/utils";
import type { Author } from "@/types/blog";

interface Props {
  author: Author | null;
  fallbackName: string; // the raw value from the post's frontmatter
  hue: number;
  basePath: string;
}

export function AuthorPill({ author, fallbackName, hue, basePath }: Props) {
  const name = author?.name ?? fallbackName;

  const avatar = (
    <Avatar className="size-5">
      {author?.avatar && (
        <AvatarImage src={author.avatar} alt="" className="object-cover object-top" />
      )}
      <AvatarFallback
        className="text-[10px] font-semibold text-white"
        style={{ background: `hsl(${hue} 70% 42%)` }}
      >
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  // No author file: keep the plain, non-link pill.
  if (!author) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-(--site-surface-border) px-3 py-1 text-xs resume-muted">
        {avatar}
        {name}
      </span>
    );
  }

  return (
    <Link
      href={authorHref(basePath, author)}
      className={cn(pillClass, "inline-flex items-center gap-1.5 px-3 py-1 text-xs")}
    >
      {avatar}
      {name}
    </Link>
  );
}
