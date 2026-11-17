import NextAuth from "next-auth";
import { buildAuthOptions } from "@/utils/authOptions";

/**
 * NextAuth App Router handler.
 * `NEXTAUTH_URL` is kept in sync with the exact host/port the shopper opened,
 * so sign-in works on localhost:3000, 127.0.0.1:3000, custom ports and HTTPS.
 */
function handleAuth(req: Request, ctx: any) {
  const proto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const isHttps = proto === "https" || req.url.startsWith("https://");

  if (host) {
    process.env.NEXTAUTH_URL = `${isHttps ? "https" : "http"}://${host}`;
  }

  return NextAuth(req as any, ctx, buildAuthOptions(isHttps));
}

export async function GET(req: Request, ctx: any) {
  return handleAuth(req, ctx);
}

export async function POST(req: Request, ctx: any) {
  return handleAuth(req, ctx);
}
