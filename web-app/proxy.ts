import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type RoleToken = {
  role?: string;
};

/**
 * Protects admin routes by checking NextAuth JWT token and role.
 * - /couple -> COUPLE
 * - /vendor -> VENDOR
 * - /super  -> SUPER_ADMIN
 *
 * Next.js 16: proxy.ts replaces middleware.ts for request interception.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ignore static, next internals and auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // allow public pages and login
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/reset" ||
    pathname.startsWith("/vendor-register")
  ) {
    return NextResponse.next();
  }

  const protectedMap: Record<string, string> = {
    "/couple": "COUPLE",
    "/vendor": "VENDOR",
    "/super": "SUPER_ADMIN",
  };

  for (const prefix of Object.keys(protectedMap)) {
    if (pathname.startsWith(prefix)) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
      }

      const required = protectedMap[prefix];
      const role = (token as RoleToken).role;
      if (!role || role !== required) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/couple",
    "/couple/:path*",
    "/vendor",
    "/vendor/:path*",
    "/super",
    "/super/:path*",
  ],
};
