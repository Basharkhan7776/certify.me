import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      const loginUrl = new URL("/admin", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.NEXTAUTH_SECRET),
      );

      if ((payload as any).role !== "admin") {
        const loginUrl = new URL("/admin", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL("/admin", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
