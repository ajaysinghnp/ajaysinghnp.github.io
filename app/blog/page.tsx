import type { Metadata } from "next";

import { SectionIndex } from "@/components/content/section-pages";
import { blogSection } from "@/data/blog";

export const metadata: Metadata = {
  title: blogSection.page.title,
  description: blogSection.page.description,
};

export default function BlogPage() {
  return <SectionIndex section={blogSection} />;
}
