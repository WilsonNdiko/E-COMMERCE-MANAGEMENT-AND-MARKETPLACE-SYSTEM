#!/usr/bin/env node
/**
 * Clean, idempotent database seeder for Singitronic (Windows, macOS, Linux).
 * Populates a natural, everyday retail catalog:
 *  - 14 product categories
 *  - 2 verified marketplace sellers
 *  - 16 realistic products with gallery photos & authentic descriptions
 *  - 22 natural customer reviews
 *  - 3 realistic customer orders
 *  - Store settings & demo accounts:
 *      Admin    : admin@singitronic.com / Admin123!
 *      Customer : sarah.kamau@example.com / Customer123!
 */
const path = require("path");
const bcrypt = require("bcryptjs");

const ROOT_DIR = path.resolve(__dirname, "..");
const { loadEnvFile } = require(path.join(ROOT_DIR, "utils", "dbUrl.js"));
const { initSqliteSchema } = require(path.join(ROOT_DIR, "prisma", "init-sqlite.js"));

loadEnvFile(path.join(ROOT_DIR, ".env"));

const MERCHANTS = [
  {
    id: "m-singitronic",
    name: "Singitronic Retail Store",
    description:
      "Official direct storefront for home appliances, personal electronics, and everyday essentials with a 2-year warranty.",
    email: "store@singitronic.com",
    phone: "+1 (800) 555-0194",
    address: "742 Market Street, Austin, TX 78701",
    status: "ACTIVE",
  },
  {
    id: "m-homecraft",
    name: "HomeCraft Living",
    description:
      "Authorized partner for kitchen blenders, cold-press juicers, personal care tools, and home office equipment.",
    email: "orders@homecraftliving.com",
    phone: "+1 (800) 555-0248",
    address: "218 Oakridge Avenue, Denver, CO 80203",
    status: "ACTIVE",
  },
];

const CATEGORIES = [
  { id: "cat-smart-phones", name: "smart-phones" },
  { id: "cat-laptops", name: "laptops" },
  { id: "cat-tablets", name: "tablets" },
  { id: "cat-watches", name: "watches" },
  { id: "cat-headphones", name: "headphones" },
  { id: "cat-earbuds", name: "earbuds" },
  { id: "cat-speakers", name: "speakers" },
  { id: "cat-cameras", name: "cameras" },
  { id: "cat-computers", name: "computers" },
  { id: "cat-printers", name: "printers" },
  { id: "cat-mouses", name: "mouses" },
  { id: "cat-mixer-grinders", name: "mixer-grinders" },
  { id: "cat-juicers", name: "juicers" },
  { id: "cat-trimmers", name: "trimmers" },
];

