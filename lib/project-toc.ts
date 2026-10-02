import GithubSlugger from "github-slugger";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGemoji from "remark-gemoji";
import remarkMath from "remark-math";
import type { Heading, PhrasingContent, Root } from "mdast";

export interface ProjectTocItem {
  id: string;
  title: string;
  children: ProjectTocItem[];
}

function getHeadingText(nodes: PhrasingContent[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text" || node.type === "inlineCode") return node.value;
      if (node.type === "image" || node.type === "imageReference") return node.alt ?? "";
      if ("children" in node) return getHeadingText(node.children as PhrasingContent[]);
      if ("value" in node && typeof node.value === "string") return node.value;
      return "";
    })
    .join("");
}

function isHeading(node: Root["children"][number]): node is Heading {
  return node.type === "heading";
}

export async function extractProjectToc(source: string): Promise<ProjectTocItem[]> {
  if (!source) return [];

  const processor = unified()
    .use(remarkParse)
    .use(remarkGemoji)
    .use(remarkMath);
  const tree = processor.parse(source) as Root;
  const transformed = (await processor.run(tree)) as Root;
  const slugger = new GithubSlugger();
  const roots: ProjectTocItem[] = [];
  const parents: ProjectTocItem[] = [];

  for (const node of transformed.children) {
    if (!isHeading(node) || node.depth < 2 || node.depth > 4) continue;

    const title = getHeadingText(node.children as PhrasingContent[]).trim();
    if (!title) continue;

    const item: ProjectTocItem = {
      id: slugger.slug(title),
      title,
      children: [],
    };

    if (node.depth === 2) {
      roots.push(item);
      parents.length = 0;
      parents[2] = item;
      continue;
    }

    let parent = parents[node.depth - 1];
    if (!parent) {
      parent = roots[roots.length - 1];
    }

    if (parent) parent.children.push(item);
    else roots.push(item);
    parents[node.depth] = item;
    parents.length = node.depth + 1;
  }

  return roots;
}
