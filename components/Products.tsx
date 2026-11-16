import React from "react";
import Link from "next/link";
import ProductItem from "./ProductItem";
import Pagination from "./Pagination";
import apiClient from "@/lib/api";

const Products = async ({
  params,
  searchParams,
}: {
  params: { slug?: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const inStock = searchParams?.inStock !== "false";
  const outOfStock = searchParams?.outOfStock !== "false";
  const maxPrice = searchParams?.price ? Number(searchParams.price) : null;
  const minRating = searchParams?.rating ? Number(searchParams.rating) : 0;
  const sort =
    typeof searchParams?.sort === "string" ? searchParams.sort : "defaultSort";
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const category =
    params?.slug && params.slug.length > 0 ? params.slug[0] : "";

  const qs = new URLSearchParams();
  qs.set("inStock", String(inStock));
  qs.set("outOfStock", String(outOfStock));
  if (maxPrice && !Number.isNaN(maxPrice)) qs.set("maxPrice", String(maxPrice));
  if (minRating > 0) qs.set("minRating", String(minRating));
  if (category) qs.set("category", category);
  qs.set("sort", sort);
  qs.set("page", String(page));
  qs.set("limit", "12");

  let products: Product[] = [];
  let totalCount = 0;
  let totalPages = 1;

  try {
    const res = await apiClient.get(`/api/products?${qs.toString()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      totalCount = Number(res.headers.get("x-total-count")) || 0;
      totalPages = Number(res.headers.get("x-total-pages")) || 1;
      const result = await res.json();
      products = Array.isArray(result) ? result : [];
      if (!totalCount) totalCount = products.length;
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    products = [];
  }

  return (
    <div>
      <p className="text-xs font-medium text-stone-500 mb-4">
        Showing{" "}
        <span className="font-semibold text-stone-800">{products.length}</span>{" "}
        of <span className="font-semibold text-stone-800">{totalCount}</span>{" "}
        {totalCount === 1 ? "product" : "products"}
      </p>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductItem key={product.id} product={product} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center space-y-3">
          <p className="text-lg font-bold text-stone-900">
            No matching products found
          </p>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Try widening your price range, lowering the minimum rating, or
            browsing all categories.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
            >
              Clear All Filters
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
