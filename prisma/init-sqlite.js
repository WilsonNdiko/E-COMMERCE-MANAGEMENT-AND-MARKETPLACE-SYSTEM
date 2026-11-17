const path = require("path");
const PROJECT_ROOT = path.resolve(__dirname, "..");
const { resolveLibsqlUrl } = require(path.join(PROJECT_ROOT, "utils", "dbUrl.js"));
const { createClient } = require("@libsql/client");

const statements = [
  `PRAGMA journal_mode = WAL;`,
  `PRAGMA synchronous = NORMAL;`,
  `PRAGMA busy_timeout = 5000;`,
  `PRAGMA foreign_keys = ON;`,

  `CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name");`,

  `CREATE TABLE IF NOT EXISTS "Merchant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mainImage" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "inStock" INTEGER NOT NULL DEFAULT 1,
    "categoryId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Product_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");`,
  `CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");`,
  `CREATE INDEX IF NOT EXISTS "Product_price_idx" ON "Product"("price");`,
  `CREATE INDEX IF NOT EXISTS "Product_rating_idx" ON "Product"("rating");`,
  `CREATE INDEX IF NOT EXISTS "Product_inStock_idx" ON "Product"("inStock");`,

  `CREATE TABLE IF NOT EXISTS "Image" (
    "imageID" TEXT NOT NULL PRIMARY KEY,
    "productID" TEXT NOT NULL,
    "image" TEXT NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS "Image_productID_idx" ON "Image"("productID");`,

  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT DEFAULT 'user'
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`,

  `CREATE TABLE IF NOT EXISTS "Customer_order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "adress" TEXT NOT NULL,
    "apartment" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "dateTime" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "orderNotice" TEXT,
    "total" INTEGER NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS "Customer_order_email_idx" ON "Customer_order"("email");`,
  `CREATE INDEX IF NOT EXISTS "Customer_order_dateTime_idx" ON "Customer_order"("dateTime");`,

  `CREATE TABLE IF NOT EXISTS "customer_order_product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "customer_order_product_customerOrderId_fkey" FOREIGN KEY ("customerOrderId") REFERENCES "Customer_order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "customer_order_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "customer_order_product_order_idx" ON "customer_order_product"("customerOrderId");`,

  `CREATE TABLE IF NOT EXISTS "Wishlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Wishlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "Wishlist_userId_idx" ON "Wishlist"("userId");`,

  `CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");`,
  `CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");`,
  `CREATE INDEX IF NOT EXISTS "Notification_userId_type_idx" ON "Notification"("userId", "type");`,
  `CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");`,

  `CREATE TABLE IF NOT EXISTS "bulk_upload_batch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    CONSTRAINT "bulk_upload_batch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "bulk_upload_item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchId" TEXT NOT NULL,
    "productId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "manufacturer" TEXT,
    "description" TEXT,
    "mainImage" TEXT,
    "categoryId" TEXT NOT NULL,
    "inStock" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "error" TEXT,
    CONSTRAINT "bulk_upload_item_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "bulk_upload_batch" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bulk_upload_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  );`,

  `CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "email" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");`,

  `CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");`,

  `CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS "StoreSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
];

async function initSqliteSchema(options = {}) {
  const dbUrl = resolveLibsqlUrl(PROJECT_ROOT, options.url);
  const client = createClient({ url: dbUrl });
  try {
    for (const sql of statements) {
      await client.execute(sql);
    }
    if (!options.silent) {
      console.log(`SQLite schema ready at ${dbUrl}`);
    }
    return dbUrl;
  } finally {
    client.close();
  }
}

module.exports = { initSqliteSchema };

if (require.main === module) {
  initSqliteSchema().catch((err) => {
    console.error("Failed to initialize SQLite database:", err);
    process.exit(1);
  });
}
