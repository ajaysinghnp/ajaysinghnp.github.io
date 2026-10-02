import { Project } from "@/types/github";
import { fetchProjectReadme, fetchProjects } from "@/lib/projects";
import { extractProjectToc } from "@/lib/project-toc";
import ProjectHeader from "./header";
import { MDX } from "@/components/mdx";
import { ProjectToc } from "@/components/project-toc";

type Props = {
  params: Promise<{
    name: string;
  }>;
};

type StaticParams = {
  name: string;
};

export async function generateStaticParams(): Promise<StaticParams[]> {
  try {
    const projs: Project[] = await fetchProjects();
    return projs.map((proj) => ({ name: proj.name }));
  } catch {
    console.warn(
      "GitHub project list unavailable during build; project pages will be rendered on demand.",
    );
    return [];
  }
}

export default async function ProjectLoadingPage({ params }: Props) {
  const { name: rawName } = await params;
  const name = decodeURIComponent(rawName);
  const readMe: string = await fetchProjectReadme(name);
  const toc = await extractProjectToc(readMe);

  return (
    <main className="resume-shell pb-16">
      <ProjectHeader project_name={name} />
      <div className={toc.length ? "project-content-layout" : undefined}>
        {toc.length > 0 && <ProjectToc items={toc} />}
        <MDX source={readMe} />
      </div>
    </main>
  );
}
