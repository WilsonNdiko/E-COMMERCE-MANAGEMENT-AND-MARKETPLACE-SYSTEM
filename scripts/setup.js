#!/usr/bin/env node
/**
 * One-command local setup for VS Code (Windows, macOS, Linux).
 * 1. Creates `.env` and `server/.env` from templates if missing
 * 2. Installs all frontend & backend dependencies
 * 3. Generates Prisma Client
 * 4. Initializes SQLite database & seeds all 16 products, reviews, settings & admin login
 * 5. Builds the optimized production Next.js bundle so pages open instantly (~10ms)
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
    env: process.env,
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

console.log("=== Singitronic E-Commerce Local Setup (Windows / macOS / Linux) ===");

ensureEnvFile(path.join(rootDir, ".env"), path.join(rootDir, ".env.example"));
ensureEnvFile(path.join(serverDir, ".env"), path.join(serverDir, ".env.example"));

// Install all dependencies in root (includes Express API packages too)
run(npmCmd, ["install", "--no-audit", "--no-fund"], rootDir, "Installing project dependencies");

// Generate Prisma Client
run(process.execPath, [path.join(__dirname, "prisma-generate.js")], rootDir, "Generating Prisma Client");

// Initialize SQLite schema, 16 demo products, reviews, settings & admin account
const seedArgs = [path.join(__dirname, "ensure-db.js")];
if (process.argv.includes("--seed")) seedArgs.push("--seed");
run(process.execPath, seedArgs, rootDir, "Preparing SQLite database, 16 products & admin account");

// Pre-build optimized production Next.js bundle so the site runs with zero compile lag
if (!process.argv.includes("--skip-build")) {
  const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
  run(
    process.execPath,
    [nextBin, "build"],
    rootDir,
    "Building fast production bundle (makes every page load instantly)"
  );
}

console.log("\n========================================================");
console.log("  Setup Complete!");
console.log("  Start the application : npm run dev");
console.log("  Open in your browser  : http://localhost:3000");
console.log("  Admin Login           : admin@singitronic.com / Admin123!");
console.log("========================================================\n");
