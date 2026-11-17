const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const { loadEnvFile, resolveLibsqlUrl } = require(path.join(
  PROJECT_ROOT,
  "utils",
  "dbUrl.js"
));

loadEnvFile(path.join(PROJECT_ROOT, ".env"));

const { PrismaClient } = require("../../node_modules/@prisma/client");
const { PrismaLibSQL } = require("../../node_modules/@prisma/adapter-libsql");

const prismaClientSingleton = () => {
  const url = resolveLibsqlUrl(PROJECT_ROOT);
  const adapter = new PrismaLibSQL({ url });

  return new PrismaClient({
    adapter,
    log: ["error"],
  });
};

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

module.exports = prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
