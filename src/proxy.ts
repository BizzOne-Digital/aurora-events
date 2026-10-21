import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for /admin: sends visitors without a session cookie to the login page and keeps admin URLs out of
 * search indexes. This is NOT the security boundary. Every admin page, server action and API route re-verifies the
 * signed session and the administrator record on the server (see src/lib/session.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("__Host-aurora_admin") || request.cookies.has("aurora_admin");
  const isLogin = pathname === "/admin/login";

  if (!hasSession && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
