const prisma = require("../utills/db");
const { asyncHandler, AppError } = require("../utills/errorHandler");

async function recalculateProductRating(productId) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  });
  if (reviews.length === 0) return;
  const avg = Math.round(
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  );
  await prisma.product.update({
    where: { id: productId },
    data: { rating: Math.min(5, Math.max(1, avg)) },
  });
}

const getAllReviews = asyncHandler(async (_req, res) => {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: { id: true, title: true, slug: true, mainImage: true },
      },
    },
  });
  return res.json(reviews);
});

const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!productId) {
    throw new AppError("Product ID is required", 400);
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });

  const total = reviews.length;
  const average =
    total > 0
      ? Number(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
        )
      : 0;

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of reviews) {
    if (breakdown[r.rating] !== undefined) {
      breakdown[r.rating] += 1;
    }
  }

  return res.json({ reviews, total, average, breakdown });
});

const createProductReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { author, email, rating, title, comment } = req.body;

  if (!productId) throw new AppError("Product ID is required", 400);
  if (!author || String(author).trim().length < 2) {
    throw new AppError("Please enter your name (at least 2 characters)", 400);
  }
  const numRating = Number(rating);
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    throw new AppError("Rating must be between 1 and 5 stars", 400);
  }
  if (!comment || String(comment).trim().length < 5) {
    throw new AppError("Review comment must be at least 5 characters", 400);
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError("Product not found", 404);

  // Check if reviewer email placed an order containing this product
  let verified = false;
  if (email && String(email).trim()) {
    const order = await prisma.customer_order.findFirst({
      where: {
        email: String(email).trim().toLowerCase(),
        products: { some: { productId } },
      },
    });
    verified = Boolean(order);
  }

  const review = await prisma.review.create({
    data: {
      productId,
      author: String(author).trim().slice(0, 80),
      email: email ? String(email).trim().toLowerCase().slice(0, 120) : null,
      rating: numRating,
      title: title ? String(title).trim().slice(0, 120) : null,
      comment: String(comment).trim().slice(0, 1500),
      verified,
    },
  });

  await recalculateProductRating(productId);

  return res.status(201).json(review);
});

const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) throw new AppError("Review not found", 404);

  await prisma.review.delete({ where: { id } });
  await recalculateProductRating(existing.productId);
  return res.status(204).send();
});

module.exports = {
  getAllReviews,
  getProductReviews,
  createProductReview,
  deleteReview,
};
