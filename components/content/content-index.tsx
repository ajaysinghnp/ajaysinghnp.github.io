import { Chip } from "@/components/content/chip";
import { ContentList } from "@/components/content/content-list";
import { Marquee } from "@/components/content/marquee";
import {
  categoryHref,
  type CategorySummary,
  formatDate,
  type TagSummary,
  toSummary,
} from "@/lib/content-format";
import type { ContentEntry } from "@/types/blog";

interface Props {
  entries: ContentEntry[];
  categories: CategorySummary[]; // chips to show: the children of the current level
  tags: TagSummary[];
  labels: Record<string, string>;
  basePath: string;
  activeCategory?: string;
  activeTag?: string;
  eyebrow: React.ReactNode;
  heading: string;
  intro: string;
}

const stat = "rounded-full border border-(--site-surface-border) px-3 py-1";

export function ContentIndex({
  entries,
  categories,
  tags,
  labels,
  basePath,
  activeCategory,
  activeTag,
  eyebrow,
  heading,
  intro,
}: Props) {
  const posts = entries.map((entry) => toSummary(entry, basePath, labels));
  const latest = entries[0]?.meta.date;

  return (
    <main className="w-full pb-20 resume-shell">
      <header className="grid gap-10 border-b resume-intro pb-14 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div>
          <div className="section-code">{eyebrow}</div>
          <h1 className="sparkle-text mt-5 max-w-4xl text-6xl leading-[0.92] font-semibold tracking-[-0.06em] sm:text-8xl">
            {heading}
          </h1>
        </div>
        <div>
          <p className="max-w-xl text-xl leading-8 resume-lead">{intro}</p>
          <ul className="mt-6 flex flex-wrap gap-2 font-mono text-xs tracking-[0.08em] resume-muted">
            <li className={stat}>
              {entries.length} {entries.length === 1 ? "post" : "posts"}
            </li>
            {tags.length > 0 && (
              <li className={stat}>
                {tags.length} {tags.length === 1 ? "tag" : "tags"}
              </li>
            )}
            {latest && <li className={stat}>latest {formatDate(latest)}</li>}
          </ul>
        </div>
      </header>

      <nav aria-label="Categories" className="mt-10">
        <Marquee>
          <Chip href={basePath} active={!activeCategory && !activeTag}>
            All
          </Chip>
          {categories.map((category) => (
            <Chip key={category.path} href={categoryHref(basePath, category.path)} active={false}>
              {category.label} <span className="opacity-60">{category.count}</span>
            </Chip>
          ))}
        </Marquee>
      </nav>

      {tags.length > 0 && (
        <nav aria-label="Tags" className="mt-2">
          <Marquee>
            {tags.map((tag) => (
              <Chip
                key={tag.slug}
                href={`${basePath}/tag/${tag.slug}`}
                active={tag.slug === activeTag}
              >
                #{tag.name}
              </Chip>
            ))}
          </Marquee>
        </nav>
      )}

      {entries.length === 0 ? (
        <p className="mt-10 resume-muted">Nothing here yet.</p>
      ) : (
        <ContentList posts={posts} showFeatured={!activeCategory && !activeTag} />
      )}
    </main>
  );
}
