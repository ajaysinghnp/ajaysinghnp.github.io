import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";

interface HastNode {
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function rehypeDiffLines() {
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      if (node.tagName === "code" && node.properties?.["data-language"] === "diff") {
        for (const line of node.children ?? []) {
          if (line.tagName !== "span" || line.properties?.["data-line"] === undefined) continue;

          const value = getText(line);
          if (value.startsWith("+") && !value.startsWith("+++")) {
            line.properties["data-diff"] = "add";
          } else if (value.startsWith("-") && !value.startsWith("---")) {
            line.properties["data-diff"] = "remove";
          }
        }
      }

      for (const child of node.children ?? []) visit(child);
    };

    visit(tree);
  };
}

function rehypeMarkInlineCode() {
  return (tree: HastNode) => {
    const visit = (node: HastNode, insidePre = false) => {
      const isPre = node.tagName === "pre";
      if (node.tagName === "code" && !insidePre) {
        node.properties ??= {};
        node.properties["data-inline-code"] = "true";
      }

      for (const child of node.children ?? []) visit(child, insidePre || isPre);
    };

    visit(tree);
  };
}

function getText(node: HastNode): string {
  return node.value ?? (node.children ?? []).map(getText).join("");
}

export const options: NonNullable<MDXRemoteProps["options"]> = {
  mdxOptions: {
    format: "md",
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        { behavior: "append", properties: { className: ["subheading-anchor"] } },
      ],
      rehypeKatex,
      [
        rehypePrettyCode,
        {
          theme: { light: "github-light", dark: "github-dark" },
          defaultLang: "plaintext",
        },
      ],
      rehypeDiffLines,
      rehypeMarkInlineCode,
    ],
    remarkPlugins: [
      remarkGemoji,
      remarkGfm,
      remarkMath,
      [
        remarkToc,
        { ordered: true, tight: false, maxDepth: 3, parents: ["listItem", "root"], skip: "delta" },
      ],
    ],
  },
};