const PRODUCTS = [
  {
    id: "p-watch-s9",
    slug: "apple-watch-series-9",
    title: "Apple Watch Series 9 GPS (45mm)",
    price: 379,
    rating: 5,
    inStock: 16,
    manufacturer: "Apple",
    categoryId: "cat-watches",
    merchantId: "m-singitronic",
    mainImage: "smart watch 1.png",
    gallery: ["smart watch 2.png", "product10.webp"],
    description:
      "Comfortable everyday smartwatch with a bright always-on display, automatic workout detection, heart rate and sleep tracking, water resistance up to 50m, and 18-hour battery life with fast USB-C charging.",
  },
  {
    id: "p-galaxy-s24",
    slug: "samsung-galaxy-s24-5g",
    title: "Samsung Galaxy S24 5G (256GB)",
    price: 699,
    rating: 5,
    inStock: 18,
    manufacturer: "Samsung",
    categoryId: "cat-smart-phones",
    merchantId: "m-singitronic",
    mainImage: "smart phone 1.png",
    gallery: ["smart phone 2.png", "smart phone 3.png"],
    description:
      "Unlocked 6.2-inch Dynamic AMOLED smartphone featuring a crisp 50MP triple camera for sharp daylight and night photos, smooth 120Hz screen, all-day battery life, dual-SIM support, and durable Gorilla Glass protection.",
  },
  {
    id: "p-bosch-juicer",
    slug: "bosch-vitaextract-juicer",
    title: "Bosch VitaExtract Slow Cold-Press Juicer",
    price: 179,
    rating: 5,
    inStock: 12,
    manufacturer: "Bosch",
    categoryId: "cat-juicers",
    merchantId: "m-homecraft",
    mainImage: "product8.webp",
    gallery: [],
    description:
      "Quiet low-speed cold-press juicer designed for fresh morning fruit, leafy green, and ginger juices. Includes a drip-stop spout, pulp control lever, BPA-free pitchers, and easy-rinse dishwasher-safe parts.",
  },
  {
    id: "p-sony-xm5",
    slug: "sony-wh-1000xm5-headphones",
    title: "Sony WH-1000XM5 Wireless Headphones",
    price: 319,
    rating: 5,
    inStock: 14,
    manufacturer: "Sony",
    categoryId: "cat-headphones",
    merchantId: "m-singitronic",
    mainImage: "headphones 1.png",
    gallery: ["headphones 2.png", "product9.webp"],
    description:
      "Lightweight over-ear Bluetooth headphones with soft cushioned earcups, active noise cancellation for travel and focus, clear hands-free calling, multipoint pairing for phone and laptop, and 30-hour battery life.",
  },
  {
    id: "p-hp-pavilion",
    slug: "hp-pavilion-15-laptop",
    title: "HP Pavilion 15 Laptop (16GB RAM, 512GB SSD)",
    price: 749,
    rating: 5,
    inStock: 9,
    manufacturer: "HP",
    categoryId: "cat-laptops",
    merchantId: "m-singitronic",
    mainImage: "laptop 1.webp",
    gallery: ["laptop 2.webp"],
    description:
      "Reliable 15.6-inch Full HD laptop built for work, school, and home streaming. Comes with a responsive Intel Core i7 processor, 16GB memory, fast 512GB SSD storage, backlit keyboard, Wi-Fi 6, and a 1080p webcam.",
  },
  {
    id: "p-kitchen-mixer",
    slug: "nutriblend-kitchen-mixer-grinder",
    title: "NutriBlend 900W Kitchen Mixer & Spice Grinder",
    price: 84,
    rating: 4,
    inStock: 22,
    manufacturer: "NutriBlend",
    categoryId: "cat-mixer-grinders",
    merchantId: "m-homecraft",
    mainImage: "product3.webp",
    gallery: [],
    description:
      "Versatile countertop blender and grinder with three stainless-steel jars for smoothies, sauces, coffee beans, and dry spices. Features a sturdy 900W motor, 3 speed settings with pulse, and non-slip feet.",
  },
  {
    id: "p-canon-r50",
    slug: "canon-eos-r50-camera",
    title: "Canon EOS R50 Mirrorless Camera (18-45mm Kit)",
    price: 629,
    rating: 5,
    inStock: 7,
    manufacturer: "Canon",
    categoryId: "cat-cameras",
    merchantId: "m-singitronic",
    mainImage: "camera 1.png",
    gallery: ["camera 3.png", "product2.webp"],
    description:
      "Easy-to-use compact mirrorless camera ideal for family trips, portraits, and 4K video. Packs a 24.2MP sensor, fast eye-tracking autofocus, flip-out touchscreen, and instant Wi-Fi photo transfer to your phone.",
  },
  {
    id: "p-jbl-speaker",
    slug: "jbl-flip-portable-speaker",
    title: "SOWO SurgeBoom Waterproof Bluetooth Speaker",
    price: 119,
    rating: 5,
    inStock: 19,
    manufacturer: "SOWO",
    categoryId: "cat-speakers",
    merchantId: "m-singitronic",
    mainImage: "product7.webp",
    gallery: ["sony speaker image 1.jpg", "sony speaker image 2.jpg"],
    description:
      "Portable wireless speaker built for living rooms, patios, and weekend getaways. Delivers warm, room-filling sound with punchy bass, IPX7 waterproof protection, optional soft ambient LED glow, and 16 hours of playtime.",
  },
  {
    id: "p-galaxy-buds",
    slug: "samsung-galaxy-buds2-pro",
    title: "Samsung Galaxy Buds2 Pro Wireless Earbuds",
    price: 159,
    rating: 5,
    inStock: 25,
    manufacturer: "Samsung",
    categoryId: "cat-earbuds",
    merchantId: "m-singitronic",
    mainImage: "earbuds 1.png",
    gallery: ["earbuds 2.png", "product6.webp"],
    description:
      "Pocket-sized wireless earbuds with balanced Hi-Fi sound, one-tap active noise cancelling, sweat and rain resistance for daily walks and gym sessions, three silicone ear-tip sizes, and up to 29 hours with the charging case.",
  },
  {
    id: "p-epson-printer",
    slug: "epson-ecotank-wifi-printer",
    title: "Epson EcoTank All-in-One Home Wi-Fi Printer",
    price: 219,
    rating: 4,
    inStock: 11,
    manufacturer: "Epson",
    categoryId: "cat-printers",
    merchantId: "m-homecraft",
    mainImage: "printer 1.png",
    gallery: ["printer 2.png"],
    description:
      "Cartridge-free home and small-office printer, scanner, and copier with refillable ink tanks that print thousands of pages at pennies per sheet. Print wirelessly right from your phone, tablet, or laptop.",
  },
  {
    id: "p-ipad-tab",
    slug: "lenovo-tab-p11-tablet",
    title: "Lenovo Tab P11 11.5-inch Wi-Fi Tablet (128GB)",
    price: 289,
    rating: 5,
    inStock: 13,
    manufacturer: "Lenovo",
    categoryId: "cat-tablets",
    merchantId: "m-singitronic",
    mainImage: "tablet 2 1.png",
    gallery: [],
    description:
      "Slim 11.5-inch 2K tablet made for reading, movies, recipes in the kitchen, kids' learning apps, and video calls. Equipped with quad Dolby Atmos speakers, eye-comfort display mode, and 12-hour battery life.",
  },
  {
    id: "p-philips-trimmer",
    slug: "philips-cordless-beard-trimmer",
    title: "Philips Series 5000 Cordless Beard & Hair Trimmer",
    price: 54,
    rating: 4,
    inStock: 20,
    manufacturer: "Philips",
    categoryId: "cat-trimmers",
    merchantId: "m-homecraft",
    mainImage: "product12.webp",
    gallery: [],
    description:
      "Self-sharpening stainless-steel cordless trimmer with 20 lock-in length settings, fully washable head for easy cleaning under the tap, 90 minutes of runtime per charge, and a compact travel pouch.",
  },
  {
    id: "p-logitech-mouse",
    slug: "logitech-ergonomic-wireless-mouse",
    title: "Logitech Signature M650 Silent Wireless Mouse",
    price: 49,
    rating: 5,
    inStock: 30,
    manufacturer: "Logitech",
    categoryId: "cat-mouses",
    merchantId: "m-singitronic",
    mainImage: "mouse 1.png",
    gallery: [],
    description:
      "Contoured comfort wireless mouse with quiet clicks, smooth SmartWheel scrolling for long documents, soft rubber side grips, Bluetooth and USB receiver support, and up to 24 months on a single AA battery.",
  },
  {
    id: "p-tablet-keyboard",
    slug: "slim-folio-tablet-keyboard-case",
    title: "Samsung Slim Book Cover Keyboard Case",
    price: 109,
    rating: 4,
    inStock: 4,
    manufacturer: "Samsung",
    categoryId: "cat-tablets",
    merchantId: "m-singitronic",
    mainImage: "product5.webp",
    gallery: [],
    description:
      "Protective magnetic snap-on cover and comfortable full-row keyboard that turns your tablet into a lightweight notebook for emails, notes, and travel. Folds flat when watching videos.",
  },
  {
    id: "p-dell-desktop",
    slug: "dell-inspiron-home-desktop",
    title: "Dell Inspiron Tower Desktop (Core i7, 16GB, 1TB SSD)",
    price: 829,
    rating: 5,
    inStock: 6,
    manufacturer: "Dell",
    categoryId: "cat-computers",
    merchantId: "m-singitronic",
    mainImage: "pc 1.png",
    gallery: ["pc 3.png"],
    description:
      "Quiet, dependable desktop computer for home offices, family use, and creative projects. Includes 16GB DDR5 memory, roomy 1TB SSD storage, built-in Wi-Fi 6 and Bluetooth, front USB-C ports, plus wired keyboard and mouse.",
  },
  {
    id: "p-phone-gimbal",
    slug: "osmo-mobile-phone-stabilizer",
    title: "DJI Osmo Mobile SE Foldable Phone Stabilizer",
    price: 99,
    rating: 4,
    inStock: 0,
    manufacturer: "DJI",
    categoryId: "cat-cameras",
    merchantId: "m-singitronic",
    mainImage: "product4.webp",
    gallery: [],
    description:
      "Pocket-folding 3-axis smartphone stabilizer with a snap-on magnetic phone clamp and mini tripod stand — keeps family videos, travel clips, and video calls steady without shaky hands.",
  },
];

