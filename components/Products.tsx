import React from "react";
import Link from "next/link";
import ProductItem from "./ProductItem";
import Pagination from "./Pagination";
import prisma from "@/utils/db";

const PAGE_SIZE = 12;

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
    params?.slug && params.slug.length > 0
      ? decodeURIComponent(params.slug[0]).trim().toLowerCase()
      : "";

  let products: Product[] = [];
  let totalCount = 0;
  let totalPages = 1;

  try {
    const where: any = {};

    if (inStock && !outOfStock) {
      where.inStock = { gt: 0 };
    } else if (!inStock && outOfStock) {
      where.inStock = { equals: 0 };
    } else if (!inStock && !outOfStock) {
      where.inStock = { lt: 0 };
    }

    if (maxPrice !== null && !Number.isNaN(maxPrice)) {
      where.price = { lte: maxPrice };
    }

    if (minRating > 0 && !Number.isNaN(minRating)) {
      where.rating = { gte: minRating };
    }

    if (category) {
      where.category = { name: { equals: category } };
    }

    let orderBy: any = [{ id: "asc" }];
    switch (sort) {
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
        orderBy = [{ rating: "desc" }, { price: "asc" }];
        break;
      default:
        orderBy = [{ id: "asc" }];
        break;
    }

    const [count, rows] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    totalCount = count;
    totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
    products = rows as unknown as Product[];
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
