import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 512 * 1024;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 5000;

function privateAddress(ip: string) {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    if (v.startsWith("::ffff:")) return privateAddress(v.slice(7));
    return (
      v === "::1" ||
      v === "::" ||
      v.startsWith("fc") ||
      v.startsWith("fd") ||
      v.startsWith("fe8") ||
      v.startsWith("fe9") ||
      v.startsWith("fea") ||
      v.startsWith("feb")
    );
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

// Refuse anything that is not a public http(s) host (SSRF protection).
async function assertPublic(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new Error("protocol");
  if (url.username || url.password) throw new Error("credentials");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost")) throw new Error("host");
  const addresses = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true });
  if (!addresses.length || addresses.some((a) => privateAddress(a.address)))
    throw new Error("host");
}

async function fetchHtml(start: URL) {
  let url = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublic(url);
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "LaidOffCircleBot/1.0 (link preview)",
      },
    });
    if (response.status >= 300 && response.status < 400) {
      const next = response.headers.get("location");
      if (!next) throw new Error("redirect");
      url = new URL(next, url);
      continue;
    }
    if (!response.ok) throw new Error("status");
    if (!/html/i.test(response.headers.get("content-type") ?? ""))
      throw new Error("type");
    const reader = response.body?.getReader();
    if (!reader) throw new Error("body");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
    }
    void reader.cancel().catch(() => {});
    return { html: Buffer.concat(chunks).toString("utf8"), url };
  }
  throw new Error("redirects");
}

const entities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};
const decode = (text: string) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => entities[n.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();

function metaTags(html: string) {
  const head = html.slice(0, html.search(/<\/head>/i) + 1 || undefined);
  const tags: Record<string, string> = {};
  for (const [tag] of head.matchAll(/<meta\s[^>]*>/gi)) {
    const attr = (name: string) =>
      tag.match(new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
    const key = attr("property") ?? attr("name");
    const value = attr("content");
    const k = (key?.[1] ?? key?.[2])?.toLowerCase();
    if (k && value && !(k in tags)) tags[k] = decode(value[1] ?? value[2] ?? "");
  }
  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return { tags, title: title ? decode(title[1]) : "" };
}

function absolute(value: string | undefined, base: URL) {
  if (!value) return null;
  try {
    const url = new URL(value, base);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  let target: URL;
  try {
    if (!raw || raw.length > 2000) throw new Error("url");
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  try {
    const { html, url } = await fetchHtml(target);
    const { tags, title: pageTitle } = metaTags(html);
    const title = tags["og:title"] || tags["twitter:title"] || pageTitle;
    if (!title) throw new Error("empty");
    const image = absolute(tags["og:image"] || tags["twitter:image"], url);
    return NextResponse.json(
      {
        url: url.toString(),
        domain: url.hostname.replace(/^www\./, ""),
        title: title.slice(0, 200),
        description: (
          tags["og:description"] ||
          tags["twitter:description"] ||
          tags.description ||
          ""
        ).slice(0, 300),
        image,
        siteName: tags["og:site_name"] || null,
        large: (tags["twitter:card"] ?? "") === "summary_large_image",
      },
      {
        headers: {
          "cache-control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "No preview" },
      { status: 404, headers: { "cache-control": "public, s-maxage=600" } },
    );
  }
}
