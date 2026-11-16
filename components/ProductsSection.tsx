import React from "react";
import Link from "next/link";
import ProductItem from "./ProductItem";
import apiClient from "@/lib/api";
import { FaArrowRight } from "react-icons/fa6";

const ProductsSection = async () => {
  let products: Product[] = [];

  try {
    const data = await apiClient.get("/api/products?limit=8", {
      cache: "no-store",
    });
    if (data.ok) {
      const result = await data.json();
      products = Array.isArray(result) ? result : [];
    }
  } catch (error) {
    console.error("Error fetching featured products:", error);
    products = [];
  }

  return (
    <section className="py-14 sm:py-18 bg-white border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Curated Selection
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
              Featured Electronics
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 transition-colors self-start sm:self-auto"
          >
            <span>Explore Full Catalog</span>
            <FaArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <p className="text-slate-600 font-medium">
              No products available right now. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
