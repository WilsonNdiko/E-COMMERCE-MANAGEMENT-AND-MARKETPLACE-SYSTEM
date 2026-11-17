import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/authOptions";
import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { redirect } from "next/navigation";

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  "12D16C923BA17672F89B18C1DB22A9F8E7D6C5B4A3";

async function resolveSessionUser() {
  try {
    const session = await getServerSession(authOptions);
    if ((session as any)?.user) return (session as any).user;
  } catch {}

  // Fallback decode across both HTTP (localhost / 127.0.0.1) and HTTPS cookie names
  try {
    const cookieStore = await cookies();
    const rawToken =
      cookieStore.get("next-auth.session-token")?.value ||
      cookieStore.get("__Secure-next-auth.session-token")?.value;
    if (rawToken) {
      const decoded = await decode({ token: rawToken, secret: AUTH_SECRET });
      if (decoded?.email) {
        return {
          id: decoded.id || decoded.sub,
          email: decoded.email,
          role: decoded.role || "user",
        };
      }
    }
  } catch {}

  return null;
}

export async function requireAdmin() {
  const user = await resolveSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return { user };
}

export async function isAdmin(): Promise<boolean> {
  const user = await resolveSessionUser();
  return user?.role === "admin";
}
