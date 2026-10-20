import { notFound, permanentRedirect } from "next/navigation";

import { blogConfig } from "@/data/blog";
import { entryHref } from "@/lib/content-format";
import { contentSources, getEntry } from "@/lib/github-content";

type Props = { params: Promise<{ slug: string }> };

// Old URL scheme: /blog/post/<slug>  ->  /blog/<category>/<slug>
export default async function LegacyPostRedirect({ params }: Props) {
  const { slug } = await params;
  const entry = await getEntry(contentSources.blog, slug);

  if (!entry) notFound();

  permanentRedirect(entryHref(blogConfig.basePath, entry));
}
