import { options } from "@/lib/mdxOptions";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Suspense } from "react";
import { components } from "./mdx-components";

export function MDX(props: any) {
  return (
    <Suspense fallback={<>Loading Contents...</>}>
      <article className="project-readme prose prose-quoteless mx-auto mt-6 max-w-full rounded-2xl border p-6 sm:p-10">
        <MDXRemote
          {...props}
          options={options}
          components={{ ...components, ...(props.components || {}) }}
        />
      </article>
    </Suspense>
  );
}
