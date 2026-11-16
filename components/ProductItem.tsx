import Image from "next/image";
import React from "react";
import Link from "next/link";
import { FaCube, FaStar } from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";
import {
  WishlistToggleButton,
  QuickAddToCartButton,
} from "./ProductCardActions";

const ProductItem = ({
  product,
}: {
  product: Product;
  color?: string;
}) => {
  const rating = Math.min(5, Math.max(0, Number(product.rating) || 0));
  const inStock = Number(product.inStock) > 0;
  const reviewCount = product._count?.reviews;

  return (
    <div className="group w-full bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-b from-slate-50/60 to-slate-100/70 p-6 flex items-center justify-center overflow-hidden">
        {/* Stock Badge */}
        <span
          className={`absolute top-3 left-3 z-10 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            inStock
              ? product.inStock <= 8
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-200/90 text-slate-600"
          }`}
        >
          {inStock
            ? product.inStock <= 8
              ? `Only ${product.inStock} left`
              : "In Stock"
            : "Out of Stock"}
        </span>

        {/* Wishlist Toggle */}
        <div className="absolute top-3 right-3 z-10">
          <WishlistToggleButton product={product} />
        </div>

        {/* Direct 3D View Quick Pill */}
        <Link
          href={`/product/${product.slug}?view=3d`}
          title={`Inspect ${sanitize(product.title)} in interactive 3D`}
          className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200/90 hover:border-blue-600 px-2.5 py-1 text-[11px] font-bold shadow-sm opacity-90 group-hover:opacity-100 transition-all"
        >
          <FaCube className="w-2.5 h-2.5" />
          <span>3D</span>
        </Link>

        <Link
          href={`/product/${product.slug}`}
          className="w-full h-full flex items-center justify-center"
        >
          <Image
            src={
              product.mainImage
                ? `/${product.mainImage}`
                : "/product_placeholder.jpg"
            }
            width={280}
            height={280}
            className="w-full h-full max-h-[210px] object-contain group-hover:scale-105 transition-transform duration-300"
            alt={sanitize(product?.title) || "Product image"}
          />
        </Link>
      </div>

      {/* Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-600 truncate">
              {sanitize(product.manufacturer || "Singitronic")}
            </span>
            {product.category?.name && (
              <span className="capitalize text-slate-400 truncate">
                {product.category.name.replace(/-/g, " ")}
              </span>
            )}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="block text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
          >
            {sanitize(product.title)}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 pt-0.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <FaStar
                key={idx}
                className={`w-3.5 h-3.5 ${
                  idx < rating ? "text-amber-400" : "text-slate-200"
                }`}
              />
            ))}
            <span className="text-xs text-slate-500 ml-1">
              {rating > 0 ? `${rating}.0` : "New"}
              {typeof reviewCount === "number" && reviewCount > 0
                ? ` (${reviewCount})`
                : ""}
            </span>
          </div>
        </div>

        {/* Price + Quick Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <p className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            ${Number(product.price).toLocaleString()}
          </p>
          <QuickAddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