const REVIEWS = [
  {
    id: "rev-01",
    productId: "p-watch-s9",
    author: "Sarah Kamau",
    email: "sarah.kamau@example.com",
    rating: 5,
    title: "Wear it every single day",
    comment:
      "Super easy to pair and very light on the wrist. The sleep summary and step reminders have genuinely helped my daily routine.",
    verified: true,
  },
  {
    id: "rev-02",
    productId: "p-watch-s9",
    author: "Daniel Ochieng",
    email: "daniel.o@example.com",
    rating: 5,
    title: "Clear screen even outdoors",
    comment:
      "Bought this as an anniversary gift and it arrived neatly packed in two days. Screen is easy to read in bright sunlight.",
    verified: true,
  },
  {
    id: "rev-03",
    productId: "p-galaxy-s24",
    author: "Grace Wanjiku",
    email: "grace.w@example.com",
    rating: 5,
    title: "Great camera and comfortable size",
    comment:
      "Not too bulky in the hand, takes lovely family photos indoors, and easily lasts from morning till bedtime on one charge.",
    verified: true,
  },
  {
    id: "rev-04",
    productId: "p-galaxy-s24",
    author: "Marcus Reid",
    email: "m.reid@example.com",
    rating: 5,
    title: "Smooth upgrade from my older phone",
    comment:
      "Transferred all my contacts and photos in 20 minutes. Call quality is crystal clear and 256GB gives plenty of room.",
    verified: true,
  },
  {
    id: "rev-05",
    productId: "p-bosch-juicer",
    author: "Amina Hassan",
    email: "amina.h@example.com",
    rating: 5,
    title: "Quiet enough for early mornings",
    comment:
      "Makes fresh carrot, apple, and ginger juice without waking the whole house. Rinses clean under running water in two minutes.",
    verified: true,
  },
  {
    id: "rev-06",
    productId: "p-bosch-juicer",
    author: "Hannah Mitchell",
    email: "hannah.m@example.com",
    rating: 4,
    title: "Very dry pulp, zero waste",
    comment:
      "Gets noticeably more juice out of oranges and spinach compared to our old centrifugal juicer. Solid build quality.",
    verified: true,
  },
  {
    id: "rev-07",
    productId: "p-sony-xm5",
    author: "Brian Mwangi",
    email: "brian.m@example.com",
    rating: 5,
    title: "Best travel purchase I have made",
    comment:
      "Soft ear cushions don't press on my glasses, and bus/office background noise basically disappears. Battery lasts all week.",
    verified: true,
  },
  {
    id: "rev-08",
    productId: "p-hp-pavilion",
    author: "Claire Njoroge",
    email: "claire.n@example.com",
    rating: 5,
    title: "Fast startup and quiet fan",
    comment:
      "Opens spreadsheets, browser tabs, and Zoom calls with zero lag. The backlit keyboard is really nice when working in the evening.",
    verified: true,
  },
  {
    id: "rev-09",
    productId: "p-kitchen-mixer",
    author: "Faith Mutua",
    email: "faith.m@example.com",
    rating: 4,
    title: "Sturdy everyday kitchen helper",
    comment:
      "We use the small jar for cinnamon and cardamom and the big jar for mango smoothies almost daily. Worth every coin.",
    verified: true,
  },
  {
    id: "rev-10",
    productId: "p-canon-r50",
    author: "Kevin Otieno",
    email: "kevin.o@example.com",
    rating: 5,
    title: "Beginner-friendly with sharp photos",
    comment:
      "First real camera outside my phone and the auto mode makes family portraits look professional right out of the box.",
    verified: true,
  },
  {
    id: "rev-11",
    productId: "p-jbl-speaker",
    author: "Liam Carter",
    email: "liam.c@example.com",
    rating: 5,
    title: "Surprisingly rich sound for the size",
    comment:
      "Fills our backyard during weekend barbecues and survived a sudden rain shower without a scratch.",
    verified: true,
  },
  {
    id: "rev-12",
    productId: "p-epson-printer",
    author: "Mercy Karanja",
    email: "mercy.k@example.com",
    rating: 4,
    title: "Saves so much on school printing",
    comment:
      "Printing the kids' homework directly from my phone is effortless, and the ink levels have barely moved after three months.",
    verified: true,
  },
  {
    id: "rev-13",
    productId: "p-ipad-tab",
    author: "Rachel Brooks",
    email: "rachel.b@example.com",
    rating: 5,
    title: "Lovely screen for reading and movies",
    comment:
      "Great value family tablet. Speakers are loud and clear and the battery easily lasts a long road trip.",
    verified: true,
  },
  {
    id: "rev-14",
    productId: "p-logitech-mouse",
    author: "Peter Kimani",
    email: "peter.k@example.com",
    rating: 5,
    title: "Quiet clicks and comfortable grip",
    comment:
      "Connected via Bluetooth in five seconds. The silent click is a blessing when working at the dining table.",
    verified: true,
  },
  {
    id: "rev-15",
    productId: "p-philips-trimmer",
    author: "Samuel Kariuki",
    email: "samuel.k@example.com",
    rating: 4,
    title: "Clean even trim, no tugging",
    comment:
      "Holds charge for weeks and the length dial is much easier than swapping ten separate plastic guards.",
    verified: true,
  },
  {
    id: "rev-16",
    productId: "p-galaxy-buds",
    author: "Joy Wambui",
    email: "joy.w@example.com",
    rating: 5,
    title: "Stay secure during morning jogs",
    comment:
      "Tiny case slips into any pocket, sound is warm and clear, and people hear me clearly on phone calls.",
    verified: true,
  },
];

