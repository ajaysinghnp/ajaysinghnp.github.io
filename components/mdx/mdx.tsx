import { MDXRemote } from "next-mdx-remote/rsc";

import { githubUsername } from "@/lib/github-config";
import { options } from "@/lib/mdx-options";
import { rehypeResolveGithubLinks } from "@/lib/project-readme-links";

type MDXProps = {
  source: string;
  repository: string;
  branch: string;
  readmePath?: string;
};

export function MDX({ source, repository, branch, readmePath = "README.md" }: MDXProps) {
  return (
    <article className="project-readme prose-quoteless mx-auto prose mt-6 max-w-full rounded-2xl border p-6 sm:p-10 prose-p:leading-[1.5] prose-li:leading-[1.5]">
      <MDXRemote
        source={source}
        options={{
          ...options,
          mdxOptions: {
            ...options.mdxOptions,
            rehypePlugins: [
              ...(options.mdxOptions?.rehypePlugins ?? []),
              [
                rehypeResolveGithubLinks,
                {
                  owner: githubUsername,
                  repository,
                  branch,
                  readmePath,
                },
              ],
            ],
          },
        }}
      />
    </article>
  );
}
