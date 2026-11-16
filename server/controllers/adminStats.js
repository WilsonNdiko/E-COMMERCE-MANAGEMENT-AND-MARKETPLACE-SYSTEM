const prisma = require("../utills/db");
const { asyncHandler } = require("../utills/errorHandler");

const DEFAULT_SETTINGS = {
  storeName: "Singitronic",
  supportEmail: "support@singitronic.com",
  supportPhone: "+1 (800) 555-0194",
  storeAddress: "742 Innovation Drive, Austin, TX 78701",
  shippingFee: "10",
  freeShippingThreshold: "150",
  taxRate: "8",
  currency: "USD",
  announcementText: "Free express shipping on orders over $150 · Use code SAVE10 for 10% off",
};

const getAdminStats = asyncHandler(async (req, res) => {
  const [
    products,
    orders,
    usersCount,
    categories,
    merchantsCount,
    reviewsCount,
    subscribersCount,
    unreadContactsCount,
  ] = await Promise.all([
    prisma.product.findMany({
      include: { category: { select: { name: true } } },
    }),
    prisma.customer_order.findMany({
      orderBy: { dateTime: "desc" },
      include: {
        products: {
          include: {
            product: { select: { id: true, title: true, mainImage: true, price: true } },
          },
        },
      },
    }),
    prisma.user.count(),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    }),
    prisma.merchant.count({ where: { status: { in: ["ACTIVE", "active"] } } }),
    prisma.review.count(),
    prisma.newsletterSubscriber.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);

  const activeOrders = orders.filter(
    (o) => o.status !== "cancelled" && o.status !== "canceled"
  );
  const totalRevenue = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue =
    activeOrders.length > 0 ? Math.round(totalRevenue / activeOrders.length) : 0;

  const ordersByStatus = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  for (const o of orders) {
    const key = o.status === "canceled" ? "cancelled" : (o.status || "processing").toLowerCase();
    if (ordersByStatus[key] !== undefined) {
      ordersByStatus[key] += 1;
    } else {
      ordersByStatus.processing += 1;
    }
  }

  const inStockCount = products.filter((p) => p.inStock > 0).length;
  const outOfStockCount = products.filter((p) => p.inStock <= 0).length;
  const lowStockProducts = products
    .filter((p) => p.inStock <= 8)
    .sort((a, b) => a.inStock - b.inStock)
    .slice(0, 6);

  const topCategories = categories
    .map((c) => ({ id: c.id, name: c.name, count: c._count.products }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return res.json({
    kpis: {
      totalRevenue,
      avgOrderValue,
      totalOrders: orders.length,
      totalProducts: products.length,
      inStockCount,
      outOfStockCount,
      totalUsers: usersCount,
      totalCategories: categories.length,
      activeMerchants: merchantsCount,
      totalReviews: reviewsCount,
      newsletterSubscribers: subscribersCount,
      unreadMessages: unreadContactsCount,
    },
    ordersByStatus,
    recentOrders: orders.slice(0, 6),
    lowStockProducts,
    topCategories,
  });
});

const getStoreSettings = asyncHandler(async (req, res) => {
  const rows = await prisma.storeSetting.findMany();
  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return res.json(settings);
});

const updateStoreSettings = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const allowedKeys = Object.keys(DEFAULT_SETTINGS);
  for (const key of allowedKeys) {
    if (body[key] !== undefined) {
      const value = String(body[key]).trim();
      await prisma.storeSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }
  const rows = await prisma.storeSetting.findMany();
  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return res.json(settings);
});

module.exports = {
  getAdminStats,
  getStoreSettings,
  updateStoreSettings,
};