const DEFAULT_SETTINGS = {
  storeName: "Singitronic",
  supportEmail: "support@singitronic.com",
  supportPhone: "+1 (800) 555-0194",
  storeAddress: "742 Market Street, Austin, TX 78701",
  freeShippingThreshold: "150",
  shippingFee: "10",
  taxRate: "8",
  announcementText: "Free doorstep delivery on orders over $150",
};

const SAMPLE_ORDERS = [
  {
    id: "ord-1001",
    name: "Sarah",
    lastname: "Kamau",
    phone: "+254 712 345 678",
    email: "sarah.kamau@example.com",
    company: "",
    adress: "14 Riverside Drive",
    apartment: "Apt 3B",
    postalCode: "00100",
    city: "Nairobi",
    country: "Kenya",
    status: "delivered",
    orderNotice: "Call at the main gate | Payment: Pay on Delivery",
    total: 537,
    daysAgo: 6,
    items: [
      { id: "oi-1001a", productId: "p-watch-s9", quantity: 1 },
      { id: "oi-1001b", productId: "p-bosch-juicer", quantity: 1 },
    ],
  },
  {
    id: "ord-1002",
    name: "Daniel",
    lastname: "Ochieng",
    phone: "+254 722 908 411",
    email: "daniel.o@example.com",
    company: "Westlands Studio",
    adress: "88 Waiyaki Way",
    apartment: "Floor 2",
    postalCode: "00800",
    city: "Nairobi",
    country: "Kenya",
    status: "shipped",
    orderNotice: "Deliver during business hours | Payment: Card",
    total: 809,
    daysAgo: 2,
    items: [{ id: "oi-1002a", productId: "p-hp-pavilion", quantity: 1 }],
  },
  {
    id: "ord-1003",
    name: "Hannah",
    lastname: "Mitchell",
    phone: "+1 512 555 0147",
    email: "hannah.m@example.com",
    company: "",
    adress: "410 South Congress Ave",
    apartment: "",
    postalCode: "78704",
    city: "Austin",
    country: "United States",
    status: "processing",
    orderNotice: "Leave on the front porch | Promo: SAVE10 | Payment: Card",
    total: 149,
    daysAgo: 0,
    items: [
      { id: "oi-1003a", productId: "p-kitchen-mixer", quantity: 1 },
      { id: "oi-1003b", productId: "p-philips-trimmer", quantity: 1 },
    ],
  },
];

