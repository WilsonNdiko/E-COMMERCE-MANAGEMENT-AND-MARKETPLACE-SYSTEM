"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/app/_zustand/store";
import { WishlistToggleButton } from "./ProductCardActions";
import toast from "react-hot-toast";
import {
  FaMinus,
  FaPlus,
  FaBagShopping,
  FaBolt,
  FaShareNodes,
  FaCheck,
} from "react-icons/fa6";

const SingleProductDynamicFields = ({ product }: { product: Product }) => {
  const [quantityCount, setQuantityCount] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const { addToCart } = useProductStore();
  const router = useRouter();

  const maxStock = Math.max(0, Number(product.inStock) || 0);
  const inStock = maxStock > 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart({
      id: product.id.toString(),
      title: product.title,
      price: product.price,
      image: product.mainImage,
      amount: quantityCount,
      slug: product.slug,
      inStock: product.inStock,
    });
    toast.success(`Added ${quantityCount} × ${product.title} to cart`);
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    addToCart({
      id: product.id.toString(),
      title: product.title,
      price: product.price,
      image: product.mainImage,
      amount: quantityCount,
      slug: product.slug,
      inStock: product.inStock,
    });
    router.push("/checkout");
  };

  const handleShare = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      if (navigator.share) {
        await navigator.share({ title: product.title, url });
      } else if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Product link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (_) {}
  };

  return (
    <div className="space-y-4">
      {inStock ? (
        <>
          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Quantity
            </span>
            <div className="inline-flex items-center rounded-xl border border-stone-200 bg-white">
              <button
                type="button"
                onClick={() => setQuantityCount((q) => Math.max(1, q - 1))}
                disabled={quantityCount <= 1}
                className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-35 transition-colors"
                aria-label="Decrease quantity"
              >
                <FaMinus className="w-3 h-3" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-stone-900">
                {quantityCount}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantityCount((q) => Math.min(maxStock, q + 1))
                }
                disabled={quantityCount >= maxStock}
                className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-35 transition-colors"
                aria-label="Increase quantity"
              >
                <FaPlus className="w-3 h-3" />
              </button>
            </div>
            <span className="text-xs text-stone-500">
              {maxStock} available
            </span>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-3.5 text-sm shadow-md shadow-teal-700/20 transition-all"
            >
              <FaBagShopping className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-900 hover:bg-stone-800 text-white font-bold px-6 py-3.5 text-sm shadow-sm transition-all"
            >
              <FaBolt className="w-4 h-4 text-amber-400" />
              <span>Buy Now</span>
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-xl bg-stone-100 border border-stone-200 p-4">
          <p className="text-sm font-semibold text-stone-800">
            Currently Out of Stock
          </p>
          <p className="text-xs text-stone-500 mt-0.5">
            Save this item to your wishlist to keep track of restocks.
          </p>
        </div>
      )}

      {/* Secondary Actions: Wishlist + Share */}
      <div className="flex items-center gap-3 pt-1">
        <WishlistToggleButton product={product} variant="button" />
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white hover:bg-canvas px-4 py-3 text-sm font-semibold text-stone-700 transition-colors"
        >
          {copied ? (
            <>
              <FaCheck className="w-4 h-4 text-emerald-600" />
              <span>Link Copied</span>
            </>
          ) : (
            <>
              <FaShareNodes className="w-4 h-4" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SingleProductDynamicFields;
