#!/usr/bin/env node
/**
 * Self-healing database check (Windows, macOS, Linux).
 * Ensures `.env` files exist, SQLite tables & indexes are created,
 * demo catalog is seeded if empty, and demo admin + customer logins exist.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { createClient } = require("@libsql/client");

const rootDir = path.resolve(__dirname, "..");
const serverDir = path.join(rootDir, "server");
const { loadEnvFile } = require(path.join(rootDir, "utils", "dbUrl.js"));
const { initSqliteSchema } = require(path.join(rootDir, "prisma", "init-sqlite.js"));

function ensureEnvFiles() {
  const target = path.join(rootDir, ".env");
  const example = path.join(rootDir, ".env.example");
  if (!fs.existsSync(target) && fs.existsSync(example)) {
    fs.copyFileSync(example, target);
    console.log("Created .env from template.");
  }
  loadEnvFile(target);
}

async function ensureDemoUser(client, email, password, role) {
  const res = await client.execute({
    sql: `SELECT "id", "password", "role" FROM "User" WHERE lower("email") = ? LIMIT 1;`,
    args: [email],
  });
  const row = res.rows?.[0];
  if (row && row.password && row.role === role) return;
  const hash = await bcrypt.hash(password, 10);
  if (row) {
    await client.execute({
      sql: `UPDATE "User" SET "email" = ?, "password" = ?, "role" = ? WHERE "id" = ?;`,
      args: [email, hash, role, String(row.id)],
    });
  } else {
    await client.execute({
      sql: `INSERT INTO "User" ("id", "email", "password", "role") VALUES (?, ?, ?, ?);`,
      args: [crypto.randomUUID(), email, hash, role],
    });
  }
}

async function ensureDatabaseReady(options = {}) {
  ensureEnvFiles();
  const forceSeed = Boolean(options.forceSeed) || process.argv.includes("--seed");
  const dbUrl = await initSqliteSchema({ silent: true });

  const client = createClient({ url: dbUrl });
  let productCount = 0;
  try {
    const prodRes = await client.execute(`SELECT COUNT(*) AS cnt FROM "Product";`);
    productCount = Number(prodRes.rows?.[0]?.cnt ?? 0);
    await ensureDemoUser(client, "admin@singitronic.com", "Admin123!", "admin");
    await ensureDemoUser(client, "sarah.kamau@example.com", "Customer123!", "user");
  } finally {
    client.close();
  }

  if (forceSeed || productCount === 0) {
    const res = spawnSync(
      process.execPath,
      [path.join(rootDir, "prisma", "seed.js")],
      { cwd: rootDir, env: process.env, stdio: "inherit" }
    );
    if (res.status !== 0) {
      throw new Error(`Database seed exited with code ${res.status}`);
    }
    return { seeded: true, productCount: 16 };
  }

  if (!options.silent) {
    console.log(`Database ready (${productCount} products, logins active).`);
  }
  return { seeded: false, productCount };
}

module.exports = { ensureEnvFiles, ensureDatabaseReady };

if (require.main === module) {
  ensureDatabaseReady().catch((err) => {
    console.error("Failed to prepare database:", err);
    process.exit(1);
  });
}
