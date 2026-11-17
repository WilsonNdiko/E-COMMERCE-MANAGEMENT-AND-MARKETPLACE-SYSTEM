# Singitronic — E-Commerce Management & Marketplace System

A full-stack electronics e-commerce storefront, interactive **360° WebGL 3D product showroom**, REST API backend, and role-protected **Admin Dashboard** built with **Next.js 15**, **React 18**, **Three.js**, **Express.js**, **Prisma**, **SQLite (LibSQL)**, **NextAuth**, **Zustand**, and **Tailwind CSS**.

---

## Key Features

### Storefront
- **Interactive 3D Product Studio**: Real-time WebGL 3D product inspection on every product page (`/product/[slug]?view=3d`) with 360° click/touch drag orbit, zoom, auto-spin turntable, camera presets (`3/4`, `Front`, `Back`, `Top`), live metallic hardware finish swatches (`Titanium`, `Silver`, `Obsidian`, `Cobalt`), `Light`/`Dark` studio lighting, fullscreen mode, and automatic CSS-3D fallback.
- **Catalog, Filtering & Instant Search**: Category browsing with product counts, debounced header search autocomplete, multi-filter sidebar (availability, price ceiling, star rating), sorting (`Featured`, `Top Rated`, `Price Low→High`, `Price High→Low`, `A–Z`, `Z–A`), and pagination.
- **Cart, Promo Codes & Stock-Protected Checkout**: Persistent cart with automatic inventory quantity clamping, promo codes (`SAVE10`, `TECH15`, `WELCOME20`, `FREESHIP`), dynamic shipping/tax calculation from live store settings, Pay on Delivery & validated Card payment options, and atomic inventory deduction.
- **Wishlist & Recently Viewed**: Local + account-synced wishlist with Move to Cart / Add All to Cart, plus automatic browsing history strip.
- **Order Tracking, Cancellation & Printable Receipts**: Lookup by Order ID or email, visual fulfillment progress bar, printable receipt layout, and one-click order cancellation (while `processing`) that automatically restores product stock.
- **Verified Customer Reviews, Newsletter & Support**: Star ratings and reviews per product (auto-updating product rating), newsletter signup, searchable FAQ, and customer support ticket form.

### Admin Dashboard (`/admin`)
- **Live Analytics Overview**: Real-time revenue, average order value, total orders, fulfillment pipeline breakdown, low/out-of-stock alerts, and recent orders.
- **Order Management**: Search, status filter tabs, inline status updates (with automatic customer notifications and stock restoration on cancel), full order editor, and CSV export.
- **Product, Category & CSV Bulk Upload**: Full product CRUD with image upload and auto-slug generation, bulk multi-select deletion, category management, and CSV bulk product importer with template download and batch rollback.
- **Merchants, Users & Settings/Inbox**: Marketplace merchant CRUD, user/admin role management, dynamic store settings (`shippingFee`, `freeShippingThreshold`, `taxRate`, announcement banner, support contacts), customer support inbox, review moderation, and newsletter subscriber CSV export.

---

## System Specifications (Running Locally in VS Code)

| Requirement | Specification |
| --- | --- |
| **Operating System** | Windows 10/11, macOS 12+, or Linux (Ubuntu 20.04+) |
| **Node.js** | **v18.18+** or **v20 LTS / v22 LTS** (v20 LTS recommended) |
| **npm** | **v9+** (bundled with Node.js) |
| **Database** | **SQLite** (embedded in `prisma/dev.db` — zero external DB server required!) |
| **RAM / Disk** | 4 GB+ RAM recommended (2 GB free), ~650 MB disk space (with `node_modules`) |
| **Ports Used** | `3000` (Next.js Web & Admin UI) and `3001` (Express REST API) |
| **Browser** | Chrome, Edge, Firefox, or Safari (with WebGL enabled for 3D viewer) |
| **Recommended VS Code Extensions** | ESLint, Tailwind CSS IntelliSense, Prisma |

---

## Quick Start in VS Code (2 Commands — Windows, macOS & Linux)

1. Open the cloned/extracted project folder in **VS Code** (`File -> Open Folder...`).
2. Open the integrated terminal (`` Ctrl+` `` on Windows/Linux, `` Cmd+` `` on macOS) and run:

```bash
npm run setup
npm run dev
```

*(Note: `npm run dev:all` and `npm start` also start the full application identically.)*

