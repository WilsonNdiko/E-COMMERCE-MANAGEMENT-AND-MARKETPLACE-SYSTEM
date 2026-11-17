# Singitronic — Everyday Home, Lifestyle & Tech Marketplace

A fast, full-stack e-commerce storefront, interactive **360° 3D product viewer**, REST API, and role-protected **Admin Dashboard** built with **Next.js 15**, **React 18**, **Three.js**, **Express.js**, **Prisma + SQLite**, **NextAuth**, **Zustand**, and **Tailwind CSS**.

---

## Quick Start Locally in VS Code (Windows, macOS & Linux)

**Prerequisite:** [Node.js LTS (v20 or v22)](https://nodejs.org) — no external database (MySQL/PostgreSQL/XAMPP) required.

1. **Extract** the project folder and open it in **VS Code** (`File -> Open Folder...`).
2. Open the terminal (`Terminal -> New Terminal` or `` Ctrl + ` ``) and run:

```bash
npm run setup
npm run dev
```

3. Open **`http://localhost:3000`** in your browser.

*(Next time you open the project, skip `npm run setup` and just run `npm run dev`.)*

---

## Logins & Promo Codes

| Account | Email | Password | Access |
| --- | --- | --- | --- |
| **Store Admin** | `admin@singitronic.com` | `Admin123!` | Full storefront + `/admin` dashboard |
| **Sample Customer** | `sarah.kamau@example.com` | `Customer123!` | Customer account + sample order `ord-1001` |
| **New Customer** | Any email via `/register` | Any 6+ char password | Creates local SQLite account & signs in immediately |

- **Promo Codes** (at `/cart` or `/checkout`): `SAVE10` (10% off), `TECH15` (15% off), `WELCOME20` (20% off), `FREESHIP` (free delivery).
- **Sample Order IDs** (for `/orders` tracking): `ord-1001`, `ord-1002`, `ord-1003`.

---

## Project Structure

```text
singitronic-ecommerce/
├── app/                     # Next.js App Router pages & auth routes
│   ├── (dashboard)/admin/   # Admin dashboard (overview, orders, products, categories, merchants, users, bulk-upload, settings)
│   ├── _zustand/            # Cart, wishlist & notification state stores
│   ├── api/                 # NextAuth login & customer signup routes
│   └── ...                  # Storefront pages (shop, product + 3D, cart, checkout, orders, wishlist, login, register, account, search, faq, contact, about, legal)
├── components/              # Reusable storefront, 3D viewer & admin UI components
├── hooks/                   # Client hooks (notifications)
├── lib/                     # API client, HTML sanitizer & site navigation
├── prisma/                  # Prisma schema, SQLite initializer, natural catalog seed & dev.db
├── public/                  # Product photos, category icons & payment badges
├── scripts/                 # Cross-platform setup, DB self-heal, Prisma & server launchers
├── server/                  # Express REST API (routes, controllers, middleware, services, utils)
├── types/                   # TypeScript interfaces
├── utils/                   # Prisma client, cross-platform SQLite URL resolver & validation schemas
├── .env.example             # Default environment template (auto-copied to .env)
├── middleware.ts            # Admin route authorization guard
├── next.config.mjs          # Optimized Next.js & API proxy configuration
├── package.json             # Unified project scripts & dependencies
└── tailwind.config.ts       # Soft warm retail color palette
```

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run setup` | Installs dependencies, initializes & seeds SQLite (`prisma/dev.db`), and builds the optimized production bundle |
| `npm run dev` | Starts both the Express API (`:3001`) and fast Next.js app (`:3000`) with instant page loads |
| `npm run dev:live` | Starts API + Next.js Turbopack live hot-reload mode (use while editing `.tsx` / `.css` files) |
| `npm run build` | Rebuilds the optimized frontend bundle after code changes |
| `npm run db:seed` | Seeds or repairs the 16 natural catalog products, categories, reviews, orders & demo logins |
| `npm run db:studio` | Opens Prisma Studio to inspect or edit SQLite tables visually |
