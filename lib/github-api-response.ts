import "server-only";

import axios from "axios";
import { NextResponse } from "next/server";

export const githubApiErrorResponse = (error: unknown, resource: string): NextResponse => {
  const upstreamStatus = axios.isAxiosError(error) ? error.response?.status : undefined;
  const status = upstreamStatus === 403 || upstreamStatus === 429 ? 503 : 502;

  console.warn(`GitHub ${resource} request failed (status ${upstreamStatus ?? "unknown"}).`);

  return NextResponse.json(
    { error: "GitHub is temporarily unavailable. Please try again shortly." },
    { status, headers: { "Cache-Control": "no-store" } },
  );
};
