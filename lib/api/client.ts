import type { ZodType } from "zod";

import { API_BASE_URL } from "./config";

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type Envelope =
  | { ok: true; data: unknown }
  | { ok: false; code: string; message: string };

export async function apiGet<T>(path: string, schema: ZodType<T>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Could not reach the Whistle backend");
  }

  const body = (await response.json().catch(() => null)) as Envelope | null;
  if (!response.ok || !body || body.ok !== true) {
    const message =
      body && body.ok === false ? body.message : `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return schema.parse(body.data);
}
