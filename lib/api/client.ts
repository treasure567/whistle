import type { ZodType } from "zod";

import { API_BASE_URL, serviceHeaders } from "./config";

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
      headers: { accept: "application/json", ...serviceHeaders() },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Could not reach the Whistle backend");
  }

  return unwrap(response, schema);
}

export async function apiPost<T>(
  path: string,
  payload: unknown,
  schema: ZodType<T>,
): Promise<T> {
  return apiSend("POST", path, payload, schema);
}

export async function apiPut<T>(
  path: string,
  payload: unknown,
  schema: ZodType<T>,
): Promise<T> {
  return apiSend("PUT", path, payload, schema);
}

async function apiSend<T>(
  method: "POST" | "PUT",
  path: string,
  payload: unknown,
  schema: ZodType<T>,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { accept: "application/json", "content-type": "application/json", ...serviceHeaders() },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Could not reach the Whistle backend");
  }

  return unwrap(response, schema);
}

async function unwrap<T>(response: Response, schema: ZodType<T>): Promise<T> {
  const body = (await response.json().catch(() => null)) as Envelope | null;
  if (!response.ok || !body || body.ok !== true) {
    const message =
      body && body.ok === false ? body.message : `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return schema.parse(body.data);
}
