const express = require("express");
const path = require("path");
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Load root .env with zero external dependencies (works on Windows/macOS/Linux)
const { loadEnvFile } = require(path.join(PROJECT_ROOT, "utils", "dbUrl.js"));
loadEnvFile(path.join(PROJECT_ROOT, ".env"));

const cors = require("cors");
const fileUpload = require("express-fileupload");

// Import logging & rate limiting middleware
const {
  addRequestId,
  requestLogger,
  errorLogger,
  securityLogger,
} = require("./middleware/requestLogger");

const {
  generalLimiter,
  authLimiter,
  userManagementLimiter,
  uploadLimiter,
  searchLimiter,
  orderLimiter,
} = require("./middleware/rateLimiter");

const { handleServerError } = require("./utills/errorHandler");
const { ensureDatabaseReady } = require(path.join(
  PROJECT_ROOT,
  "scripts",
  "ensure-db.js"
));

async function startServer() {
  // Guarantee SQLite schema, catalog & demo accounts exist when started standalone
  if (process.env.SKIP_DB_BOOTSTRAP !== "1") {
    try {
      await ensureDatabaseReady({ silent: false });
    } catch (err) {
      console.error("Warning during database bootstrap:", err.message || err);
    }
  }

  const productsRouter = require("./routes/products");
  const productImagesRouter = require("./routes/productImages");
  const categoryRouter = require("./routes/category");
  const searchRouter = require("./routes/search");
  const mainImageRouter = require("./routes/mainImages");
  const userRouter = require("./routes/users");
  const orderRouter = require("./routes/customer_orders");
  const slugRouter = require("./routes/slugs");
  const orderProductRouter = require("./routes/customer_order_product");
  const wishlistRouter = require("./routes/wishlist");
  const notificationsRouter = require("./routes/notifications");
  const merchantRouter = require("./routes/merchant");
  const bulkUploadRouter = require("./routes/bulkUpload");
  const reviewsRouter = require("./routes/reviews");
  const newsletterRouter = require("./routes/newsletter");
  const contactRouter = require("./routes/contact");
  const adminStatsRouter = require("./routes/adminStats");

  const app = express();
  app.set("trust proxy", 1);

  app.use(addRequestId);
  app.use(securityLogger);
  app.use(requestLogger);
  app.use(errorLogger);

  const allowedOrigins = new Set(
    [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      process.env.NEXTAUTH_URL,
      process.env.FRONTEND_URL,
    ].filter(Boolean)
  );

  const corsOptions = {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.has(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.endsWith(".e2b.app") ||
        origin.endsWith(".e2b.dev")
      ) {
        return callback(null, true);
      }
      return callback(
        new Error("The CORS policy for this site does not allow access from the specified Origin."),
        false
      );
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };

  app.use(generalLimiter);
  app.use(express.json({ limit: "2mb" }));
  app.use(cors(corsOptions));
  app.use(fileUpload());

  app.use("/api/users", userManagementLimiter);
  app.use("/api/search", searchLimiter);
  app.use("/api/orders", orderLimiter);
  app.use("/api/order-product", orderLimiter);
  app.use("/api/images", uploadLimiter);
  app.use("/api/main-image", uploadLimiter);
  app.use("/api/bulk-upload", uploadLimiter);
  app.use("/api/users/email", authLimiter);

  app.use("/api/products", productsRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/images", productImagesRouter);
  app.use("/api/main-image", mainImageRouter);
  app.use("/api/users", userRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/order-product", orderProductRouter);
  app.use("/api/slugs", slugRouter);
  app.use("/api/wishlist", wishlistRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/merchants", merchantRouter);
  app.use("/api/bulk-upload", bulkUploadRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/newsletter", newsletterRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/admin", adminStatsRouter);

  app.get("/", (req, res) => {
    res.status(200).json({
      name: "Singitronic E-Commerce API",
      status: "OK",
      health: "/health",
    });
  });

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      requestId: req.reqId,
    });
  });

  app.use("*", (req, res) => {
    res.status(404).json({
      error: "Route not found",
      requestId: req.reqId,
    });
  });

  app.use((err, req, res, next) => {
    handleServerError(err, res, `${req.method} ${req.path}`);
  });

  const PORT = Number(process.env.PORT) || 3001;
  const HOST = process.env.HOST || "0.0.0.0";
  const server = app.listen(PORT, HOST, () => {
    console.log(`API ready on http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE") {
      console.log(`Port ${PORT} is already running an API instance — reusing it.`);
      process.exit(0);
    }
    console.error("API server failed to start:", err);
    process.exit(1);
  });
}

startServer();
