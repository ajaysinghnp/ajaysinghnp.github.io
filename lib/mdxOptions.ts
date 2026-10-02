import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkGemoji from "remark-gemoji";
import remarkToc from "remark-toc";

export const options = {
  mdxOptions: {
    format: "md",
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "append", properties: { className: ["subheading-anchor"] } }],
      [rehypePrettyCode, { theme: "github-dark", defaultLang: "plaintext" }],
    ],
    remarkPlugins: [remarkGemoji, remarkGfm, [remarkToc, { ordered: true, tight: false, maxDepth: 3, parents: ["listItem", "root"], skip: "delta" }]],
  },
};
