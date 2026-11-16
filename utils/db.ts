import path from "path";
import { pathToFileURL } from "url";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

function resolveDatabaseUrl(): string {
  const raw = (process.env.DATABASE_URL || "file:./prisma/dev.db").trim();

  // Pass through remote LibSQL / Turso / HTTP URLs untouched
  if (
    raw.startsWith("libsql://") ||
    raw.startsWith("https://") ||
    raw.startsWith("http://") ||
    raw === "file::memory:"
  ) {
    return raw;
  }

  if (raw.startsWith("file://")) {
    return raw;
  }

  if (raw.startsWith("file:")) {
    const filePart = raw.slice("file:".length);
    const absPath = path.isAbsolute(filePart)
      ? filePart
      : path.resolve(process.cwd(), filePart);
    return pathToFileURL(absPath).href;
  }

  return pathToFileURL(path.resolve(process.cwd(), raw)).href;
}

const prismaClientSingleton = () => {
  const adapter = new PrismaLibSQL({
    url: resolveDatabaseUrl(),
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error", "warn"],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
