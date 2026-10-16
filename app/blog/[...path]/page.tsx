import type { Metadata } from "next";

import { pathMetadata, SectionPath } from "@/components/content/section-pages";
import { blogSection } from "@/data/blog";

export const dynamicParams = true;

type Props = { params: Promise<{ path: string[] }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  return pathMetadata(blogSection, path);
}

export default async function BlogPathPage({ params }: Props) {
  const { path } = await params;
  return <SectionPath section={blogSection} path={path} />;
}
