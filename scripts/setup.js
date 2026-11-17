#!/usr/bin/env node
/**
 * One-command local setup for VS Code (Windows, macOS, Linux).
 * 1. Creates `.env` from `.env.example` if missing
 * 2. Installs project dependencies
 * 3. Generates Prisma Client
 * 4. Creates & seeds SQLite database (`prisma/dev.db`) with 16 natural products & logins
 * 5. Builds the optimized Next.js production bundle for instant page loads
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

function run(cmd, args, label) {
  console.log(`\n==> ${label}`);
  const result = spawnSync(cmd, args, {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit",
    shell: isWin,
  });
  if (result.status !== 0) {
    console.error(`\n[ERROR] Step failed: ${label}`);
    process.exit(result.status || 1);
  }
}

console.log("=== Singitronic E-Commerce Setup ===");

const envFile = path.join(rootDir, ".env");
const envExample = path.join(rootDir, ".env.example");
if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envFile);
  console.log("Created .env from .env.example");
}

run(npmCmd, ["install", "--no-audit", "--no-fund"], "Installing dependencies");
run(process.execPath, [path.join(__dirname, "prisma-generate.js")], "Generating Prisma Client");

const seedArgs = [path.join(__dirname, "ensure-db.js")];
if (process.argv.includes("--seed")) seedArgs.push("--seed");
run(process.execPath, seedArgs, "Initializing SQLite database & demo catalog");

if (!process.argv.includes("--skip-build")) {
  const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
  run(process.execPath, [nextBin, "build"], "Building optimized frontend bundle");
}

console.log("\n========================================================");
console.log("  Setup Complete!");
console.log("  Run the app      : npm run dev");
console.log("  Open in browser  : http://localhost:3000");
console.log("  Admin Login      : admin@singitronic.com / Admin123!");
console.log("  Customer Login   : sarah.kamau@example.com / Customer123!");
console.log("========================================================\n");
