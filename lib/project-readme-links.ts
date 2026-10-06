// lib/project-readme-links.ts
import path from "node:path";

interface ReadmeLinkOptions {
  owner: string;
  repository: string;
  branch: string;
  readmePath?: string;
}

interface HastNode {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function isExternalUrl(value: string): boolean {
  return (
    value.startsWith("#") ||
    value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("data:")
  );
}

function splitUrl(value: string) {
  const match = value.match(/^([^?#]*)([?#].*)?$/);

  return {
    pathname: match?.[1] ?? value,
    suffix: match?.[2] ?? "",
  };
}

function encodeRepositoryPath(value: string): string {
  return value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function resolveRepositoryPath(target: string, readmePath: string): string {
  const readmeDirectory = path.posix.dirname(readmePath);

  return path.posix.normalize(path.posix.join(readmeDirectory, target));
}

function githubRawUrl(options: ReadmeLinkOptions, filePath: string, suffix: string): string {
  return `https://raw.githubusercontent.com/${options.owner}/${options.repository}/${encodeURIComponent(options.branch)}/${encodeRepositoryPath(filePath)}${suffix}`;
}

function githubBlobUrl(options: ReadmeLinkOptions, filePath: string, suffix: string): string {
  return `https://github.com/${options.owner}/${options.repository}/blob/${encodeURIComponent(options.branch)}/${encodeRepositoryPath(filePath)}${suffix}`;
}

function resolveGithubUrl(value: string, options: ReadmeLinkOptions): string {
  if (!value || isExternalUrl(value)) {
    return value;
  }

  const { pathname, suffix } = splitUrl(value);

  if (!pathname) {
    return value;
  }

  const filePath = resolveRepositoryPath(pathname, options.readmePath ?? "README.md");

  if (/\.(md|mdx)$/i.test(filePath)) {
    return githubBlobUrl(options, filePath, suffix);
  }

  return githubRawUrl(options, filePath, suffix);
}

export function rehypeResolveGithubLinks(options: ReadmeLinkOptions) {
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      if ((node.tagName === "img" || node.tagName === "a") && node.properties) {
        const propertyName = node.tagName === "img" ? "src" : "href";
        const value = node.properties[propertyName];

        if (typeof value === "string") {
          node.properties[propertyName] = resolveGithubUrl(value, options);
        }
      }

      for (const child of node.children ?? []) {
        visit(child);
      }
    };

    visit(tree);
  };
}
