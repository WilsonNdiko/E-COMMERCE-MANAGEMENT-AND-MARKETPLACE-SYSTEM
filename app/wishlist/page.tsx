"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionTitle } from "@/components";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import { useProductStore } from "@/app/_zustand/store";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";
import {
  FaRegHeart,
  FaBagShopping,
  FaTrashCan,
  FaArrowRight,
} from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";

export default function WishlistPage() {
  const { data: session } = useSession();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { addToCart } = useProductStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const removeItem = async (id: string) => {
    removeFromWishlist(id);
    if (session?.user?.email) {
      try {
        const uRes = await apiClient.get(
          `/api/users/email/${encodeURIComponent(session.user.email)}`
        );
        if (uRes.ok) {
          const u = await uRes.json();
          if (u?.id) await apiClient.delete(`/api/wishlist/${u.id}/${id}`);
        }
      } catch (_) {}
    }
  };

  const handleRemove = async (id: string) => {
    await removeItem(id);
    toast.success("Removed from wishlist");
  };

  const handleMoveToCart = async (item: ProductInWishlist) => {
    addToCart({
      id: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      amount: 1,
      slug: item.slug,
      inStock: item.stockAvailabillity,
    });
    await removeItem(item.id);
    toast.success(`Moved "${item.title}" to cart`);
  };

  const handleAddAllToCart = () => {
    const inStockItems = wishlist.filter((i) => i.stockAvailabillity > 0);
    if (inStockItems.length === 0) {
      toast.error("No in-stock items in your wishlist");
      return;
    }
    inStockItems.forEach((item) => {
      addToCart({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        amount: 1,
        slug: item.slug,
        inStock: item.stockAvailabillity,
      });
    });
    toast.success(`Added ${inStockItems.length} items to your cart!`);
  };

  const handleClearAll = async () => {
    const ids = wishlist.map((i) => i.id);
    clearWishlist();
    if (session?.user?.email && ids.length > 0) {
      try {
        const uRes = await apiClient.get(
          `/api/users/email/${encodeURIComponent(session.user.email)}`
        );
        if (uRes.ok) {
          const u = await uRes.json();
          if (u?.id) {
            await Promise.all(
              ids.map((pid) => apiClient.delete(`/api/wishlist/${u.id}/${pid}`))
            );
          }
        }
      } catch (_) {}
    }
    toast.success("Wishlist cleared");
  };

  const items = mounted ? wishlist : [];

  return (
    <div className="bg-slate-50 min-h-[75vh] pb-16">
      <SectionTitle title="Saved Wishlist" path="Home | Wishlist" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 sm:p-16 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <FaRegHeart className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Your wishlist is empty
            </h2>
            <p className="text-sm text-slate-500">
              Tap the heart icon on any product to save favorites for later or
              compare items side by side.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 text-sm transition-colors"
              >
                <span>Explore Electronics</span>
                <FaArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-sm text-slate-600">
                <strong className="font-bold text-slate-900">
                  {items.length}
                </strong>{" "}
                saved {items.length === 1 ? "item" : "items"}
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 transition-colors"
                >
                  <FaBagShopping className="w-3.5 h-3.5" />
                  <span>Add All to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-semibold px-4 py-2.5 transition-colors"
                >
                  <FaTrashCan className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => {
                const inStock = Number(item.stockAvailabillity) > 0;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      className="aspect-square bg-slate-50 p-6 flex items-center justify-center relative"
                    >
                      <span
                        className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          inStock
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {inStock ? "In Stock" : "Out of Stock"}
                      </span>
                      <Image
                        src={
                          item.image
                            ? `/${item.image}`
                            : "/product_placeholder.jpg"
                        }
                        alt={sanitize(item.title)}
                        width={220}
                        height={220}
                        className="w-full h-full max-h-[190px] object-contain"
                      />
                    </Link>

                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-sm font-bold text-slate-900 hover:text-blue-600 line-clamp-2"
                        >
                          {sanitize(item.title)}
                        </Link>
                        <p className="text-lg font-extrabold text-slate-900 mt-1.5">
                          ${Number(item.price).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          disabled={!inStock}
                          onClick={() => handleMoveToCart(item)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold py-2.5 px-3 transition-colors"
                        >
                          <FaBagShopping className="w-3.5 h-3.5" />
                          <span>{inStock ? "Move to Cart" : "Sold Out"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="w-9 h-9 rounded-xl border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 flex items-center justify-center transition-colors"
                          aria-label="Remove item"
                          title="Remove from wishlist"
                        >
                          <FaTrashCan className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
