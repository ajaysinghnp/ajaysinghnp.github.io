import { MDXRemote } from "next-mdx-remote/rsc";

import { options } from "@/lib/mdx-options";

export function MDX({ source }: { source: string }) {
  return (
    <article className="project-readme prose-quoteless mx-auto prose mt-6 max-w-full rounded-2xl border p-6 sm:p-10">
      <MDXRemote
        source={source}
        options={options}
        components={
          {
            // ...your components
          }
        }
      />
    </article>
  );
}

MDX.displayName = "MDX";
