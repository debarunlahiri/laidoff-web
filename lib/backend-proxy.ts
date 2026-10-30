import { NextRequest, NextResponse } from "next/server";
const roots = new Set([
  "users",
  "me",
  "companies",
  "posts",
  "connections",
  "referrals",
  "conversations",
  "insights",
  "notifications",
  "uploads",
  "network",
]);
const backendBase = () =>
  (process.env.BACKEND_API_URL ?? "http://127.0.0.1:9090/api/v1").replace(
    /\/$/,
    "",
  );
const errorResponse = (message: string, status: number) =>
  NextResponse.json(
    { error: { message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
export async function proxyBackend(
  request: NextRequest,
  segments: string[],
  media = false,
) {
  const token = request.cookies.get("laidoff_session")?.value;
  if (!token) return errorResponse("Please sign in", 401);
  if (
    media
      ? !/^[0-9a-f-]{36}\.webp$/.test(segments[0] ?? "")
      : !roots.has(segments[0]) ||
        segments.some((part) => !/^[-a-zA-Z0-9_]+$/.test(part))
  )
    return errorResponse("Not found", 404);
  const mutation = !["GET", "HEAD"].includes(request.method);
  const origin =
    process.env.AUTH_APP_ORIGIN ??
    `${request.nextUrl.protocol}//${request.headers.get("host") ?? request.nextUrl.host}`;
  if (mutation && request.headers.get("origin") !== origin)
    return errorResponse("Request origin not allowed", 403);
  try {
    const base = backendBase();
    const url = media
      ? `${base.replace(/\/api\/v1$/, "")}/uploads/${segments[0]}`
      : `${base}/${segments.join("/")}${request.nextUrl.search}`;
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    const agent = request.headers.get("user-agent");
    if (agent) headers.set("User-Agent", agent);
    let body: Uint8Array | undefined;
    if (mutation) {
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let length = 0;
      if (reader)
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          length += value.byteLength;
          if (length > 6 * 1024 * 1024) {
            await reader.cancel();
            return errorResponse("Request too large", 413);
          }
          chunks.push(value);
        }
      body = Buffer.concat(chunks);
    }
    const upstream = await fetch(url, {
      method: request.method,
      headers,
      body: body as BodyInit | undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const responseHeaders = new Headers({ "Cache-Control": "no-store" });
    for (const name of ["content-type", "x-request-id", "retry-after"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new NextResponse(upstream.status === 204 ? null : upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return errorResponse("The server is unavailable. Please try again.", 503);
  }
}
