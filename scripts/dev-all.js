#!/usr/bin/env node
/**
 * Cross-platform full-stack launcher (Windows, macOS, Linux).
 * - Ensures `.env`, Prisma Client, SQLite database, 16 products & logins are ready.
 * - Starts Express API (:3001) and waits for `/health`.
 * - Starts pre-built Next.js storefront (:3000) for instant (~15ms) navigation.
 *   (Pass `--live` via `npm run dev:live` when editing code with hot-reload.)
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

// 1. Ensure .env exists & load into process.env
const envPath = path.join(rootDir, ".env");
const envExample = path.join(rootDir, ".env.example");
if (!fs.existsSync(envPath) && fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, envPath);
}
const { loadEnvFile } = require(path.join(rootDir, "utils", "dbUrl.js"));
loadEnvFile(envPath);

// 2. Ensure Prisma Client is generated
const clientIndex = path.join(rootDir, "node_modules", "@prisma", "client", "index.js");
if (!fs.existsSync(clientIndex)) {
  const gen = spawnSync(process.execPath, [path.join(__dirname, "prisma-generate.js")], {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit",
  });
  if (gen.status !== 0) process.exit(gen.status || 1);
}

// 3. Ensure SQLite schema, catalog & logins are ready
const dbCheck = spawnSync(process.execPath, [path.join(__dirname, "ensure-db.js")], {
  cwd: rootDir,
  env: process.env,
  stdio: "inherit",
});
if (dbCheck.status !== 0) process.exit(dbCheck.status || 1);

// 4. Build optimized bundle automatically if running fast mode for the first time
const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");
const buildIdPath = path.join(rootDir, ".next", "BUILD_ID");
if (!isLiveDev && !fs.existsSync(buildIdPath)) {
  console.log("\n==> Building optimized frontend for instant page loads (~15s)...");
  const gen = spawnSync(process.execPath, [path.join(__dirname, "prisma-generate.js")], {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit",
  });
  if (gen.status !== 0) process.exit(gen.status || 1);

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
    // Own process group on POSIX so Ctrl+C stops the whole tree (next-server
    // grandchildren included). On Windows, `detached` is harmless.
    detached: process.platform !== "win32",
  });

  const prefix = `${color}[${name}]\x1b[0m `;
  const forward = (stream) => (chunk) => {
    chunk
      .toString()
      .split(/\r?\n/)
      .filter(Boolean)
      .forEach((line) => stream.write(`${prefix}${line}\n`));
  };
  proc.stdout.on("data", forward(process.stdout));
  proc.stderr.on("data", forward(process.stderr));
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
      setTimeout(attempt, 120);
    };
    attempt();
  });
}

let stopping = false;
const shutdown = () => {
  if (stopping) return;
  stopping = true;
  console.log("\nStopping Singitronic...");
  for (const child of children) {
    if (!child || !child.pid) continue;
    try {
      if (process.platform === "win32") {
        spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
          stdio: "ignore",
        });
      } else {
        // Kill the entire group so Next.js worker grandchild processes exit too
        process.kill(-child.pid, "SIGTERM");
      }
    } catch {
      try {
        child.kill("SIGTERM");
      } catch {}
    }
  }
  setTimeout(() => process.exit(0), 300);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

(async () => {
  console.log("\n========================================================");
  console.log("  Singitronic E-Commerce Running");
  console.log(`  Website & Admin  : http://localhost:${webPort}`);
  console.log(`  REST API Health  : http://localhost:${apiPort}/health`);
  console.log("  Admin Login      : admin@singitronic.com / Admin123!");
  console.log("  Customer Login   : sarah.kamau@example.com / Customer123!");
  console.log("========================================================\n");

  startService("API", "\x1b[36m", process.execPath, ["app.js"], serverDir, {
    PORT: String(apiPort),
    SKIP_DB_BOOTSTRAP: "1",
  });
  await waitForHealth(`http://127.0.0.1:${apiPort}/health`, 8000);

  const nextArgs = isLiveDev
    ? [nextBin, "dev", "--turbopack", "-p", String(webPort)]
    : [nextBin, "start", "-p", String(webPort)];

  startService("WEB", "\x1b[32m", process.execPath, nextArgs, rootDir, {
    NODE_ENV: isLiveDev ? "development" : "production",
    BACKEND_INTERNAL_URL: `http://127.0.0.1:${apiPort}`,
    NEXTAUTH_URL: `http://localhost:${webPort}`,
    AUTH_TRUST_HOST: "true",
  });
})();
