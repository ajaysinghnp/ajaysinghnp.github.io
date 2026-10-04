import { notFound } from "next/navigation";

import { MDX } from "@/components/mdx/mdx";
import { ProjectToc } from "@/components/mdx/project-toc";
import { extractProjectToc } from "@/lib/project-toc";
import { fetchProjectReadme, fetchProjects } from "@/lib/projects";

import ProjectHeader from "./header";

export const revalidate = 21600;
export const dynamicParams = true;

type Props = {
  params: Promise<{
    name: string;
  }>;
};

export async function generateStaticParams() {
  return []; // don't hit GitHub at build; render on first visit, then cache
}

export default async function ProjectLoadingPage({ params }: Props) {
  const { name: rawName } = await params;
  const projects = await fetchProjects(); // cached, also filters private and excluded repos

  if (!projects.some((p) => p.name === rawName)) notFound();

  const readme = await fetchProjectReadme(rawName);
  const toc = await extractProjectToc(readme);

  return (
    <main className="pb-16 resume-shell">
      <ProjectHeader project_name={rawName} />
      <div className={toc.length ? "project-content-layout" : undefined}>
        {toc.length > 0 && <ProjectToc items={toc} />}
        <MDX source={readme} />
      </div>
    </main>
  );
}
