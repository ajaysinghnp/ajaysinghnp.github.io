// app/projects/page.tsx  (no "use client")
import { fetchProjects } from "@/lib/projects";
import { ProjectsClient } from "@/components/projects-client";

export const revalidate = 21600;

export default async function ProjectsPage() {
  const projects = await fetchProjects();
  return <ProjectsClient projects={projects} />;
}