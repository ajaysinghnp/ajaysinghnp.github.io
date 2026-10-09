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
}

export interface ContentMeta {
  title?: string;
  description?: string;
  date?: string;
  updated?: string;
  author?: string;
  tags: string[];
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
  hue: number;
  isNew: boolean;
}
