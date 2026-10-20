import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { createHmac, timingSafeEqual } from "node:crypto";

import { contentSources } from "@/lib/github-content";

export async function POST(req: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const body = await req.text();
  const received = Buffer.from(req.headers.get("x-hub-signature-256") ?? "");
  const expected = Buffer.from(`sha256=${createHmac("sha256", secret).update(body).digest("hex")}`);

  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (req.headers.get("x-github-event") === "ping") return NextResponse.json({ ok: true });

  const payload = JSON.parse(body) as { ref?: string; repository?: { full_name?: string } };
  const repo = payload.repository?.full_name?.toLowerCase();
  const source = Object.values(contentSources).find((s) => s.repo.toLowerCase() === repo);

  if (!source) return NextResponse.json({ ignored: true }, { status: 202 });

  if (payload.ref !== `refs/heads/${source.branch}`) {
    return NextResponse.json({ ignored: "other branch" }, { status: 202 });
  }

  revalidateTag(source.tag, { expire: 0 });
  return NextResponse.json({ revalidated: source.tag });
}
