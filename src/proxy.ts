import { NextRequest, NextResponse } from "next/server";
import { canAccessPath, ROLE_HOME_PATH } from "@/lib/authz";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

const publicPaths = ["/login"];
const authApiPaths = ["/api/auth/login", "/api/auth/logout"];

function isPublicPath(pathname: string) {
  return publicPaths.includes(pathname) || authApiPaths.includes(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (pathname === "/login") {
      const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      const user = await verifySessionToken(token);

      if (user) {
        return NextResponse.redirect(new URL(ROLE_HOME_PATH[user.role], request.url));
      }
    }

    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await verifySessionToken(token);

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!canAccessPath(user.role, pathname)) {
    return NextResponse.redirect(new URL(ROLE_HOME_PATH[user.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
