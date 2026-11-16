#!/usr/bin/env node
/**
 * Cross-platform full-stack dev launcher (Windows, macOS, Linux).
 * Starts BOTH the Express API server (:3001) and Next.js storefront (:3000)
 * in a single VS Code terminal with clean prefixed output and graceful shutdown.
 */
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const serverDir = path.join(rootDir, "server");

// Ensure .env files exist
if (!fs.existsSync(path.join(rootDir, ".env")) && fs.existsSync(path.join(rootDir, ".env.example"))) {
  fs.copyFileSync(path.join(rootDir, ".env.example"), path.join(rootDir, ".env"));
}
if (!fs.existsSync(path.join(serverDir, ".env")) && fs.existsSync(path.join(serverDir, ".env.example"))) {
  fs.copyFileSync(path.join(serverDir, ".env.example"), path.join(serverDir, ".env"));
}

// Generate Prisma client quickly before booting
const gen = spawnSync(process.execPath, [path.join(__dirname, "prisma-generate.js")], {
  cwd: rootDir,
  stdio: "inherit",
});
if (gen.status !== 0) process.exit(gen.status || 1);

const children = [];

function startService(name, color, cmd, args, cwd, extraEnv = {}) {
  const proc = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...extraEnv },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const prefix = `${color}[${name}]\x1b[0m `;
  proc.stdout.on("data", (chunk) => {
    chunk
      .toString()
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) => process.stdout.write(`${prefix}${line}\n`));
  });
  proc.stderr.on("data", (chunk) => {
    chunk
      .toString()
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) => process.stderr.write(`${prefix}${line}\n`));
  });
  proc.on("exit", (code) => {
    if (code !== null && code !== 0) {
      console.error(`${prefix}exited with code ${code}`);
    }
  });

  children.push(proc);
  return proc;
}

const shutdown = () => {
  console.log("\nStopping Singitronic services...");
  for (const child of children) {
    try {
      child.kill("SIGTERM");
    } catch (_) {}
  }
  setTimeout(() => process.exit(0), 400);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("\nStarting Singitronic Full-Stack E-Commerce System...");
console.log("  Storefront & Admin : http://localhost:3000");
console.log("  Backend REST API   : http://localhost:3001/health");
console.log("  Demo Admin Login   : admin@singitronic.com / Admin123!\n");

// 1. Express API Server
startService("API", "\x1b[36m", process.execPath, ["app.js"], serverDir);

// 2. Next.js Frontend
const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
const mode = process.argv.includes("--prod") ? "start" : "dev";
startService(
  "WEB",
  "\x1b[34m",
  process.execPath,
  ["--max-old-space-size=2560", nextBin, mode, "-p", process.env.WEB_PORT || "3000"],
  rootDir
);
