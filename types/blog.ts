export interface ContentSource {
  key: string;
  repo: string; // "owner/name"
  branch: string;
  dir: string; // folder holding the content tree, "" for the repo root
  extensions: string[];
  tag: string; // cache tag
  revalidate: number;
  labels: Record<string, string>; // category path or segment -> display name
  listHidden: boolean; // list posts from hidden categories everywhere
  authorsDir?: string; // folder of author profiles, e.g. "authors"
  authorsFrom?: ContentSource; // read author profiles from another source (e.g. the blog repo)
}

// One public section of the site (blog, cheatsheets, ...) built from a content source.
export interface ContentSection {
  source: ContentSource;
  basePath: string; // e.g. "/blog"
  rootLabel: string; // breadcrumb root, e.g. "Blog"
  itemLabel: string; // singular noun for counts, e.g. "post" or "sheet"
  list: "timeline" | "reference"; // how the index lists items
  authorBasePath?: string; // where author pages live, when different from basePath
  page: { title: string; description: string; eyebrow: string; heading: string; intro: string };
}

export interface ContentMeta {
  title?: string;
  description?: string;
  date?: string;
  updated?: string;
  author?: string;
  tags: string[];
  details: { label: string; value: string }[]; // optional device/spec fields from frontmatter
}

export interface ContentRef {
  slug: string;
  category: string; // logical path, e.g. "web-development/nextjs"
  hidden: boolean;
  path: string; // the content file's path in the repo
}

export interface ContentEntry extends ContentRef {
  meta: ContentMeta;
  content: string;
  draft: boolean;
}

export interface PostSummary {
  key: string;
  href: string;
  title: string;
  description?: string;
  date?: string;
  updated?: string;
  tags: string[];
  tagLinks: { name: string; href: string }[];
  minutes: number;
  category: string;
  categoryName: string;
  topCategory: string; // first segment of the category path
  topCategoryName: string;
  hue: number;
  isNew: boolean;
}

export interface AuthorLink {
  label: string;
  href: string;
}

export interface Author {
  id: string;
  name: string;
  role?: string;
  location?: string;
  github?: string;
  avatar?: string; // resolved image URL
  links: AuthorLink[];
  bio: string; // Markdown
  path: string; // the author file's path in the repo
}
