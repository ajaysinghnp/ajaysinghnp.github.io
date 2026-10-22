// Control chars, bidi overrides/isolates and BOM. Zero-width joiner is kept so emoji sequences survive.
const CONTROL_ALL = /[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069\uFEFF]/g;
// Same, but \t (\u0009) and \n (\u000A) are allowed for multi-line text
const CONTROL_KEEP_NEWLINE =
  /[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069\uFEFF]/g;
const IP_CHARS = /^[0-9a-f:.]+$/i;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"`]+@[^\s@<>()[\]\\,;:"`]+\.[^\s@<>()[\]\\,;:"`]+$/;

/** Truncate by code points so emoji are never cut in half. */
export function truncate(value: string, max: number): string {
  const chars = Array.from(value);
  if (chars.length <= max) return value;
  return chars.slice(0, max).join("");
}

/** Single-line text (name, email, headers): strips control/bidi chars, collapses whitespace. */
export function cleanLine(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const text = value.normalize("NFC").replace(CONTROL_ALL, " ").replace(/\s+/g, " ").trim();
  return truncate(text, max);
}

/** Multi-line Markdown: keeps \n and \t, strips control/bidi chars. Markdown itself is left untouched. */
export function cleanMessage(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const text = value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_KEEP_NEWLINE, "")
    .trim();
  return truncate(text, max);
}

export function isValidEmail(value: string): boolean {
  return value.length <= 200 && EMAIL_RE.test(value);
}

/** Returns the IP only if it contains nothing but hex digits, dots and colons. */
export function cleanIp(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (text.length === 0 || text.length > 45) return null;
  if (!IP_CHARS.test(text)) return null;
  return text;
}

/** Cleans a comma-separated list of IPs (x-forwarded-for). Invalid entries are dropped. */
export function cleanIpList(value: unknown, maxItems = 8): string | null {
  if (typeof value !== "string") return null;
  const items: string[] = [];
  for (const part of value.split(",")) {
    const ip = cleanIp(part);
    if (ip && items.length < maxItems) items.push(ip);
  }
  if (items.length === 0) return null;
  return items.join(", ");
}

function cleanHeader(headers: Headers, name: string, max: number): string | null {
  const text = cleanLine(headers.get(name), max);
  if (text === "") return null;
  return text;
}

export type ClientInfo = {
  ip: string | null;
  cfConnectingIp: string | null;
  xForwardedFor: string | null;
  xRealIp: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  timezone: string | null;
  userAgent: string | null;
};

/** Collects the visitor-related request headers, all validated and length-capped. */
export function getClientInfo(headers: Headers): ClientInfo {
  const cfConnectingIp = cleanIp(headers.get("cf-connecting-ip"));
  const xForwardedFor = cleanIpList(headers.get("x-forwarded-for"));
  const xRealIp = cleanIp(headers.get("x-real-ip"));

  let firstForwarded: string | null = null;
  if (xForwardedFor) firstForwarded = xForwardedFor.split(", ")[0];

  return {
    ip: cfConnectingIp ?? firstForwarded ?? xRealIp,
    cfConnectingIp,
    xForwardedFor,
    xRealIp,
    country: cleanHeader(headers, "cf-ipcountry", 8),
    city: cleanHeader(headers, "cf-ipcity", 100),
    region: cleanHeader(headers, "cf-region", 100),
    timezone: cleanHeader(headers, "cf-timezone", 64),
    userAgent: cleanHeader(headers, "user-agent", 300),
  };
}
