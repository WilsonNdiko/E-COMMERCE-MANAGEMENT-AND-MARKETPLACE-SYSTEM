#!/usr/bin/env node
/**
 * Cross-platform Prisma Client generator (Windows, macOS, Linux).
 * Since Prisma uses `engineType = "client"` with `@prisma/adapter-libsql`,
 * native query engine binary downloads are unnecessary — this generates
 * `@prisma/client` instantly even in offline or firewalled environments.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const isWin = process.platform === "win32";

// Provide a harmless existing executable path so Prisma skips unnecessary binary downloads
const dummyBin = isWin
  ? process.execPath
  : fs.existsSync("/bin/true")
  ? "/bin/true"
  : process.execPath;

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || "file:./prisma/dev.db",
  PRISMA_SCHEMA_ENGINE_BINARY:
    process.env.PRISMA_SCHEMA_ENGINE_BINARY || dummyBin,
  PRISMA_QUERY_ENGINE_LIBRARY:
    process.env.PRISMA_QUERY_ENGINE_LIBRARY || dummyBin,
  PRISMA_QUERY_ENGINE_BINARY:
    process.env.PRISMA_QUERY_ENGINE_BINARY || dummyBin,
};

const prismaCli = path.join(
  rootDir,
  "node_modules",
  "prisma",
  "build",
  "index.js"
);

const res = spawnSync(process.execPath, [prismaCli, "generate"], {
  cwd: rootDir,
  env,
  stdio: "inherit",
});

process.exit(res.status ?? 0);
