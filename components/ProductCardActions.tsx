"use client";
import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaCartPlus, FaCheck } from "react-icons/fa6";
import { useProductStore } from "@/app/_zustand/store";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";

export function WishlistToggleButton({
  product,
  variant = "icon",
}: {
  product: Product;
  variant?: "icon" | "button";
}) {
  const { data: session } = useSession();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isSaved = mounted && wishlist.some((item) => item.id === product.id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved) {
      removeFromWishlist(product.id);
      toast.success("Removed from wishlist");
      if (session?.user?.email) {
        try {
          const uRes = await apiClient.get(
            `/api/users/email/${encodeURIComponent(session.user.email)}`
          );
          if (uRes.ok) {
            const u = await uRes.json();
            if (u?.id) {
              await apiClient.delete(`/api/wishlist/${u.id}/${product.id}`);
            }
          }
        } catch (_) {}
      }
    } else {
      addToWishlist({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.mainImage,
        slug: product.slug,
        stockAvailabillity: product.inStock,
      });
      toast.success("Saved to wishlist");
      if (session?.user?.email) {
        try {
          const uRes = await apiClient.get(
            `/api/users/email/${encodeURIComponent(session.user.email)}`
          );
          if (uRes.ok) {
            const u = await uRes.json();
            if (u?.id) {
              await apiClient.post("/api/wishlist", {
                userId: u.id,
                productId: product.id,
              });
            }
          }
        } catch (_) {}
      }
    }
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold border transition-all ${
          isSaved
            ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
        aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isSaved ? (
          <FaHeart className="w-4 h-4 text-rose-500" />
        ) : (
          <FaRegHeart className="w-4 h-4" />
        )}
        <span>{isSaved ? "Saved" : "Wishlist"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
      title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-all ${
        isSaved
          ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100"
          : "bg-white/95 border-slate-200/80 text-slate-500 hover:text-rose-500 hover:border-rose-200"
      }`}
    >
      {isSaved ? (
        <FaHeart className="w-4 h-4" />
      ) : (
        <FaRegHeart className="w-4 h-4" />
      )}
    </button>
  );
}

export function QuickAddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useProductStore();
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = !product.inStock || product.inStock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart({
      id: product.id.toString(),
      title: product.title,
      price: product.price,
      image: product.mainImage,
      amount: 1,
      slug: product.slug,
      inStock: product.inStock,
    });
    setJustAdded(true);
    toast.success(`${product.title} added to cart`);
    setTimeout(() => setJustAdded(false), 1400);
  };

  if (isOutOfStock) {
    return (
      <span className="inline-flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 px-3.5 py-2 text-xs font-semibold cursor-not-allowed">
        Sold Out
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all shadow-sm ${
        justAdded
          ? "bg-emerald-600 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      {justAdded ? (
        <>
          <FaCheck className="w-3.5 h-3.5" />
          <span>Added</span>
        </>
      ) : (
        <>
          <FaCartPlus className="w-3.5 h-3.5" />
          <span>Add</span>
        </>
      )}
    </button>
  );
}
