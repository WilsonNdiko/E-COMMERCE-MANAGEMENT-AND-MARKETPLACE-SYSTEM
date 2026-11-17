#!/usr/bin/env node
/**
 * Idempotent database seeder for Singitronic (Windows, macOS, Linux).
 * Populates all 12 categories, official merchant, 16 products, gallery images,
 * customer reviews, sample orders, store settings, and demo admin account
 * (`admin@singitronic.com` / `Admin123!`).
 */
const { spawnSync } = require("child_process");
const path = require("path");
const bcrypt = require("bcryptjs");

const rootDir = path.resolve(__dirname, "..");
const { loadEnvFile } = require(path.join(rootDir, "utils", "dbUrl.js"));
const { initSqliteSchema } = require(path.join(rootDir, "prisma", "init-sqlite.js"));

loadEnvFile(path.join(rootDir, ".env"));
loadEnvFile(path.join(rootDir, "server", ".env"));

async function main() {
  // 1. Ensure SQLite tables & indexes exist
  await initSqliteSchema();

  const prisma = require(path.join(rootDir, "server", "utills", "db.js"));

  // 2. Insert base categories, merchant & initial products if catalog is incomplete
  const prodCount = await prisma.product.count();
  if (prodCount < 12) {
    console.log("Inserting base catalog...");
    const insertRes = spawnSync(
      process.execPath,
      [path.join(rootDir, "server", "utills", "insertDemoData.js")],
      { cwd: rootDir, env: process.env, stdio: "inherit" }
    );
    if (insertRes.status !== 0) process.exit(insertRes.status || 1);
  }

  // 3. Ensure demo admin account (`admin@singitronic.com` / `Admin123!`) always exists & works
  const adminEmail = "admin@singitronic.com";
  const hashedPassword = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "admin" },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    },
  });
  // Also make sure password is set if it was somehow null
  const adminRecord = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminRecord.password) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { password: hashedPassword, role: "admin" },
    });
  }
  console.log("Verified demo admin user: admin@singitronic.com / Admin123!");

  await prisma.$disconnect();

  // 4. Enrich all 16 products, gallery images, reviews, settings, and demo orders
  const enrichRes = spawnSync(
    process.execPath,
    [path.join(rootDir, "prisma", "seed-enrich.js")],
    { cwd: rootDir, env: process.env, stdio: "inherit" }
  );
  if (enrichRes.status !== 0) process.exit(enrichRes.status || 1);

  console.log("Database seed completed successfully (16 products + admin login ready).");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