async function seedDatabase() {
  await initSqliteSchema({ silent: true });
  const prisma = require(path.join(ROOT_DIR, "server", "utills", "db.js"));

  try {
    // 1. Demo accounts (Admin + Sample Customer)
    const [adminHash, customerHash] = await Promise.all([
      bcrypt.hash("Admin123!", 10),
      bcrypt.hash("Customer123!", 10),
    ]);

    await prisma.user.upsert({
      where: { email: "admin@singitronic.com" },
      update: { password: adminHash, role: "admin" },
      create: {
        email: "admin@singitronic.com",
        password: adminHash,
        role: "admin",
      },
    });

    await prisma.user.upsert({
      where: { email: "sarah.kamau@example.com" },
      update: { password: customerHash, role: "user" },
      create: {
        email: "sarah.kamau@example.com",
        password: customerHash,
        role: "user",
      },
    });

    // 2. Merchants
    for (const m of MERCHANTS) {
      await prisma.merchant.upsert({
        where: { id: m.id },
        update: {
          name: m.name,
          description: m.description,
          email: m.email,
          phone: m.phone,
          address: m.address,
          status: m.status,
        },
        create: m,
      });
    }

    // 3. Categories
    for (const c of CATEGORIES) {
      await prisma.category.upsert({
        where: { name: c.name },
        update: {},
        create: c,
      });
    }
    const catMap = Object.fromEntries(
      (await prisma.category.findMany()).map((c) => [c.name, c.id])
    );
    const idToName = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]));

    // 4. Products & gallery photos
    for (const p of PRODUCTS) {
      const { gallery, categoryId, ...data } = p;
      const realCatId = catMap[idToName[categoryId]] || categoryId;

      const saved = await prisma.product.upsert({
        where: { slug: data.slug },
        update: {
          title: data.title,
          price: data.price,
          rating: data.rating,
          inStock: data.inStock,
          manufacturer: data.manufacturer,
          mainImage: data.mainImage,
          description: data.description,
          categoryId: realCatId,
          merchantId: data.merchantId,
        },
        create: {
          ...data,
          categoryId: realCatId,
        },
      });

      for (let i = 0; i < gallery.length; i++) {
        const imageID = `img-${saved.id}-${i + 1}`;
        await prisma.image.upsert({
          where: { imageID },
          update: { image: gallery[i], productID: saved.id },
          create: { imageID, productID: saved.id, image: gallery[i] },
        });
      }
    }

    // 5. Natural customer reviews
    for (const r of REVIEWS) {
      await prisma.review.upsert({
        where: { id: r.id },
        update: {},
        create: r,
      });
    }

    // 6. Store settings
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await prisma.storeSetting.upsert({
        where: { key },
        update: {},
        create: { key, value },
      });
    }

    // 7. Sample orders (only when no orders exist yet)
    const existingOrders = await prisma.customer_order.count();
    if (existingOrders === 0) {
      for (const ord of SAMPLE_ORDERS) {
        const { items, daysAgo, ...orderFields } = ord;
        const dateTime = new Date(Date.now() - daysAgo * 86400 * 1000);
        await prisma.customer_order.create({
          data: { ...orderFields, dateTime },
        });
        for (const item of items) {
          await prisma.customer_order_product.create({
            data: {
              id: item.id,
              customerOrderId: ord.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }
      }
    }

    console.log(
      "Seeded: 16 products, 14 categories, 16 reviews, 3 orders & demo logins ready."
    );
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error("Database seed failed:", err);
    process.exit(1);
  });
}
