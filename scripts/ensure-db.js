#!/usr/bin/env node
/**
 * Self-healing database bootstrap (Windows, macOS, Linux).
 * Ensures `.env` files exist, SQLite tables & indexes are created,
 * all 16 catalog products are seeded when the DB is empty, and the
 * demo admin login (`admin@singitronic.com` / `Admin123!`) always exists.
 *
 * Fast path when DB is already populated: < 60ms.
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { createClient } = require("@libsql/client");

const rootDir = path.resolve(__dirname, "..");
const serverDir = path.join(rootDir, "server");
const { loadEnvFile, resolveLibsqlUrl } = require(path.join(
  rootDir,
  "utils",
  "dbUrl.js"
));
const { initSqliteSchema } = require(path.join(
  rootDir,
  "prisma",
  "init-sqlite.js"
));

function ensureEnvFiles() {
  const pairs = [
    [path.join(rootDir, ".env"), path.join(rootDir, ".env.example")],
    [path.join(serverDir, ".env"), path.join(serverDir, ".env.example")],
  ];
  for (const [target, example] of pairs) {
    if (!fs.existsSync(target) && fs.existsSync(example)) {
      fs.copyFileSync(example, target);
      console.log(`Created ${path.relative(rootDir, target)} from template.`);
    }
  }
  loadEnvFile(path.join(rootDir, ".env"));
  loadEnvFile(path.join(serverDir, ".env"));
}

async function ensureDatabaseReady(options = {}) {
  ensureEnvFiles();
  const forceSeed = Boolean(options.forceSeed) || process.argv.includes("--seed");
  const dbUrl = await initSqliteSchema({ silent: Boolean(options.silent) });

  const client = createClient({ url: dbUrl });
  let productCount = 0;
  let hasAdmin = false;

  try {
    const prodRes = await client.execute(`SELECT COUNT(*) AS cnt FROM "Product";`);
    productCount = Number(prodRes.rows?.[0]?.cnt ?? 0);

    const adminRes = await client.execute({
      sql: `SELECT "id", "password", "role" FROM "User" WHERE lower("email") = ? LIMIT 1;`,
      args: ["admin@singitronic.com"],
    });
    const adminRow = adminRes.rows?.[0];
    hasAdmin = Boolean(adminRow && adminRow.password && adminRow.role === "admin");

    if (!hasAdmin) {
      const hash = await bcrypt.hash("Admin123!", 10);
      if (adminRow) {
        await client.execute({
          sql: `UPDATE "User" SET "email" = ?, "password" = ?, "role" = 'admin' WHERE "id" = ?;`,
          args: ["admin@singitronic.com", hash, String(adminRow.id)],
        });
      } else {
        await client.execute({
          sql: `INSERT INTO "User" ("id", "email", "password", "role") VALUES (?, ?, ?, 'admin');`,
          args: [crypto.randomUUID(), "admin@singitronic.com", hash],
        });
      }
      console.log("Ready: Demo admin login enabled (admin@singitronic.com / Admin123!)");
    }
  } finally {
    client.close();
  }

  if (forceSeed || productCount === 0) {
    console.log("Empty product catalog detected — auto-seeding 16 demo products, reviews & settings...");
    const res = spawnSync(
      process.execPath,
      [path.join(__dirname, "seed-all.js")],
      { cwd: rootDir, env: process.env, stdio: "inherit" }
    );
    if (res.status !== 0) {
      throw new Error(`Auto-seed exited with code ${res.status}`);
    }
    return { seeded: true, productCount: 16 };
  }

  if (!options.silent) {
    console.log(`Database verified: ${productCount} products & admin account ready.`);
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
