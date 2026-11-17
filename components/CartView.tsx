"use client";

import React, { useEffect, useState } from "react";
import { useProductStore } from "@/app/_zustand/store";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";
import {
  FaCheck,
  FaTrashCan,
  FaMinus,
  FaPlus,
  FaBagShopping,
  FaArrowRight,
  FaTag,
  FaXmark,
  FaLock,
} from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";

const CartView = () => {
  const {
    products,
    removeFromCart,
    updateCartAmount,
    syncWithCatalog,
    clearCart,
    total,
    promoCode,
    discountPercent,
    freeShipping,
    applyPromoCode,
    removePromoCode,
  } = useProductStore();

  const [mounted, setMounted] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [storeRates, setStoreRates] = useState({
    shippingFee: 10,
    freeThreshold: 150,
    taxRate: 8,
  });

  useEffect(() => {
    setMounted(true);

    // Sync shipping & tax settings so Cart and Checkout always match identically
    apiClient
      .get("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setStoreRates({
          shippingFee: Math.max(0, Number(d.shippingFee ?? 10)),
          freeThreshold: Math.max(0, Number(d.freeShippingThreshold ?? 150)),
          taxRate: Math.max(0, Number(d.taxRate ?? 8)),
        });
      })
      .catch(() => {});

    // Verify cart items against live catalog stock & prices
    if (useProductStore.getState().products.length > 0) {
      apiClient
        .get("/api/products?limit=200")
        .then((r) => (r.ok ? r.json() : null))
        .then((list) => {
          if (!Array.isArray(list)) return;
          const note = syncWithCatalog(list);
          if (note) toast(note);
        })
        .catch(() => {});
    }
  }, [syncWithCatalog]);

  const items = mounted ? products : [];
  const subtotal = mounted ? total : 0;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const qualifiesFreeShip =
    freeShipping || discountedSubtotal >= storeRates.freeThreshold;
  const shipping =
    items.length === 0 ? 0 : qualifiesFreeShip ? 0 : storeRates.shippingFee;
  const tax =
    items.length === 0
      ? 0
      : Math.round((discountedSubtotal * storeRates.taxRate) / 100);
  const grandTotal = discountedSubtotal + shipping + tax;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyPromoCode(codeInput);
    if (res.ok) {
      toast.success(res.message);
      setCodeInput("");
    } else {
      toast.error(res.message);
    }
  };

  if (!mounted) {
    return (
      <div className="py-16 text-center text-sm text-stone-500">
        Loading your cart...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200/80 p-12 sm:p-16 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
          <FaBagShopping className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">
          Your shopping cart is empty
        </h2>
        <p className="text-sm text-stone-500">
          Browse our everyday home essentials, phones, laptops, and audio — plus
          enjoy free delivery on orders over ${storeRates.freeThreshold}.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-3 text-sm transition-colors"
          >
            <span>Start Shopping</span>
            <FaArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Cart Items Column */}
      <section aria-labelledby="cart-heading" className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="cart-heading" className="text-base font-bold text-stone-900">
            Cart Items ({items.reduce((sum, p) => sum + p.amount, 0)})
          </h2>
          <button
            type="button"
            onClick={() => {
              clearCart();
              toast.success("Cart cleared");
            }}
            className="text-xs font-semibold text-stone-500 hover:text-rose-600 transition-colors"
          >
            Clear cart
          </button>
        </div>

        {/* Free shipping progress bar */}
        {!qualifiesFreeShip && storeRates.freeThreshold > 0 && (
          <div className="rounded-2xl bg-sage border border-teal-800/15 px-4 py-3 text-xs text-teal-900 space-y-2">
            <p>
              Add{" "}
              <strong>
                $
                {Math.max(
                  0,
                  storeRates.freeThreshold - discountedSubtotal
                ).toLocaleString()}
              </strong>{" "}
              more to unlock <strong>FREE Delivery</strong>!
            </p>
            <div className="w-full h-1.5 rounded-full bg-white/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-teal-700 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (discountedSubtotal / storeRates.freeThreshold) * 100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        <ul
          role="list"
          className="bg-white rounded-3xl border border-stone-200/80 divide-y divide-stone-100 shadow-sm overflow-hidden"
        >
          {items.map((product) => {
            const href = product.slug ? `/product/${product.slug}` : "/shop";
            const maxStock =
              typeof product.inStock === "number" && product.inStock > 0
                ? product.inStock
                : 999;
            const atLimit = product.amount >= maxStock;

            return (
              <li
                key={product.id}
                className="p-5 sm:p-6 flex gap-4 sm:gap-6 items-center"
              >
                <Link
                  href={href}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-canvas border border-stone-100 p-3 flex items-center justify-center shrink-0"
                >
                  <Image
                    width={112}
                    height={112}
                    src={
                      product.image
                        ? `/${product.image}`
                        : "/product_placeholder.jpg"
                    }
                    alt={sanitize(product.title)}
                    className="w-full h-full object-contain"
                  />
                </Link>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={href}
                        className="text-sm sm:text-base font-bold text-stone-900 hover:text-teal-700 transition-colors line-clamp-2"
                      >
                        {sanitize(product.title)}
                      </Link>
                      <p className="text-xs text-stone-500 mt-0.5">
                        ${Number(product.price).toLocaleString()} each
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        removeFromCart(product.id);
                        toast.success("Item removed from cart");
                      }}
                      type="button"
                      className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      aria-label={`Remove ${product.title}`}
                    >
                      <FaTrashCan className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    {/* Quantity Controls */}
                    <div className="inline-flex items-center rounded-xl border border-stone-200 bg-canvas/60">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartAmount(
                            product.id,
                            Math.max(1, product.amount - 1)
                          )
                        }
                        disabled={product.amount <= 1}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-35"
                        aria-label="Decrease quantity"
                      >
                        <FaMinus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-9 text-center text-xs font-bold text-stone-900">
                        {product.amount}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (atLimit) {
                            toast(`Only ${maxStock} available in stock`);
                            return;
                          }
                          updateCartAmount(product.id, product.amount + 1);
                        }}
                        disabled={atLimit}
                        className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-35"
                        aria-label="Increase quantity"
                      >
                        <FaPlus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <p className="text-base font-extrabold text-stone-900">
                      ${(product.price * product.amount).toLocaleString()}
                    </p>
                  </div>

                  <p className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                    <FaCheck className="w-3 h-3" />
                    <span>
                      {maxStock <= 5
                        ? `Only ${maxStock} left in stock · Ready to ship`
                        : "In stock · Ships within 24 hours"}
                    </span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Order Summary Column */}
      <section
        aria-labelledby="summary-heading"
        className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6 sticky top-28"
      >
        <h2
          id="summary-heading"
          className="text-lg font-extrabold text-stone-900"
        >
          Order Summary
        </h2>

        {/* Promo code input */}
        <div className="space-y-2">
          {promoCode ? (
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <FaTag className="text-emerald-600" />
                <span>
                  Code <strong>{promoCode}</strong> applied
                  {discountPercent > 0
                    ? ` (−${discountPercent}%)`
                    : " (Free Delivery)"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  removePromoCode();
                  toast.success("Promo code removed");
                }}
                className="text-emerald-700 hover:text-emerald-900 p-1"
                aria-label="Remove promo code"
              >
                <FaXmark className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Promo code (e.g. SAVE10)"
                  className="flex-1 rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-stone-200 bg-canvas hover:bg-sand px-4 py-2.5 text-xs font-bold text-stone-800 transition-colors"
                >
                  Apply
                </button>
              </form>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                <span>Available:</span>
                {["SAVE10", "FREESHIP"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      const res = applyPromoCode(c);
                      if (res.ok) toast.success(res.message);
                    }}
                    className="rounded-md bg-canvas hover:bg-teal-50 border border-stone-200 hover:border-teal-300 px-2 py-0.5 font-semibold text-teal-800 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <dl className="space-y-3 text-sm border-t border-stone-100 pt-4">
          <div className="flex items-center justify-between text-stone-600">
            <dt>Subtotal</dt>
            <dd className="font-semibold text-stone-900">
              ${subtotal.toLocaleString()}
            </dd>
          </div>

          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-emerald-700">
              <dt>Promo Discount ({discountPercent}%)</dt>
              <dd className="font-semibold">
                −${discountAmount.toLocaleString()}
              </dd>
            </div>
          )}

          <div className="flex items-center justify-between text-stone-600">
            <dt>Delivery</dt>
            <dd className="font-semibold text-stone-900">
              {shipping === 0 ? (
                <span className="text-emerald-600 font-bold">FREE</span>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </dd>
          </div>

          <div className="flex items-center justify-between text-stone-600">
            <dt>Estimated Tax ({storeRates.taxRate}%)</dt>
            <dd className="font-semibold text-stone-900">
              ${tax.toLocaleString()}
            </dd>
          </div>

          <div className="flex items-center justify-between border-t border-stone-200 pt-4 text-base">
            <dt className="font-extrabold text-stone-900">Order Total</dt>
            <dd className="text-xl font-extrabold text-teal-800">
              ${grandTotal.toLocaleString()}
            </dd>
          </div>
        </dl>

        <div className="space-y-3">
          <Link
            href="/checkout"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-3.5 text-sm shadow-sm transition-all"
          >
            <FaLock className="w-3.5 h-3.5" />
            <span>Proceed to Checkout</span>
          </Link>
          <Link
            href="/shop"
            className="block text-center text-xs font-semibold text-stone-500 hover:text-teal-700 transition-colors"
          >
            ← Continue Shopping
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CartView;
