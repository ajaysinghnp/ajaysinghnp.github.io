import { NextResponse } from "next/server";

import { githubApiErrorResponse } from "@/lib/github-api-response";
import { fetchProject } from "@/lib/projects";

type RouteContext = {
  params: Promise<{ name: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { name } = await params;

  try {
    const project = await fetchProject(name);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404, headers: { "Cache-Control": "public, max-age=60" } },
      );
    }

    return NextResponse.json(project, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return githubApiErrorResponse(error, "project detail");
  }
}
