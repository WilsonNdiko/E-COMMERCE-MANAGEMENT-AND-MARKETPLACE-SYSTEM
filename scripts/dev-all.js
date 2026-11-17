#!/usr/bin/env node
/**
 * Cross-platform full-stack launcher (Windows, macOS, Linux).
 * - Guarantees `.env` files, Prisma Client, SQLite schema, 16 products,
 *   and `admin@singitronic.com` / `Admin123!` login are ready automatically.
 * - Starts the Express API server (:3001) and waits until `/health` responds.
 * - Serves the fast pre-built Next.js bundle (`next start`) by default so
 *   every page opens in ~10ms with minimal RAM (~90 MB) on any laptop.
 *   (Automatically builds `.next` once on first run if missing.)
 * - Pass `--live` (`npm run dev:live`) for live hot-reload editing via Turbopack.
 */
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const serverDir = path.join(rootDir, "server");
const isLiveDev = process.argv.includes("--live");
const apiPort = Number(process.env.PORT) || 3001;
const webPort = Number(process.env.WEB_PORT) || 3000;

// 1. Ensure .env files exist & are loaded into process.env
const { loadEnvFile } = require(path.join(rootDir, "utils", "dbUrl.js"));
if (!fs.existsSync(path.join(rootDir, ".env")) && fs.existsSync(path.join(rootDir, ".env.example"))) {
  fs.copyFileSync(path.join(rootDir, ".env.example"), path.join(rootDir, ".env"));
}
if (!fs.existsSync(path.join(serverDir, ".env")) && fs.existsSync(path.join(serverDir, ".env.example"))) {
  fs.copyFileSync(path.join(serverDir, ".env.example"), path.join(serverDir, ".env"));
}
loadEnvFile(path.join(rootDir, ".env"));
loadEnvFile(path.join(serverDir, ".env"));

// 2. Ensure Prisma Client is generated
const gen = spawnSync(process.execPath, [path.join(__dirname, "prisma-generate.js")], {
  cwd: rootDir,
  env: process.env,
  stdio: "inherit",
});
if (gen.status !== 0) process.exit(gen.status || 1);

// 3. Ensure SQLite schema, 16 products & admin account exist BEFORE booting servers
const dbCheck = spawnSync(process.execPath, [path.join(__dirname, "ensure-db.js")], {
  cwd: rootDir,
  env: process.env,
  stdio: "inherit",
});
if (dbCheck.status !== 0) process.exit(dbCheck.status || 1);

// 4. In default fast mode, auto-build `.next` once if it hasn't been built yet
const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
const buildIdPath = path.join(rootDir, ".next", "BUILD_ID");
if (!isLiveDev && !fs.existsSync(buildIdPath)) {
  console.log("\n==> First run detected: building optimized frontend for instant speed (~15s)...");
  const buildRes = spawnSync(process.execPath, [nextBin, "build"], {
    cwd: rootDir,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "inherit",
  });
  if (buildRes.status !== 0) process.exit(buildRes.status || 1);
}

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

function waitForHealth(url, timeoutMs = 8000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode === 200) return resolve(true);
        retry();
      });
      req.on("error", retry);
      req.setTimeout(1000, () => {
        req.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - start >= timeoutMs) return resolve(false);
      setTimeout(attempt, 150);
    };
    attempt();
  });
}

let shuttingDown = false;
const shutdown = () => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("\nStopping Singitronic services...");
  for (const child of children) {
    try {
      child.kill("SIGTERM");
    } catch (_) {}
  }
  setTimeout(() => process.exit(0), 350);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

(async () => {
  console.log("\n========================================================");
  console.log("  Singitronic Full-Stack E-Commerce System");
  console.log(`  Storefront & Admin : http://localhost:${webPort}`);
  console.log(`  Backend REST API   : http://localhost:${apiPort}/health`);
  console.log("  Admin Login        : admin@singitronic.com / Admin123!");
  console.log(
    `  Mode               : ${
      isLiveDev
        ? "Live Hot-Reload (Turbopack)"
        : "Fast Instant Mode (use `npm run dev:live` when editing code)"
    }`
  );
  console.log("========================================================\n");

  // Start Express API & wait until it is accepting requests
  startService("API", "\x1b[36m", process.execPath, ["app.js"], serverDir, {
    PORT: String(apiPort),
    BACKEND_INTERNAL_URL: `http://127.0.0.1:${apiPort}`,
  });
  await waitForHealth(`http://127.0.0.1:${apiPort}/health`, 8000);

  // Start Next.js frontend
  const nextArgs = isLiveDev
    ? [nextBin, "dev", "--turbopack", "-p", String(webPort)]
    : [nextBin, "start", "-p", String(webPort)];

  startService("WEB", "\x1b[32m", process.execPath, nextArgs, rootDir, {
    NODE_ENV: isLiveDev ? "development" : "production",
    BACKEND_INTERNAL_URL: `http://127.0.0.1:${apiPort}`,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || `http://localhost:${webPort}`,
  });
})();
