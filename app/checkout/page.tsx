"use client";
import { SectionTitle } from "@/components";
import { useProductStore } from "../_zustand/store";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import {
  FaLock,
  FaCreditCard,
  FaMoneyBillWave,
  FaShieldHalved,
  FaArrowLeft,
  FaTag,
} from "react-icons/fa6";

const CheckoutPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    products,
    total,
    promoCode,
    discountPercent,
    freeShipping,
    applyPromoCode,
    clearCart,
  } = useProductStore();

  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("cod");
  const [promoInput, setPromoInput] = useState("");
  const [cardData, setCardData] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    lastname: "",
    phone: "",
    email: "",
    company: "",
    adress: "",
    apartment: "",
    city: "",
    country: "",
    postalCode: "",
    orderNotice: "",
  });

  const [storeRates, setStoreRates] = useState({
    shippingFee: 10,
    freeThreshold: 150,
    taxRate: 8,
  });

  useEffect(() => {
    setMounted(true);
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
  }, []);

  useEffect(() => {
    const email = session?.user?.email;
    if (email && !checkoutForm.email) {
      setCheckoutForm((prev) => ({
        ...prev,
        email,
      }));
    }
  }, [session?.user?.email, checkoutForm.email]);

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
  const grandTotal = Math.max(1, discountedSubtotal + shipping + tax);

  const validateForm = (): string | null => {
    if (checkoutForm.name.trim().length < 2)
      return "First name must be at least 2 characters";
    if (checkoutForm.lastname.trim().length < 2)
      return "Last name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email.trim()))
      return "Please enter a valid email address";
    if (checkoutForm.phone.replace(/[^0-9]/g, "").length < 8)
      return "Please enter a valid phone number (at least 8 digits)";
    if (checkoutForm.adress.trim().length < 3)
      return "Street address must be at least 3 characters";
    if (checkoutForm.city.trim().length < 2)
      return "Please enter your city";
    if (checkoutForm.country.trim().length < 2)
      return "Please enter your country";
    if (checkoutForm.postalCode.trim().length < 3)
      return "Please enter a valid postal code";

    if (paymentMethod === "card") {
      if (cardData.cardName.trim().length < 2)
        return "Please enter the cardholder name";
      const digits = cardData.cardNumber.replace(/\D/g, "");
      if (digits.length < 13 || digits.length > 19)
        return "Please enter a valid 16-digit card number";
      if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(cardData.expiry.trim()))
        return "Please enter card expiry in MM/YY format";
      if (!/^\d{3,4}$/.test(cardData.cvc.trim()))
        return "Please enter a valid 3 or 4 digit CVC";
    }
    return null;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const err = validateForm();
    if (err) {
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      let userId: string | null = null;
      if (session?.user?.email) {
        try {
          const uRes = await apiClient.get(
            `/api/users/email/${encodeURIComponent(session.user.email)}`
          );
          if (uRes.ok) {
            const u = await uRes.json();
            userId = u?.id || null;
          }
        } catch (_) {}
      }

      const phoneFormatted =
        checkoutForm.phone.replace(/[^0-9]/g, "").length >= 10
          ? checkoutForm.phone.trim()
          : checkoutForm.phone.trim().padEnd(10, "0");

      const noteSegments = [
        checkoutForm.orderNotice.trim(),
        promoCode ? `Promo: ${promoCode}` : "",
        `Payment: ${paymentMethod === "card" ? "Card" : "Pay on Delivery"}`,
      ].filter(Boolean);

      const orderRes = await apiClient.post("/api/orders", {
        name: checkoutForm.name.trim(),
        lastname: checkoutForm.lastname.trim(),
        phone: phoneFormatted,
        email: checkoutForm.email.trim().toLowerCase(),
        company: checkoutForm.company.trim(),
        adress: checkoutForm.adress.trim(),
        apartment: checkoutForm.apartment.trim(),
        postalCode: checkoutForm.postalCode.trim(),
        status: "processing",
        total: grandTotal,
        city: checkoutForm.city.trim(),
        country: checkoutForm.country.trim(),
        orderNotice: noteSegments.join(" | "),
        userId,
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData?.id) {
        const msg =
          orderData?.details?.[0]?.message ||
          orderData?.error ||
          "Could not place order. Please review your details.";
        toast.error(msg);
        setIsSubmitting(false);
        return;
      }

      // Attach ordered products
      await Promise.all(
        items.map((item) =>
          apiClient.post("/api/order-product", {
            customerOrderId: orderData.id,
            productId: item.id,
            quantity: item.amount,
          })
        )
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("orderCompleted"));
      }

      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/orders?placed=${encodeURIComponent(orderData.id)}`);
    } catch (_) {
      toast.error("Network error placing your order. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (mounted && items.length === 0) {
    return (
      <div className="bg-canvas min-h-[70vh] pb-16">
        <SectionTitle title="Checkout" path="Home | Cart | Checkout" />
        <div className="max-w-xl mx-auto px-4 pt-12">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center space-y-4">
            <h2 className="text-xl font-bold text-stone-900">
              No items to check out
            </h2>
            <p className="text-sm text-stone-500">
              Add products to your cart first, then return here to complete your
              order.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-3 text-sm"
            >
              Browse Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10";

  return (
    <div className="bg-canvas min-h-screen pb-20">
      <SectionTitle title="Secure Checkout" path="Home | Cart | Checkout" />

      <form
        onSubmit={handlePlaceOrder}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left: Shipping + Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact & Recipient */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-stone-900">
                1. Contact Information
              </h2>
              <Link
                href="/cart"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                <FaArrowLeft className="w-3 h-3" />
                <span>Edit cart</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.name}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, name: e.target.value })
                  }
                  placeholder="Alex"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.lastname}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      lastname: e.target.value,
                    })
                  }
                  placeholder="Morgan"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={checkoutForm.email}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, email: e.target.value })
                  }
                  placeholder="alex@example.com"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={checkoutForm.phone}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, phone: e.target.value })
                  }
                  placeholder="+1 415 555 0192"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-lg font-extrabold text-stone-900">
              2. Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.adress}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, adress: e.target.value })
                  }
                  placeholder="742 Innovation Drive"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Apartment / Suite (optional)
                </label>
                <input
                  type="text"
                  value={checkoutForm.apartment}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      apartment: e.target.value,
                    })
                  }
                  placeholder="Apt 4B"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Company (optional)
                </label>
                <input
                  type="text"
                  value={checkoutForm.company}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      company: e.target.value,
                    })
                  }
                  placeholder="Acme Corp"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.city}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, city: e.target.value })
                  }
                  placeholder="Austin"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Postal / ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.postalCode}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      postalCode: e.target.value,
                    })
                  }
                  placeholder="78701"
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={checkoutForm.country}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      country: e.target.value,
                    })
                  }
                  placeholder="United States"
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Delivery Instructions (optional)
                </label>
                <textarea
                  rows={2}
                  value={checkoutForm.orderNotice}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      orderNotice: e.target.value,
                    })
                  }
                  placeholder="Gate code, drop-off preference, etc."
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="text-lg font-extrabold text-stone-900">
              3. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                  paymentMethod === "cod"
                    ? "border-teal-700 bg-teal-50/50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <FaMoneyBillWave className="w-5 h-5 text-teal-700 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-stone-900">
                    Pay on Delivery
                  </p>
                  <p className="text-xs text-stone-500">
                    Cash or card upon courier arrival
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                  paymentMethod === "card"
                    ? "border-teal-700 bg-teal-50/50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <FaCreditCard className="w-5 h-5 text-teal-700 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-stone-900">
                    Credit / Debit Card
                  </p>
                  <p className="text-xs text-stone-500">
                    Visa, Mastercard, Amex
                  </p>
                </div>
              </button>
            </div>

            {paymentMethod === "card" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    Name on Card *
                  </label>
                  <input
                    type="text"
                    value={cardData.cardName}
                    onChange={(e) =>
                      setCardData({ ...cardData, cardName: e.target.value })
                    }
                    placeholder="Alex Morgan"
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    value={cardData.cardNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                      const grouped = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
                      setCardData({ ...cardData, cardNumber: grouped });
                    }}
                    placeholder="4532 1234 5678 9010"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    Expiry (MM/YY) *
                  </label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                      const formatted =
                        d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
                      setCardData({ ...cardData, expiry: formatted });
                    }}
                    placeholder="08/29"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1.5">
                    CVC *
                  </label>
                  <input
                    type="text"
                    value={cardData.cvc}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    placeholder="123"
                    className={inputCls}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <aside className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-6 sticky top-32">
          <h2 className="text-lg font-extrabold text-stone-900">
            Order Review
          </h2>

          <ul className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <li key={item.id} className="py-3 flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-canvas border border-stone-100 p-1.5 flex items-center justify-center shrink-0">
                  <Image
                    src={
                      item.image
                        ? `/${item.image}`
                        : "/product_placeholder.jpg"
                    }
                    alt={item.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-stone-500">
                    Qty {item.amount} × ${item.price.toLocaleString()}
                  </p>
                </div>
                <span className="text-sm font-bold text-stone-900 shrink-0">
                  ${(item.price * item.amount).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>

          {/* Optional Promo */}
          {!promoCode ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Promo code (SAVE10)"
                className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-teal-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const res = applyPromoCode(promoInput);
                  if (res.ok) {
                    toast.success(res.message);
                    setPromoInput("");
                  } else toast.error(res.message);
                }}
                className="rounded-xl bg-stone-100 hover:bg-stone-200 px-3.5 py-2 text-xs font-bold text-stone-700"
              >
                Apply
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <FaTag />
              <span>Promo {promoCode} active</span>
            </div>
          )}

          <dl className="space-y-2.5 text-sm border-t border-stone-100 pt-4">
            <div className="flex justify-between text-stone-600">
              <dt>Subtotal</dt>
              <dd className="font-semibold text-stone-900">
                ${subtotal.toLocaleString()}
              </dd>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Discount ({discountPercent}%)</dt>
                <dd className="font-semibold">
                  −${discountAmount.toLocaleString()}
                </dd>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <dt>Shipping</dt>
              <dd className="font-semibold text-stone-900">
                {shipping === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  `$${shipping}`
                )}
              </dd>
            </div>
            <div className="flex justify-between text-stone-600">
              <dt>Estimated Tax (8%)</dt>
              <dd className="font-semibold text-stone-900">
                ${tax.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-3 text-base">
              <dt className="font-extrabold text-stone-900">Total</dt>
              <dd className="text-xl font-extrabold text-teal-700">
                ${grandTotal.toLocaleString()}
              </dd>
            </div>
          </dl>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold px-6 py-4 text-sm shadow-lg shadow-teal-700/20 transition-all"
          >
            <FaLock className="w-3.5 h-3.5" />
            <span>
              {isSubmitting
                ? "Processing Order..."
                : `Place Order · $${grandTotal.toLocaleString()}`}
            </span>
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-stone-500">
            <FaShieldHalved className="text-emerald-600" />
            <span>256-bit SSL encrypted · 30-day money-back guarantee</span>
          </p>
        </aside>
      </form>
    </div>
  );
};

export default CheckoutPage;
