// app/projects/loading.tsx
import { ProjectsState } from "@/components/mdx/projects-client";
import { blogConfig } from "@/data/blog";

export default function Loading() {
  return <ProjectsState eyebrow={blogConfig.page.eyebrow} label="Scanning the blog signal..." />;
}
