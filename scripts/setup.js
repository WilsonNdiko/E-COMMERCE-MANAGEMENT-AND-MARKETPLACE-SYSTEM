#!/usr/bin/env node
/**
 * One-command local project setup for VS Code (Windows, macOS, Linux).
 * 1. Creates `.env` and `server/.env` from `.env.example` if missing
 * 2. Installs root & `server/` npm dependencies
 * 3. Generates Prisma Client
 * 4. Initializes & seeds SQLite database if `prisma/dev.db` is missing or empty
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const serverDir = path.join(rootDir, "server");
const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

function run(cmd, args, cwd = rootDir, label = "") {
  if (label) console.log(`\n==> ${label}`);
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: isWin,
  });
  if (result.status !== 0) {
    console.error(`\n[ERROR] Step failed: ${label || cmd}`);
    process.exit(result.status || 1);
  }
}

function ensureEnvFile(target, example) {
  if (!fs.existsSync(target) && fs.existsSync(example)) {
    fs.copyFileSync(example, target);
    console.log(`Created ${path.relative(rootDir, target)} from template.`);
  }
}

console.log("=== Singitronic E-Commerce Local Setup ===");

ensureEnvFile(
  path.join(rootDir, ".env"),
  path.join(rootDir, ".env.example")
);
ensureEnvFile(
  path.join(serverDir, ".env"),
  path.join(serverDir, ".env.example")
);

run(npmCmd, ["install", "--no-audit", "--no-fund"], rootDir, "Installing frontend & shared dependencies");
run(npmCmd, ["install", "--no-audit", "--no-fund"], serverDir, "Installing backend API dependencies");
run(process.execPath, [path.join(__dirname, "prisma-generate.js")], rootDir, "Generating Prisma Client");
const dbPath = path.join(rootDir, "prisma", "dev.db");
const dbExistedBefore = fs.existsSync(dbPath);

run(process.execPath, [path.join(rootDir, "prisma", "init-sqlite.js")], rootDir, "Ensuring SQLite schema is up to date");

// Check whether the database already has products (handles fresh GitHub Download ZIP & git clone!)
const countCheck = spawnSync(
  process.execPath,
  [
    "-e",
    "const p=require('./server/utills/db'); p.product.count().then(c=>{console.log(c);return p.$disconnect();}).catch(()=>{console.log(0);process.exit(0);});",
  ],
  { cwd: rootDir, encoding: "utf8" }
);
const existingProducts = parseInt((countCheck.stdout || "0").trim().split(/\s+/).pop() || "0", 10);

const shouldSeed =
  process.argv.includes("--seed") || !dbExistedBefore || existingProducts === 0;

if (shouldSeed) {
  run(process.execPath, [path.join(__dirname, "seed-all.js")], rootDir, "Seeding demo catalog, reviews, settings & admin user");
} else {
  console.log(`\n==> Existing database detected with ${existingProducts} products (skipping re-seed; pass --seed to force).`);
}

console.log("\nSetup complete! Start both servers with:\n  npm run dev:all\n");
