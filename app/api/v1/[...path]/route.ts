import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const API_URL = process.env.WHISTLE_API_URL ?? "http://127.0.0.1:4000/v1";
const SERVICE_KEY = process.env.WHISTLE_SERVICE_KEY ?? "";

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const target = `${API_URL}/${path.join("/")}${req.nextUrl.search}`;
  const headers = new Headers();
  const accept = req.headers.get("accept");
  if (accept) headers.set("accept", accept);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (SERVICE_KEY) headers.set("x-service-auth", SERVICE_KEY);

  const init: RequestInit = { method: req.method, headers, cache: "no-store" };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    return Response.json(
      { ok: false, code: "UPSTREAM", message: "Could not reach the Whistle API" },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  for (const key of ["content-type", "cache-control"]) {
    const value = upstream.headers.get(key);
    if (value) responseHeaders.set(key, value);
  }
  responseHeaders.set("x-accel-buffering", "no");

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx): Promise<Response> {
  return proxy(req, (await ctx.params).path);
}

export async function POST(req: NextRequest, ctx: Ctx): Promise<Response> {
  return proxy(req, (await ctx.params).path);
}

export async function PUT(req: NextRequest, ctx: Ctx): Promise<Response> {
  return proxy(req, (await ctx.params).path);
}
