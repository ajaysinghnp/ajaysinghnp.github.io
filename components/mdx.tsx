import { Suspense } from "react";

import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { MDXRemote } from "next-mdx-remote/rsc";

import { options } from "@/lib/mdx-options";

import { components } from "./mdx-components";

export function MDX(props: MDXRemoteProps) {
  return (
    <Suspense fallback="Loading Contents...">
      <article className="project-readme prose-quoteless mx-auto prose mt-6 max-w-full rounded-2xl border p-6 sm:p-10">
        <MDXRemote
          {...props}
          options={options}
          components={{ ...components, ...props.components }}
        />
      </article>
    </Suspense>
  );
}
