import Link from "next/link";

import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { pillClass } from "@/components/content/chip";
import { ContentMdx } from "@/components/content/content-mdx";
import { PostCard } from "@/components/content/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { categoryHue } from "@/lib/content-format";
import { cn } from "@/lib/utils";
import type { Author, ContentSource, PostSummary } from "@/types/blog";

interface Props {
  author: Author;
  posts: PostSummary[];
  source: ContentSource;
  basePath: string;
}

export function AuthorView({ author, posts, source, basePath }: Props) {
  const hue = categoryHue(author.id);

  return (
    <main className="pb-16 resume-shell">
      <Link
        href={basePath}
        className="mt-5 mb-6 inline-flex items-center gap-2 rounded-full border border-(--site-surface-border) px-4 py-2 text-sm text-(--site-muted) transition hover:border-(--site-accent) hover:site-nav-active"
      >
        <ArrowLeft className="h-4 w-4" />
        All posts
      </Link>

      <header className="shine-border-hover relative overflow-hidden resume-surface rounded-2xl p-6 sm:p-9 lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ background: `hsl(${hue} 85% 55%)` }}
        />

        <Breadcrumbs
          className="relative section-code"
          items={[{ label: "Blog", href: basePath }, { label: "Author" }]}
        />

        <div className="relative mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <Avatar className="size-28 shrink-0 ring-1 ring-(--site-surface-border) sm:size-36">
            {author.avatar && (
              <AvatarImage
                src={author.avatar}
                alt={author.name}
                className="object-cover object-top"
              />
            )}
            <AvatarFallback
              className="text-4xl font-semibold text-white sm:text-5xl"
              style={{ background: `hsl(${hue} 70% 42%)` }}
            >
              {author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h1 className="text-4xl leading-tight font-semibold tracking-[-0.055em] wrap-break-word site-nav-active sm:text-6xl">
              {author.name}
            </h1>
            {author.role && <p className="mt-2 text-base resume-lead sm:text-lg">{author.role}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm resume-muted">
              {author.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {author.location}
                </span>
              )}
              <span>
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </span>
            </div>
          </div>
        </div>

        {author.links.length > 0 && (
          <ul className="relative mt-6 flex flex-wrap gap-2">
            {author.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className={cn(pillClass, "inline-flex items-center gap-1.5 px-3 py-1 text-xs")}
                >
                  {link.label}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      {author.bio && (
        <ContentMdx
          source={author.bio}
          repo={source.repo}
          branch={source.branch}
          path={author.path}
        />
      )}

      <section className="mt-12">
        <p className="section-code">posts</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tighter site-nav-active">
          Posts by {author.name}.
        </h2>

        {posts.length === 0 ? (
          <p className="mt-6 resume-muted">No posts yet.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.key} post={post} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
