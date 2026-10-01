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

  return (
    <main className="space-y-2">
      <ProjectHeader project_name={name} />
      <MDX source={readMe} />
    </main>
  );
}
