const prisma = require("../utills/db");

async function getProductBySlug(request, response) {
  try {
    const { slug } = request.params;
    const foundProduct = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        merchant: true,
        _count: { select: { reviews: true } },
      },
    });

    if (!foundProduct) {
      return response.status(404).json({ error: "Product not found" });
    }
    return response.status(200).json(foundProduct);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return response.status(500).json({ error: "Error fetching product" });
  }
}

module.exports = { getProductBySlug };
