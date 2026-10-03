import { extractProjectToc } from "@/lib/project-toc";
import ProjectHeader from "./header";
import { MDX } from "@/components/mdx";
import { ProjectToc } from "@/components/project-toc";
import { fetchProjects, fetchProjectReadme } from "@/lib/projects";
import { notFound } from "next/navigation";

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
    <main className="resume-shell pb-16">
      <ProjectHeader project_name={rawName} />
      <div className={toc.length ? "project-content-layout" : undefined}>
        {toc.length > 0 && <ProjectToc items={toc} />}
        <MDX source={readme} />
      </div>
    </main>
  );
}
