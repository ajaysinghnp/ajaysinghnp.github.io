"use client";

import { type ReactNode, useRef } from "react";

import ProjectHeader from "@/app/projects/[name]/header";
import type { ProjectTocItem } from "@/lib/project-toc";

import { ProjectToc } from "./project-toc";

interface Props {
  project_name: string;
  toc: ProjectTocItem[];
  readme: string;
  children: ReactNode; // the server-rendered <MDX />
}

function ProjectDetailsClient({ project_name, toc, readme, children }: Props) {
  const readmeRef = useRef<HTMLDivElement>(null);

  if (readme === undefined || readme === "") {
    return (
      <main>
        <h1>Loading the ReadMe</h1>
        <p>Please wait while we load the readme file from the project...</p>
      </main>
    );
  }

  return (
    <main className="pb-16 resume-shell">
      <ProjectHeader project_name={project_name} readme={readme} readmeRef={readmeRef} />

      <div className={toc.length ? "project-content-layout" : undefined}>
        {toc.length > 0 && <ProjectToc items={toc} />}

        {/* the ref lives on a plain div, which is what the PDF export clones */}
        <div ref={readmeRef} className="min-w-0">
          {children}
        </div>
      </div>
    </main>
  );
}

export default ProjectDetailsClient;
