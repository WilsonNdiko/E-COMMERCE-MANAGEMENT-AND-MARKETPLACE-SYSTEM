const path = require("path");
const { pathToFileURL } = require("url");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
require("dotenv").config({ path: path.join(PROJECT_ROOT, "server", ".env") });
require("dotenv").config({ path: path.join(PROJECT_ROOT, ".env") });

const { PrismaClient } = require("../../node_modules/@prisma/client");
const { PrismaLibSQL } = require("../../node_modules/@prisma/adapter-libsql");

function resolveDatabaseUrl() {
  const raw = (process.env.DATABASE_URL || "file:./prisma/dev.db").trim();

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
      : path.resolve(PROJECT_ROOT, filePart);
    return pathToFileURL(absPath).href;
  }

  return pathToFileURL(path.resolve(PROJECT_ROOT, raw)).href;
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

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

module.exports = prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
