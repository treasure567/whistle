const isServer = typeof window === "undefined";

// Server components call the backend directly (with the service key).
// The browser calls the same-origin Next BFF proxy (/api/v1), which injects
// the key server-side. The browser never sees the key or the backend URL.
export const API_BASE_URL = isServer
  ? process.env.WHISTLE_API_URL ?? "http://127.0.0.1:4000/v1"
  : "/api/v1";

export function serviceHeaders(): Record<string, string> {
  const key = isServer ? process.env.WHISTLE_SERVICE_KEY : undefined;
  return key ? { "x-service-auth": key } : {};
}
