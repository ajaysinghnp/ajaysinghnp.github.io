import { notFound } from "next/navigation";

import { ProjectView } from "@/components/mdx/project-view";
import { extractProjectToc } from "@/lib/project-toc";
import { fetchProject, fetchProjectReadme, fetchProjects } from "@/lib/projects";

export const revalidate = 21600;
export const dynamicParams = true;

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateStaticParams() {
  return [];
}

export default async function ProjectPage({ params }: Props) {
  const { name } = await params;
  const projects = await fetchProjects();

  if (!projects.some((p) => p.name === name)) {
    notFound();
  }

  const [project, readme] = await Promise.all([fetchProject(name), fetchProjectReadme(name)]);

  if (!project) {
    notFound();
  }

  const toc = await extractProjectToc(readme.content);

  return <ProjectView project={project} readme={readme} toc={toc} />;
}