3. Open **http://localhost:3000** in your browser.

`npm run setup` automatically:
- Creates `.env` and `server/.env` from `.env.example` if not present
- Installs all frontend and backend dependencies in one step
- Generates the Prisma Client
- Creates and seeds the SQLite database (`prisma/dev.db` — fully compatible with Windows `C:\...`, macOS, and Linux paths, including spaces) with **16 products, 12 categories, customer reviews, demo orders, store settings, and the admin account (`admin@singitronic.com` / `Admin123!`)**
- Builds the optimized production Next.js bundle so every page loads instantly (~10ms) with low memory use (~100 MB RAM)

### Helpful Commands
| Command | What It Does |
| --- | --- |
| `npm run setup` | One-time install, SQLite database seed (16 products + admin), and fast production build |
| `npm run dev` / `npm run dev:all` | Starts both Express API (`:3001`) + fast storefront & admin (`:3000`) |
| `npm run dev:live` | Starts API + Next.js Turbopack live hot-reload mode (for editing `.tsx`/`.css` files) |
| `npm run db:seed` | Seeds or repairs all 16 demo products, categories, reviews & admin account |
| `npm run build` | Rebuilds the optimized production bundle after code edits |

---

## Demo Credentials & Test Data

- **Admin Dashboard URL**: `http://localhost:3000/login` -> redirects to `/admin`
- **Admin Email**: `admin@singitronic.com`
- **Admin Password**: `Admin123!` *(or click **Fill Demo Admin Login** on the login page)*
- **Active Promo Codes**:
  - `SAVE10` — 10% off order subtotal
  - `TECH15` — 15% off order subtotal
  - `WELCOME20` — 20% off order subtotal
  - `FREESHIP` — Free express shipping on any order
- **Sample Order IDs (for `/orders` lookup)**: `ord-demo-1001`, `ord-demo-1002`, `ord-demo-1003`

---

## Available npm Scripts

| Command | Description |
| --- | --- |
| `npm run setup` | Full automated setup (env files, dependencies, Prisma client, SQLite DB) |
| `npm run dev:all` | Start both Express API (`:3001`) and Next.js dev server (`:3000`) |
| `npm run build` | Generate Prisma Client and create an optimized Next.js production build |
| `npm run start:all` | Run Express API (`:3001`) + production Next.js server (`:3000`) |
| `npm run dev` | Run Next.js dev server only (`:3000`) |
| `npm run dev:server` | Run Express API server only (`:3001`) |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:push` | Apply/verify SQLite database schema (`prisma/init-sqlite.js`) |
| `npm run db:seed` | Seed (or refresh) demo catalog, reviews, settings & admin user |

---

## Environment Variables

Templates are provided in `.env.example` and `server/.env.example`:

**Root `.env`:**
```env
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=
BACKEND_INTERNAL_URL=http://127.0.0.1:3001
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=12D16C923BA17672F89B18C1DB22A9F8E7D6C5B4A3
AUTH_TRUST_HOST=true
```

**`server/.env`:**
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="file:./prisma/dev.db"
```

---

## Project Structure

```text
├── app/                  # Next.js 15 App Router pages (storefront, auth, admin)
│   ├── (dashboard)/admin # Protected admin dashboard routes
│   ├── api/              # NextAuth & user registration route handlers
│   └── _zustand/         # Persisted Cart, Wishlist, Pagination & Notification stores
├── components/           # UI components, ProductGallery, Product3DViewer (Three.js)
├── lib/                  # API client, config, sanitization & utilities
├── prisma/               # Prisma schema, SQLite initializer, seed script & dev.db
├── public/               # Product images, category icons & payment badges
├── scripts/              # Cross-platform setup, Prisma generate, seed & launcher scripts
└── server/               # Express.js REST API (controllers, routes, middleware, services)
```

---

## Troubleshooting

- **Port 3000 or 3001 already in use**: Close any previous running terminal instance (`Ctrl+C`), or change `PORT` in `server/.env` (and matching `BACKEND_INTERNAL_URL` in `.env`).
- **Reset database to fresh demo state**: Delete `prisma/dev.db` and run `npm run db:seed`.
- **3D view runs slowly**: Enable Hardware Acceleration in your browser settings.

---

## License

MIT License (upstream base copyright Aleksandar Kuzmanović).
