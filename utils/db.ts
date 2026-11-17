import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

/**
 * Cross-platform SQLite/LibSQL URL resolver supporting Windows (`file:C:/...`),
 * macOS, and Linux (`file:/...`), including folders with spaces or symbols.
 */
export function resolveDatabaseUrl(): string {
  let raw = (process.env.DATABASE_URL || "file:./prisma/dev.db").trim();

  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1).trim();
  }

  if (
    raw.startsWith("libsql://") ||
    raw.startsWith("https://") ||
    raw.startsWith("http://") ||
    raw === "file::memory:" ||
    raw.startsWith("file::memory:?")
  ) {
    return raw;
  }

  let absPath: string;
  if (raw.startsWith("file://")) {
    try {
      absPath = fileURLToPath(raw);
    } catch {
      const stripped = raw.replace(/^file:\/\/\/?/, "");
      absPath = /^[A-Za-z]:[\\/]/.test(stripped) ? stripped : "/" + stripped;
    }
  } else {
    const filePart = raw.startsWith("file:") ? raw.slice("file:".length) : raw;
    const cleanPart = filePart.split("?")[0];
    const isWinDrive = /^[A-Za-z]:[\\/]/.test(cleanPart);
    absPath =
      path.isAbsolute(cleanPart) || isWinDrive
        ? cleanPart
        : path.resolve(process.cwd(), cleanPart);
  }

  try {
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
  } catch {}

  const normalized = absPath
    .replace(/\\/g, "/")
    .replace(/^\/([A-Za-z]:\/)/, "$1")
    .replace(/%/g, "%25")
    .replace(/\?/g, "%3F")
    .replace(/#/g, "%23");

  return `file:${normalized}`;
}

const prismaClientSingleton = () => {
  const adapter = new PrismaLibSQL({
    url: resolveDatabaseUrl(),
  });

  return new PrismaClient({
    adapter,
    log: ["error"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
