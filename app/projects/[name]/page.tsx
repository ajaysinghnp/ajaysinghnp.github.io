import { notFound } from "next/navigation";

import { MDX } from "@/components/mdx/mdx";
import ProjectDetailsClient from "@/components/mdx/project-detail-client";
import { extractProjectToc } from "@/lib/project-toc";
import { fetchProjectReadme, fetchProjects } from "@/lib/projects";

export const revalidate = 21600;
export const dynamicParams = true;

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateStaticParams() {
  return [];
}

export default async function ProjectLoadingPage({ params }: Props) {
  const { name: projectName } = await params;
  const projects = await fetchProjects();

  if (!projects.some((p) => p.name === projectName)) {
    notFound();
  }

  const readme = await fetchProjectReadme(projectName);
  const toc = await extractProjectToc(readme.content);

  return (
    <ProjectDetailsClient project_name={projectName} toc={toc} readme={readme.content}>
      <MDX
        source={readme.content}
        repository={readme.repository}
        branch={readme.branch}
        readmePath={readme.path}
      />
    </ProjectDetailsClient>
  );
}
