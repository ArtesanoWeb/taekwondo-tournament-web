import "server-only";

import createClient from "openapi-fetch";

import { ApiError, messageFromErrorBody, networkError } from "./errors";
import type { paths } from "./schema";

const DEFAULT_API_URL = "https://taekwondo-tournament-manager-dev.onrender.com";

// Render's free plan sleeps after 15 minutes idle and the first request can take 30-50 s.
const REQUEST_TIMEOUT_MS = 90_000;

export function createApiClient(token?: string) {
  return createClient<paths>({
    baseUrl: process.env.API_URL ?? DEFAULT_API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    fetch: (request) =>
      fetch(request, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }),
  });
}

export const api = createApiClient();

type ApiResult<T> = { data?: T; error?: unknown; response: Response };

/** Awaits an `api.GET(...)`-style call and returns its data, or throws an `ApiError` in Spanish. */
export async function unwrap<T>(request: Promise<ApiResult<T>>): Promise<T> {
  let result: ApiResult<T>;
  try {
    result = await request;
  } catch (cause) {
    throw networkError(cause);
  }
  const { data, error, response } = result;
  if (!response.ok || data === undefined) {
    throw new ApiError(
      response.status,
      messageFromErrorBody(error, response.status),
    );
  }
  return data;
}
