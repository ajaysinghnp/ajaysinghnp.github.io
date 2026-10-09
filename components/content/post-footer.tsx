import Link from "next/link";

import { PostCard } from "@/components/content/post-card";
import { entryHref, tagSlug, toSummary } from "@/lib/content-format";
import { listEntries } from "@/lib/github-content";
import { cn } from "@/lib/utils";
import type { ContentEntry, ContentSource } from "@/types/blog";

interface Props {
  entry: ContentEntry;
  source: ContentSource;
  basePath: string;
}

function NavCard({
  entry,
  basePath,
  label,
  alignRight,
}: {
  entry: ContentEntry;
  basePath: string;
  label: string;
  alignRight?: boolean;
}) {
  return (
    <Link
      href={entryHref(basePath, entry)}
      className={cn(
        "group shine-border-hover rounded-xl border project-card p-5 transition hover:-translate-y-0.5",
        alignRight && "sm:col-start-2 sm:text-right",
      )}
    >
      <span className="font-mono text-xs tracking-[0.14em] project-card-index uppercase">
        {label}
      </span>
      <span className="mt-2 block text-lg font-semibold tracking-[-0.03em] project-card-title">
        {entry.meta.title ?? entry.slug}
      </span>
    </Link>
  );
}

export async function PostFooter({ entry, source, basePath }: Props) {
  // Hidden posts are unlisted, so they don't link into the listed ones.
  if (entry.hidden) return null;

  const all = await listEntries(source);
  const index = all.findIndex((e) => e.path === entry.path);
  const newer = index > 0 ? all[index - 1] : undefined;
  const older = index >= 0 ? all[index + 1] : undefined;

  const tags = new Set(entry.meta.tags.map(tagSlug));
  const related = all
    .filter((e) => e.path !== entry.path)
    .map((e) => ({
      entry: e,
      score:
        e.meta.tags.filter((tag) => tags.has(tagSlug(tag))).length +
        (e.category === entry.category ? 0.5 : 0),
    }))
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || (b.entry.meta.date ?? "").localeCompare(a.entry.meta.date ?? ""),
    )
    .slice(0, 3);

  if (related.length === 0 && !newer && !older) return null;

  return (
    <footer className="mt-14">
      {related.length > 0 && (
        <section>
          <p className="section-code">// keep reading</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tighter text-(--site-text)">
            Related posts.
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {related.map(({ entry: item }) => (
              <PostCard
                key={item.path}
                post={toSummary(item, basePath, source.labels)}
                variant="compact"
              />
            ))}
          </div>
        </section>
      )}

      {(newer || older) && (
        <nav aria-label="Post navigation" className="mt-10 grid gap-4 sm:grid-cols-2">
          {newer && <NavCard entry={newer} basePath={basePath} label="← Newer" />}
          {older && <NavCard entry={older} basePath={basePath} label="Older →" alignRight />}
        </nav>
      )}
    </footer>
  );
}
