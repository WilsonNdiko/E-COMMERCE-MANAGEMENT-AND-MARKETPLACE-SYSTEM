import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/utils/db";
import { nanoid } from "nanoid";

export const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  "12D16C923BA17672F89B18C1DB22A9F8E7D6C5B4A3";

const DEMO_ACCOUNTS: Record<string, { password: string; role: string }> = {
  "admin@singitronic.com": { password: "Admin123!", role: "admin" },
  "sarah.kamau@example.com": { password: "Customer123!", role: "user" },
};

async function ensureUserTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT,
      "role" TEXT DEFAULT 'user'
    );
  `);
}

async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
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
        const cleanEmail = String(credentials?.email || "")
          .replace(/\s+/g, "")
          .toLowerCase();
        const password = String(credentials?.password || "");

        if (!cleanEmail || !password) {
          throw new Error("MISSING_CREDENTIALS");
        }

        try {
          await ensureUserTable();
          let user = await findUserByEmail(cleanEmail);

          // Self-heal built-in demo accounts on a freshly initialized database
          const demo = DEMO_ACCOUNTS[cleanEmail];
          if (!user && demo) {
            const hashedPassword = await bcrypt.hash(demo.password, 10);
            user = await prisma.user.create({
              data: {
                id: nanoid(),
                email: cleanEmail,
                password: hashedPassword,
                role: demo.role,
              },
            });
          }

          if (!user || !user.password) {
            throw new Error("NO_ACCOUNT");
          }

          const isPasswordCorrect = await bcrypt.compare(password, user.password);
          if (!isPasswordCorrect) {
            throw new Error("WRONG_PASSWORD");
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role || "user",
          };
        } catch (err: any) {
          const code = err?.message || "";
          if (
            code === "NO_ACCOUNT" ||
            code === "WRONG_PASSWORD" ||
            code === "MISSING_CREDENTIALS"
          ) {
            throw err;
          }
          console.error("[Auth error]:", err);
          throw new Error("AUTH_SERVER_ERROR");
        }
      },
    }),
  ],
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user";
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = (token.role as string) || "user";
        (session.user as any).id = token.id as string;
        if (token.email) session.user.email = token.email as string;
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
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: AUTH_SECRET,
  debug: false,
};

export function buildAuthOptions(isHttps: boolean): NextAuthOptions {
  if (!isHttps) {
    // Plain HTTP (localhost / 127.0.0.1 / LAN): Lax cookies always work
    return { ...authOptions, useSecureCookies: false };
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
