import { Project } from "@/types/github";
import { fetchProjectReadme, fetchProjects } from "@/lib/projects";
import ProjectHeader from "./header";
import { MDX } from "@/components/mdx";

type Props = {
  params: Promise<{
    name: string;
  }>;
};

type StaticParams = {
  name: string;
};

export async function generateStaticParams(): Promise<StaticParams[]> {
  const projs: Project[] = await fetchProjects();
  return projs.map((proj) => ({ name: proj.name }));
}

export default async function ProjectLoadingPage({ params }: Props) {
  const { name: rawName } = await params;
  const name = decodeURIComponent(rawName);
  const readMe: string = await fetchProjectReadme(name);
  console.log(`Loading project: ${readMe}`);

  return (
    <main className="space-y-2">
      <ProjectHeader project_name={name} />
      <MDX source={readMe} />
    </main>
  );
}
