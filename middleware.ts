import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  "12D16C923BA17672F89B18C1DB22A9F8E7D6C5B4A3";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const token =
      (await getToken({
        req,
        secret: AUTH_SECRET,
        secureCookie: true,
      })) ||
      (await getToken({
        req,
        secret: AUTH_SECRET,
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
