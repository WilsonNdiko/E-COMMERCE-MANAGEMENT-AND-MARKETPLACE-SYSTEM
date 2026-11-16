#!/usr/bin/env node
/**
 * Idempotent database seeder for Singitronic.
 * Populates categories, merchant, 16 products, gallery images, reviews,
 * sample orders, store settings, and demo admin (`admin@singitronic.com` / `Admin123!`).
 */
const { spawnSync } = require("child_process");
const path = require("path");
const bcrypt = require("bcryptjs");

const rootDir = path.resolve(__dirname, "..");

async function main() {
  // 1. Ensure SQLite tables exist
  const initRes = spawnSync(
    process.execPath,
    [path.join(rootDir, "prisma", "init-sqlite.js")],
    { cwd: rootDir, stdio: "inherit" }
  );
  if (initRes.status !== 0) process.exit(initRes.status || 1);

  const prisma = require(path.join(rootDir, "server", "utills", "db.js"));

  // 2. Insert base categories & products if database is empty
  const catCount = await prisma.category.count();
  if (catCount === 0) {
    console.log("Inserting base catalog...");
    const insertRes = spawnSync(
      process.execPath,
      [path.join(rootDir, "server", "utills", "insertDemoData.js")],
      { cwd: rootDir, stdio: "inherit" }
    );
    if (insertRes.status !== 0) process.exit(insertRes.status || 1);
  }

  // 3. Ensure demo admin account exists
  const adminEmail = "admin@singitronic.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin123!", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log("Created demo admin user: admin@singitronic.com / Admin123!");
  }

  await prisma.$disconnect();

  // 4. Enrich catalog, reviews, settings, and demo orders
  const enrichRes = spawnSync(
    process.execPath,
    [path.join(rootDir, "prisma", "seed-enrich.js")],
    { cwd: rootDir, stdio: "inherit" }
  );
  if (enrichRes.status !== 0) process.exit(enrichRes.status || 1);

  console.log("Database seed completed successfully.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
