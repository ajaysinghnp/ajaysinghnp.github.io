import { NextResponse } from "next/server";

import { cleanLine, cleanMessage, getClientInfo, isValidEmail } from "@/lib/sanitization";

const MAX_BODY_BYTES = 8_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

// Best-effort per-instance limiter; n8n remains the source of truth for volume.
const hits = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 1000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}

export async function POST(req: Request) {
  const webhookUrl = process.env.N8N_FEEDBACK_WEBHOOK_URL;
  if (!webhookUrl) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  // Reject oversized bodies before reading them, then re-check the real byte size
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let input: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    input = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field; pretend success.
  if (cleanLine(input.website, 200)) return NextResponse.json({ ok: true });

  const client = getClientInfo(req.headers);

  const rateKey = client.ip ?? "unknown";
  if (isRateLimited(rateKey)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const message = cleanMessage(input.message, 4000);
  const name = cleanLine(input.name, 100);
  const email = cleanLine(input.email, 200);

  if (message.length < 3) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = process.env.N8N_FEEDBACK_WEBHOOK_SECRET;
  if (secret) headers["x-webhook-secret"] = secret;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message,
        name: name || null,
        email: email || null,
        submittedAt: new Date().toISOString(),
        source: "contact-page",
        client,
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
      redirect: "error", // never follow redirects with the secret header attached
    });
    if (!res.ok) throw new Error();
  } catch {
    return NextResponse.json({ error: "Could not deliver feedback" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
