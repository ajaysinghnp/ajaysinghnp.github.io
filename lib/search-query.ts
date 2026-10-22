export type SearchDocumentType = "page" | "project" | "blog" | "cheatsheet";

export interface SearchDocument {
  title: string;
  href: string;
  section: string;
  text: string;
  type: SearchDocumentType;
  category?: string;
  tags?: string[];
}

export type SearchFilter =
  | { field: "type"; value: SearchDocumentType }
  | { field: "category" | "tag"; type: SearchDocumentType; value: string };

export interface ParsedSearchQuery {
  terms: string[];
  filters: SearchFilter[];
}

const TYPE_ALIASES: Record<string, SearchDocumentType> = {
  page: "page",
  pages: "page",
  site: "page",
  project: "project",
  projects: "project",
  blog: "blog",
  blogs: "blog",
  post: "blog",
  posts: "blog",
  cheatsheet: "cheatsheet",
  cheatsheets: "cheatsheet",
};

const tokensFrom = (input: string) =>
  (input.match(/"[^\"]*"|'[^']*'|\S+/g) ?? []).map((token) =>
    token.length >= 2 && `"'`.includes(token[0]) && token[0] === token.at(-1)
      ? token.slice(1, -1)
      : token,
  );

export function parseSearchQuery(input: string): ParsedSearchQuery {
  const tokens = tokensFrom(input.trim());
  const terms: string[] = [];
  const filters: SearchFilter[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const typeMatch = /^type:([a-z-]+)$/i.exec(token);
    if (typeMatch) {
      const type = TYPE_ALIASES[typeMatch[1].toLowerCase()];
      if (type) {
        filters.push({ field: "type", value: type });
        continue;
      }
    }

    const facetMatch = /^([a-z-]+):([@#])(.+)$/i.exec(token);
    if (facetMatch) {
      const type = TYPE_ALIASES[facetMatch[1].toLowerCase()];
      if (type) {
        filters.push({
          field: facetMatch[2] === "@" ? "category" : "tag",
          type,
          value: facetMatch[3].toLowerCase(),
        });
        continue;
      }
    }

    terms.push(token.toLowerCase());
  }

  return { terms, filters };
}

export function scoreSearchDocument(document: SearchDocument, query: ParsedSearchQuery) {
  const category = document.category?.toLowerCase() ?? "";
  const tags = (document.tags ?? []).map((tag) => tag.toLowerCase());

  for (const filter of query.filters) {
    if (filter.field === "type" && document.type !== filter.value) return -1;
    if (
      filter.field === "category" &&
      (document.type !== filter.type ||
        !(
          category === filter.value ||
          category.startsWith(`${filter.value}/`) ||
          category.split("/").includes(filter.value)
        ))
    ) {
      return -1;
    }
    if (filter.field === "tag" && (document.type !== filter.type || !tags.includes(filter.value))) {
      return -1;
    }
  }

  const title = document.title.toLowerCase();
  const text = [document.section, document.text, category, ...tags].join(" ").toLowerCase();
  if (!query.terms.every((term) => title.includes(term) || text.includes(term))) return -1;

  return (
    query.filters.length * 10 +
    query.terms.reduce(
      (score, term) =>
        score +
        (title.includes(term) ? 8 : 0) +
        (category.includes(term) || tags.includes(term) ? 4 : 0) +
        (text.includes(term) ? 1 : 0),
      title === query.terms.join(" ") ? 20 : 0,
    )
  );
}
