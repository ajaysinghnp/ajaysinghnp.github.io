import { NextResponse } from "next/server";

import { githubApiErrorResponse } from "@/lib/github-api-response";
import { fetchProjects } from "@/lib/projects";

export async function GET() {
  try {
    const projects = await fetchProjects();

    return NextResponse.json(projects, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return githubApiErrorResponse(error, "project list");
  }
}
