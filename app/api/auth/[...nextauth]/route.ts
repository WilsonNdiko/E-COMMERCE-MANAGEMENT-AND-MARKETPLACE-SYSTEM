import NextAuth, { NextAuthOptions } from "next-auth";
import { Account, User as AuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import { nanoid } from "nanoid";

export const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  "12D16C923BA17672F89B18C1DB22A9F8E7D6C5B4A3";

const DEMO_ADMIN_EMAIL = "admin@singitronic.com";
const DEMO_ADMIN_PASS = "Admin123!";

async function findUserByEmailInsensitive(email: string) {
  const normalized = email.trim().toLowerCase();
  const exact = await prisma.user.findFirst({
    where: { email: normalized },
  });
  if (exact) return exact;

  // Fallback case-insensitive match for pre-existing mixed-case emails
  const rows = await prisma.$queryRawUnsafe<
    Array<{ id: string; email: string; password: string | null; role: string | null }>
  >(
    `SELECT "id", "email", "password", "role" FROM "User" WHERE lower("email") = ? LIMIT 1`,
    normalized
  );
  return rows?.[0] || null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const rawEmail = String(credentials?.email || "")
          .replace(/\s+/g, "")
          .toLowerCase();
        const password = String(credentials?.password || "");

        if (!rawEmail || !password) {
          return null;
        }

        try {
          let user = await findUserByEmailInsensitive(rawEmail);

          // Self-heal demo admin if someone cloned fresh and hasn't seeded yet
          if (!user && rawEmail === DEMO_ADMIN_EMAIL) {
            const hashedPassword = await bcrypt.hash(DEMO_ADMIN_PASS, 10);
            user = await prisma.user.create({
              data: {
                id: nanoid(),
                email: DEMO_ADMIN_EMAIL,
                password: hashedPassword,
                role: "admin",
              },
            });
          }

          if (!user || !user.password) {
            return null;
          }

          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
          );
          if (!isPasswordCorrect) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role || "user",
          };
        } catch (err: any) {
          console.error("[NextAuth authorize error]:", err?.message || err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: AuthUser; account: Account | null }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (account?.provider === "github" || account?.provider === "google") {
        try {
          const email = (user.email || "").trim().toLowerCase();
          const existingUser = await findUserByEmailInsensitive(email);
          if (!existingUser && email) {
            await prisma.user.create({
              data: {
                id: nanoid(),
                email,
                role: "user",
                password: null,
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.iat = Math.floor(Date.now() / 1000);
      }

      const now = Math.floor(Date.now() / 1000);
      const tokenAge = now - ((token.iat as number) || now);
      const maxAge = 24 * 60 * 60;

      if (tokenAge > maxAge) {
        return {};
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  secret: AUTH_SECRET,
  debug: false,
};

function buildAuthOptions(isHttps: boolean): NextAuthOptions {
  if (!isHttps) {
    return authOptions;
  }
  return {
    ...authOptions,
    useSecureCookies: true,
    cookies: {
      sessionToken: {
        name: `__Secure-next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: "none",
          path: "/",
          secure: true,
          partitioned: true,
        } as any,
      },
      callbackUrl: {
        name: `__Secure-next-auth.callback-url`,
        options: {
          httpOnly: true,
          sameSite: "none",
          path: "/",
          secure: true,
          partitioned: true,
        } as any,
      },
      csrfToken: {
        name: `__Host-next-auth.csrf-token`,
        options: {
          httpOnly: true,
          sameSite: "none",
          path: "/",
          secure: true,
          partitioned: true,
        } as any,
      },
    },
  };
}

export async function GET(req: Request, ctx: any) {
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    req.url.startsWith("https://");
  return NextAuth(req as any, ctx, buildAuthOptions(isHttps));
}

export async function POST(req: Request, ctx: any) {
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    req.url.startsWith("https://");
  return NextAuth(req as any, ctx, buildAuthOptions(isHttps));
}
