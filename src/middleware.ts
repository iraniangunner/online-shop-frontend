import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/booking"];

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/booking/:path*"],
};