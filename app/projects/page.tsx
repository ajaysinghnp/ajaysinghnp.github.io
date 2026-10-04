// app/projects/page.tsx  (no "use client")
import { ProjectsClient } from "@/components/mdx/projects-client";
import { fetchProjects } from "@/lib/projects";

export const revalidate = 21600;

export default async function ProjectsPage() {
  const projects = await fetchProjects();
  return <ProjectsClient projects={projects} />;
}
