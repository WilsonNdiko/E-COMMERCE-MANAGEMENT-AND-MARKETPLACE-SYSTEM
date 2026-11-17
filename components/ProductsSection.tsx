import React from "react";
import Link from "next/link";
import ProductItem from "./ProductItem";
import prisma from "@/utils/db";
import { FaArrowRight } from "react-icons/fa6";

const ProductsSection = async () => {
  let products: Product[] = [];

  try {
    const rows = await prisma.product.findMany({
      take: 8,
      include: { category: true },
      orderBy: [{ rating: "desc" }, { id: "asc" }],
    });
    products = rows as unknown as Product[];
  } catch (error) {
    console.error("Error fetching featured products:", error);
    products = [];
  }

  return (
    <section className="py-12 sm:py-16 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-9">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Customer Favorites
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mt-1">
              Popular Picks for You
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300/80 bg-white hover:bg-ivory px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition-colors self-start sm:self-auto"
          >
            <span>See All Products</span>
            <FaArrowRight className="w-3.5 h-3.5 text-teal-700" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-dashed border-stone-300 p-12 text-center space-y-2">
            <p className="text-stone-700 font-semibold">
              Catalog is initializing...
            </p>
            <p className="text-xs text-stone-500">
              Refresh this page in a moment or run{" "}
              <code className="text-teal-800 font-semibold">npm run db:seed</code>{" "}
              in your terminal.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
