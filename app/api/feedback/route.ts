import { NextResponse } from "next/server";

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
    for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) hits.delete(k);
  }
  return false;
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  const webhookUrl = process.env.N8N_FEEDBACK_WEBHOOK_URL;
  if (!webhookUrl) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const h = req.headers;
  const client = {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    cfConnectingIp: h.get("cf-connecting-ip"),
    xForwardedFor: h.get("x-forwarded-for"),
    xRealIp: h.get("x-real-ip"),
    country: h.get("cf-ipcountry"),
    city: h.get("cf-ipcity"),
    region: h.get("cf-region"),
    timezone: h.get("cf-timezone"),
    userAgent: h.get("user-agent"),
  };

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
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
  if (clean(input.website, 200)) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const message = clean(input.message, 4000);
  const name = clean(input.name, 100);
  const email = clean(input.email, 200);

  if (message.length < 3) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
    });
    if (!res.ok) throw new Error();
  } catch {
    return NextResponse.json({ error: "Could not deliver feedback" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
