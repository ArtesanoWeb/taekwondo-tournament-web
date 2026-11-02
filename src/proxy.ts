import { type NextRequest, NextResponse } from "next/server";

import {
  isTokenExpired,
  LOGIN_PATH,
  loginUrl,
  SESSION_COOKIE,
} from "@/lib/auth";

// Optimistic check: it only looks at the cookie, so an admin page never starts rendering without a
// session. The real check is in `getAdminApi()` and in the API itself, which verifies the token.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === LOGIN_PATH) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && !isTokenExpired(token)) return NextResponse.next();

  const url = loginUrl({ next: `${pathname}${search}`, expired: !!token });
  return NextResponse.redirect(new URL(url, request.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};
