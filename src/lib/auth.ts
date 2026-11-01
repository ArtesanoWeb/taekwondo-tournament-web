// Pure helpers for the admin session, shared by `proxy.ts` and the server code. They never verify
// the token's signature: only the API can do that, so a forged token is still rejected with a 401.

export const SESSION_COOKIE = "admin_session";
export const ADMIN_HOME = "/admin";
export const LOGIN_PATH = "/admin/login";

type TokenClaims = { sub?: string; exp?: number };

/** Reads the payload of a JWT, or returns `undefined` if it isn't one. */
export function readTokenClaims(token: string): TokenClaims | undefined {
  const payload = token.split(".")[1];
  if (!payload) return undefined;
  try {
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const claims: unknown = JSON.parse(json);
    return typeof claims === "object" && claims !== null
      ? (claims as TokenClaims)
      : undefined;
  } catch {
    return undefined;
  }
}

/** A token without a readable `exp` counts as expired, so the user is sent to log in again. */
export function isTokenExpired(token: string, now = Date.now()): boolean {
  const exp = readTokenClaims(token)?.exp;
  return typeof exp !== "number" || exp * 1000 <= now;
}

/**
 * Where to go after logging in. Only admin pages are accepted, so a crafted link like
 * `/admin/login?next=https://evil.example` can't send the user to another site.
 */
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string") return ADMIN_HOME;
  const isAdminPath =
    value === ADMIN_HOME ||
    value.startsWith(`${ADMIN_HOME}/`) ||
    value.startsWith(`${ADMIN_HOME}?`);
  if (!isAdminPath || value.startsWith(LOGIN_PATH)) return ADMIN_HOME;
  return value;
}

export function loginUrl({
  next,
  expired = false,
}: { next?: string; expired?: boolean } = {}): string {
  const params = new URLSearchParams();
  if (next && safeNextPath(next) !== ADMIN_HOME) params.set("next", next);
  if (expired) params.set("vencida", "1");
  const query = params.toString();
  return query ? `${LOGIN_PATH}?${query}` : LOGIN_PATH;
}
