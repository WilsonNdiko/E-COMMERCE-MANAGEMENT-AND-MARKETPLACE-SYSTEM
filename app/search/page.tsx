import { ProductItem, SectionTitle } from "@/components";
import apiClient from "@/lib/api";
import Link from "next/link";
import React from "react";
import { sanitize } from "@/lib/sanitize";
import { categoryMenuList } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ search?: string }>;
}

const SearchPage = async ({ searchParams }: Props) => {
  const sp = await searchParams;
  const query = (sp?.search || "").trim();
  let products: Product[] = [];

  try {
    const data = await apiClient.get(
      `/api/search?query=${encodeURIComponent(query)}`,
      { cache: "no-store" }
    );
    if (data.ok) {
      const result = await data.json();
      products = Array.isArray(result) ? result : [];
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
    products = [];
  }

  return (
    <div className="bg-slate-50 min-h-[70vh] pb-16">
      <SectionTitle
        title={query ? `Results for "${sanitize(query)}"` : "Search Catalog"}
        path="Home | Search"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-600">
            Found{" "}
            <strong className="text-slate-900 font-bold">
              {products.length}
            </strong>{" "}
            {products.length === 1 ? "product" : "products"}
            {query ? ` matching "${sanitize(query)}"` : ""}
          </p>
          <Link
            href="/shop"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Browse with filters →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-5">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900">
                No products matched your search
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Check your spelling, try a broader keyword, or jump directly to
                one of our popular departments below.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {categoryMenuList.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={c.href}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-xs font-semibold text-slate-700 transition-colors"
                >
                  {c.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
