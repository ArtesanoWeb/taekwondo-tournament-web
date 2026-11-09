import "server-only";

import { io } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  type ApiResult,
  attempt,
  createApiClient,
  type Result,
} from "./api/client";
import { isTokenExpired, loginUrl, SESSION_COOKIE } from "./auth";

// The cookie outlives the 8 h token on purpose: when the token expires the cookie is still there,
// so the login page can say "Tu sesión venció" instead of looking like the user never logged in.
const COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** Only callable from a Server Action or Route Handler: Server Components can't set cookies. */
export async function saveSession(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * Data Access Layer of the admin: every admin page and Server Action gets its API client here, so
 * the session is checked next to the data and not only in `proxy.ts`.
 */
export async function getAdminApi() {
  return createApiClient(await requireToken());
}

async function requireToken(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  // Comparing `exp` with the clock must happen per request, not in a prerender (Cache Components).
  await io();
  if (!token || isTokenExpired(token)) redirect(loginUrl({ expired: !!token }));
  return token;
}

/** Like `attempt`, but a 401 (expired or revoked token) sends the user back to the login. */
export async function adminAttempt<T>(
  request: Promise<ApiResult<T>>,
): Promise<Result<T>> {
  const result = await attempt(request);
  if (!result.ok && result.error.status === 401) {
    redirect(loginUrl({ expired: true }));
  }
  return result;
}
