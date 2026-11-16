import {
  ProductItem,
  ProductTabs,
  SingleProductDynamicFields,
} from "@/components";
import ProductGallery from "@/components/ProductGallery";
import RecentlyViewed from "@/components/RecentlyViewed";
import apiClient from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import {
  FaStar,
  FaTruckFast,
  FaShieldHalved,
  FaRotateLeft,
  FaCircleCheck,
  FaCircleXmark,
  FaChevronRight,
} from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

interface ImageItem {
  imageID: string;
  productID: string;
  image: string;
}

interface SingleProductPageProps {
  params: Promise<{ productSlug: string }>;
}

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  const { productSlug } = await params;

  const data = await apiClient.get(
    `/api/slugs/${encodeURIComponent(productSlug)}`,
    { cache: "no-store" }
  );

  if (!data.ok) {
    notFound();
  }

  const product: Product = await data.json();
  if (!product || (product as any).error) {
    notFound();
  }

  // Fetch gallery images using real product.id
  let images: ImageItem[] = [];
  try {
    const imgRes = await apiClient.get(`/api/images/${product.id}`, {
      cache: "no-store",
    });
    if (imgRes.ok) {
      const parsed = await imgRes.json();
      images = Array.isArray(parsed) ? parsed : [];
    }
  } catch (_) {}

  // Fetch related products
  let relatedProducts: Product[] = [];
  try {
    const relRes = await apiClient.get(`/api/products?limit=8`, {
      cache: "no-store",
    });
    if (relRes.ok) {
      const all: Product[] = await relRes.json();
      if (Array.isArray(all)) {
        const sameCat = all.filter(
          (p) => p.id !== product.id && p.categoryId === product.categoryId
        );
        const others = all.filter(
          (p) => p.id !== product.id && p.categoryId !== product.categoryId
        );
        relatedProducts = [...sameCat, ...others].slice(0, 4);
      }
    }
  } catch (_) {}

  const inStock = Number(product.inStock) > 0;
  const rating = Math.min(5, Math.max(0, Number(product.rating) || 0));
  const sku = `SNG-${String(product.id).slice(0, 6).toUpperCase()}`;

  return (
    <div className="bg-canvas pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500 py-5"
        >
          <Link href="/" className="hover:text-teal-700 transition-colors">
            Home
          </Link>
          <FaChevronRight className="w-2.5 h-2.5 text-stone-300" />
          <Link href="/shop" className="hover:text-teal-700 transition-colors">
            Shop
          </Link>
          {product.category?.name && (
            <>
              <FaChevronRight className="w-2.5 h-2.5 text-stone-300" />
              <Link
                href={`/shop/${product.category.name}`}
                className="hover:text-teal-700 capitalize transition-colors"
              >
                {product.category.name.replace(/-/g, " ")}
              </Link>
            </>
          )}
          <FaChevronRight className="w-2.5 h-2.5 text-stone-300" />
          <span className="text-stone-900 font-semibold truncate max-w-[240px]">
            {sanitize(product.title)}
          </span>
        </nav>

        {/* Main 2-Column Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left: Interactive Photos + 360° 3D Studio */}
          <div className="lg:col-span-6">
            <Suspense
              fallback={
                <div className="aspect-square rounded-3xl bg-white border border-stone-200/80 shadow-sm" />
              }
            >
              <ProductGallery
                mainImage={product.mainImage}
                title={sanitize(product.title)}
                category={product.category?.name}
                manufacturer={product.manufacturer}
                images={images}
              />
            </Suspense>
          </div>

          {/* Right: Product Info & Actions */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-teal-700">
                  {sanitize(product.manufacturer)}
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-stone-500 font-mono">SKU: {sku}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 leading-tight">
                {sanitize(product.title)}
              </h1>

              {/* Stars + Stock */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < rating ? "text-amber-400" : "text-stone-200"
                      }`}
                    />
                  ))}
                  <span className="text-xs font-semibold text-stone-600 ml-1">
                    {rating}.0
                    {product._count?.reviews
                      ? ` (${product._count.reviews} ${
                          product._count.reviews === 1 ? "review" : "reviews"
                        })`
                      : ""}
                  </span>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${
                    inStock
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {inStock ? (
                    <>
                      <FaCircleCheck className="w-3.5 h-3.5" />
                      <span>In Stock ({product.inStock} ready)</span>
                    </>
                  ) : (
                    <>
                      <FaCircleXmark className="w-3.5 h-3.5" />
                      <span>Out of Stock</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 py-4 border-y border-stone-100">
              <span className="text-3xl sm:text-4xl font-extrabold text-stone-900">
                ${Number(product.price).toLocaleString()}
              </span>
              <span className="text-xs text-stone-500">
                {product.price >= 150
                  ? "Qualifies for FREE Express Shipping"
                  : "+ $10 flat-rate shipping (free over $150)"}
              </span>
            </div>

            {/* Short Description */}
            <p className="text-sm text-stone-600 leading-relaxed">
              {sanitize(product.description)}
            </p>

            {/* Dynamic Controls: Quantity, Add to Cart, Buy Now, Wishlist, Share */}
            <SingleProductDynamicFields product={product} />

            {/* Trust Assurances */}
            <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <FaTruckFast className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Fast Tracked Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldHalved className="w-4 h-4 text-teal-700 shrink-0" />
                <span>2-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <FaRotateLeft className="w-4 h-4 text-teal-700 shrink-0" />
                <span>30-Day Free Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs (Overview, Specifications, Customer Reviews) */}
        <div className="mt-12">
          <ProductTabs product={product} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900">
                You May Also Like
              </h2>
              <Link
                href="/shop"
                className="text-sm font-semibold text-teal-700 hover:text-teal-800"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <ProductItem key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed Products */}
        <RecentlyViewed
          currentProduct={{
            id: product.id,
            slug: product.slug,
            title: sanitize(product.title),
            mainImage: product.mainImage,
            price: product.price,
            rating,
            manufacturer: sanitize(product.manufacturer || "Singitronic"),
          }}
        />
      </div>
    </div>
  );
};

export default SingleProductPage;
