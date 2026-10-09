import { compileMDX } from "next-mdx-remote/rsc";

import { components } from "@/components/mdx/mdx-components";
import { options } from "@/lib/mdx-options";
import { rehypeResolveGithubLinks } from "@/lib/project-readme-links";

interface Props {
  source: string;
  repo: string; // "owner/name"
  branch: string;
  path: string; // the content file's path; relative images and links resolve against its folder
}

interface LinkOptions {
  owner: string;
  repository: string;
  branch: string;
  readmePath: string;
}

async function compile(source: string, format: "md" | "mdx", link: LinkOptions) {
  const { content } = await compileMDX({
    source,
    components,
    options: {
      mdxOptions: {
        ...options.mdxOptions,
        format,
        rehypePlugins: [
          ...(options.mdxOptions?.rehypePlugins ?? []),
          [rehypeResolveGithubLinks, link],
        ],
      },
    },
  });

  return content;
}

export async function ContentMdx({ source, repo, branch, path }: Props) {
  const [owner, repository] = repo.split("/");
  const link = { owner, repository, branch, readmePath: path };
  const isMdx = path.toLowerCase().endsWith(".mdx");

  let content: Awaited<ReturnType<typeof compile>>;

  try {
    content = await compile(source, isMdx ? "mdx" : "md", link);
  } catch (error) {
    if (!isMdx) throw error;
    // A stray "{" or "<" breaks strict MDX; plain Markdown still renders the post.
    console.warn(`MDX compile failed for ${path}; falling back to Markdown.`);
    content = await compile(source, "md", link);
  }

  return (
    <article className="project-readme prose-quoteless mx-auto prose mt-6 max-w-full rounded-2xl border p-6 sm:p-10 prose-p:leading-normal prose-li:leading-normal">
      {content}
    </article>
  );
}
