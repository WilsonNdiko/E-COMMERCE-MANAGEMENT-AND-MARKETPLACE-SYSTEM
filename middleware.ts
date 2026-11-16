import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const token =
      (await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: true,
      })) ||
      (await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: false,
      }));

    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
