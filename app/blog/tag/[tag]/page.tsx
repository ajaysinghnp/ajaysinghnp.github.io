import type { Metadata } from "next";

import { SectionTag, tagMetadata } from "@/components/content/section-pages";
import { blogSection } from "@/data/blog";

export const dynamicParams = true;

type Props = { params: Promise<{ tag: string }> };

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return tagMetadata(blogSection, tag);
}

export default async function BlogTagPage({ params }: Props) {
  const { tag } = await params;
  return <SectionTag section={blogSection} tag={tag} />;
}
