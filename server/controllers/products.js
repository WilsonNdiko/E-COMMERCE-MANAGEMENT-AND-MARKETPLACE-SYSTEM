const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");

const ALLOWED_SORT_VALUES = [
  "defaultSort",
  "titleAsc",
  "titleDesc",
  "lowPrice",
  "highPrice",
  "topRated",
];

function parseQueryFilters(request) {
  const q = request.query || {};
  const result = {
    maxPrice: null,
    minPrice: null,
    minRating: null,
    category: null,
    inStockBool: null,
    outOfStockBool: null,
    legacyInStockOp: null,
    legacyInStockVal: null,
    sort: "defaultSort",
    page: Math.max(1, parseInt(q.page, 10) || 1),
    limit: Math.min(48, Math.max(1, parseInt(q.limit, 10) || 12)),
  };

  if (q.maxPrice !== undefined) {
    const v = Number(q.maxPrice);
    if (!Number.isNaN(v)) result.maxPrice = v;
  }
  if (q.minPrice !== undefined) {
    const v = Number(q.minPrice);
    if (!Number.isNaN(v)) result.minPrice = v;
  }
  if (q.minRating !== undefined) {
    const v = Number(q.minRating);
    if (!Number.isNaN(v)) result.minRating = v;
  }
  if (typeof q.category === "string" && q.category.trim()) {
    result.category = decodeURIComponent(q.category.trim());
  }
  if (q.inStock !== undefined) {
    result.inStockBool = q.inStock === "true" || q.inStock === "1";
  }
  if (q.outOfStock !== undefined) {
    result.outOfStockBool = q.outOfStock === "true" || q.outOfStock === "1";
  }
  if (typeof q.sort === "string" && ALLOWED_SORT_VALUES.includes(q.sort)) {
    result.sort = q.sort;
  }

  // Also support legacy bracket syntax: filters[field][$op]=val
  const divider = request.url.indexOf("?");
  if (divider !== -1) {
    const rawParams = request.url.substring(divider + 1).split("&");
    for (const rawParam of rawParams) {
      const decoded = decodeURIComponent(rawParam);
      const match = decoded.match(/^filters\[(\w+)]\[\$(\w+)]=(.*)$/);
      if (!match) continue;
      const [, field, op, rawVal] = match;
      if (field === "price") {
        const num = Number(rawVal);
        if (!Number.isNaN(num)) {
          if (op === "lte" || op === "lt") result.maxPrice = num;
          if (op === "gte" || op === "gt") result.minPrice = num;
        }
      } else if (field === "rating") {
        const num = Number(rawVal);
        if (!Number.isNaN(num) && (op === "gte" || op === "gt" || op === "equals")) {
          result.minRating = num;
        }
      } else if (field === "category" && op === "equals" && rawVal.trim()) {
        result.category = rawVal.trim();
      } else if (field === "inStock") {
        const num = Number(rawVal);
        if (!Number.isNaN(num)) {
          result.legacyInStockOp = op;
          result.legacyInStockVal = num;
        }
      }
    }
  }

  return result;
}

const getAllProducts = asyncHandler(async (request, response) => {
  const mode = request.query.mode || "";

  if (mode === "admin") {
    const adminProducts = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true } },
        merchant: { select: { id: true, name: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { title: "asc" },
    });
    return response.json(adminProducts);
  }

  const parsed = parseQueryFilters(request);
  const where = {};

  if (parsed.maxPrice !== null || parsed.minPrice !== null) {
    where.price = {};
    if (parsed.maxPrice !== null) where.price.lte = parsed.maxPrice;
    if (parsed.minPrice !== null) where.price.gte = parsed.minPrice;
  }

  if (parsed.minRating !== null && parsed.minRating > 0) {
    where.rating = { gte: parsed.minRating };
  }

  if (parsed.category) {
    where.category = { name: { equals: parsed.category } };
  }

  // Handle stock availability accurately (any positive quantity counts as in stock)
  if (parsed.inStockBool !== null || parsed.outOfStockBool !== null) {
    const wantIn = parsed.inStockBool !== false;
    const wantOut = parsed.outOfStockBool !== false;
    if (wantIn && !wantOut) {
      where.inStock = { gt: 0 };
    } else if (!wantIn && wantOut) {
      where.inStock = { lte: 0 };
    } else if (!wantIn && !wantOut) {
      where.inStock = { lt: 0 };
    }
  } else if (parsed.legacyInStockOp) {
    // Translate legacy filters[inStock][$op]=1 semantics properly for multi-unit inventory
    if (parsed.legacyInStockOp === "equals" && parsed.legacyInStockVal === 1) {
      where.inStock = { gt: 0 };
    } else if (parsed.legacyInStockOp === "lt" && parsed.legacyInStockVal === 1) {
      where.inStock = { lte: 0 };
    }
    // "lte" meant both inStock & outOfStock checked => no restriction needed
  }

  let orderBy = { id: "asc" };
  switch (parsed.sort) {
    case "titleAsc":
      orderBy = { title: "asc" };
      break;
    case "titleDesc":
      orderBy = { title: "desc" };
      break;
    case "lowPrice":
      orderBy = { price: "asc" };
      break;
    case "highPrice":
      orderBy = { price: "desc" };
      break;
    case "topRated":
      orderBy = { rating: "desc" };
      break;
    default:
      orderBy = { id: "asc" };
  }

  const skip = (parsed.page - 1) * parsed.limit;
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: parsed.limit,
      where,
      include: {
        category: { select: { id: true, name: true } },
        merchant: { select: { id: true, name: true } },
        _count: { select: { reviews: true } },
      },
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / parsed.limit));
  response.setHeader("X-Total-Count", String(totalCount));
  response.setHeader("X-Total-Pages", String(totalPages));
  response.setHeader("X-Current-Page", String(parsed.page));

  return response.json(products);
});

