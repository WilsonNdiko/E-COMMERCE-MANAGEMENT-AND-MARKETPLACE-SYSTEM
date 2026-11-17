const prisma = require("../utills/db");

async function searchProducts(request, response) {
  try {
    const rawQuery = request.query.query;
    const query = typeof rawQuery === "string" ? rawQuery.trim().toLowerCase() : "";

    const allProducts = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: { rating: "desc" },
    });

    if (!query) {
      return response.json(allProducts);
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const matched = allProducts.filter((p) => {
      const haystack = [
        p.title,
        p.description,
        p.manufacturer,
        p.category?.name || "",
        (p.category?.name || "").replace(/-/g, " "),
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });

    return response.json(matched);
  } catch (error) {
    console.error("Error searching products:", error);
    return response.status(500).json({ error: "Error searching products" });
  }
}

module.exports = { searchProducts };