const createProduct = asyncHandler(async (request, response) => {
  const {
    merchantId,
    slug,
    title,
    mainImage,
    price,
    rating,
    description,
    manufacturer,
    categoryId,
    inStock,
  } = request.body;

  if (!title || !String(title).trim()) {
    throw new AppError("Missing required field: title", 400);
  }
  if (!merchantId) {
    throw new AppError("Missing required field: merchantId", 400);
  }
  if (!slug || !String(slug).trim()) {
    throw new AppError("Missing required field: slug", 400);
  }
  if (price === undefined || price === null || Number(price) < 0) {
    throw new AppError("Valid price is required", 400);
  }
  if (!categoryId) {
    throw new AppError("Missing required field: categoryId", 400);
  }

  const normalizedSlug = String(slug)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");

  const existingSlug = await prisma.product.findUnique({
    where: { slug: normalizedSlug },
  });
  if (existingSlug) {
    throw new AppError("A product with this slug already exists", 400);
  }

  const product = await prisma.product.create({
    data: {
      merchantId: String(merchantId),
      slug: normalizedSlug,
      title: String(title).trim(),
      mainImage: mainImage ? String(mainImage).trim() : "product_placeholder.jpg",
      price: Math.round(Number(price)),
      rating: rating !== undefined ? Math.min(5, Math.max(0, Math.round(Number(rating)))) : 5,
      description: description ? String(description).trim() : "",
      manufacturer: manufacturer ? String(manufacturer).trim() : "Generic",
      categoryId: String(categoryId),
      inStock: inStock !== undefined ? Math.max(0, Math.round(Number(inStock))) : 1,
    },
  });
  return response.status(201).json(product);
});

const updateProduct = asyncHandler(async (request, response) => {
  const { id } = request.params;
  const {
    merchantId,
    slug,
    title,
    mainImage,
    price,
    rating,
    description,
    manufacturer,
    categoryId,
    inStock,
  } = request.body;

  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  const data = {};
  if (merchantId !== undefined) data.merchantId = String(merchantId);
  if (title !== undefined) data.title = String(title).trim();
  if (mainImage !== undefined) data.mainImage = String(mainImage).trim();
  if (slug !== undefined) {
    data.slug = String(slug)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  if (price !== undefined) data.price = Math.round(Number(price));
  if (rating !== undefined) data.rating = Math.min(5, Math.max(0, Math.round(Number(rating))));
  if (description !== undefined) data.description = String(description);
  if (manufacturer !== undefined) data.manufacturer = String(manufacturer).trim();
  if (categoryId !== undefined) data.categoryId = String(categoryId);
  if (inStock !== undefined) data.inStock = Math.max(0, Math.round(Number(inStock)));

  const updatedProduct = await prisma.product.update({
    where: { id },
    data,
  });

  return response.status(200).json(updatedProduct);
});

const deleteProduct = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  const relatedOrderProductItems = await prisma.customer_order_product.findMany({
    where: { productId: id },
  });

  if (relatedOrderProductItems.length > 0) {
    throw new AppError(
      "Cannot delete this product because it is referenced in existing customer orders. You can set its stock to 0 instead.",
      400
    );
  }

  await prisma.image.deleteMany({ where: { productID: id } });
  await prisma.product.delete({ where: { id } });
  return response.status(204).send();
});

const searchProducts = asyncHandler(async (request, response) => {
  const query = String(request.query.query || "").trim().toLowerCase();
  if (!query) {
    return response.json([]);
  }

  const allProducts = await prisma.product.findMany({
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { reviews: true } },
    },
  });

  const filtered = allProducts.filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.manufacturer.toLowerCase().includes(query) ||
      (p.category?.name || "").toLowerCase().includes(query)
  );

  return response.json(filtered);
});

const getProductById = asyncHandler(async (request, response) => {
  const { id } = request.params;
  if (!id) {
    throw new AppError("Product ID is required", 400);
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      merchant: true,
      _count: { select: { reviews: true } },
    },
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return response.status(200).json(product);
});

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
};
