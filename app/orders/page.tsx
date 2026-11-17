"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";
import {
  FaCircleCheck,
  FaMagnifyingGlass,
  FaBoxOpen,
  FaTruckFast,
  FaClock,
  FaCircleXmark,
  FaPrint,
  FaBan,
} from "react-icons/fa6";

function statusStyle(status: string) {
  const s = (status || "processing").toLowerCase();
  if (s === "delivered")
    return {
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <FaCircleCheck className="w-3 h-3" />,
      label: "Delivered",
      step: 3,
    };
  if (s === "shipped")
    return {
      cls: "bg-sky-50 text-sky-700 border-sky-200",
      icon: <FaTruckFast className="w-3 h-3" />,
      label: "Shipped",
      step: 2,
    };
  if (s === "cancelled" || s === "canceled")
    return {
      cls: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <FaCircleXmark className="w-3 h-3" />,
      label: "Cancelled",
      step: 0,
    };
  return {
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <FaClock className="w-3 h-3" />,
    label: s === "pending" ? "Pending" : "Processing",
    step: 1,
  };
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const placedOrderId = searchParams.get("placed");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookupInput, setLookupInput] = useState("");
  const [searchedOnce, setSearchedOnce] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const loadInitial = async () => {
      if (placedOrderId) {
        setLoading(true);
        try {
          const res = await apiClient.get(
            `/api/orders/${encodeURIComponent(placedOrderId)}`
          );
          if (res.ok) {
            const single = await res.json();
            setOrders([single]);
            setSearchedOnce(true);
            setLoading(false);
            return;
          }
        } catch (_) {}
        setLoading(false);
      }

      if (session?.user?.email) {
        setLoading(true);
        try {
          const res = await apiClient.get(
            `/api/orders?email=${encodeURIComponent(session.user.email)}`
          );
          if (res.ok) {
            const data = await res.json();
            setOrders(data.orders || []);
            setSearchedOnce(true);
          }
        } catch (_) {
        } finally {
          setLoading(false);
        }
      }
    };
    loadInitial();
  }, [placedOrderId, session?.user?.email]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = lookupInput.trim();
    if (!q) {
      toast.error("Enter an Order ID or email address");
      return;
    }
    setLoading(true);
    setSearchedOnce(true);
    try {
      const res = await apiClient.get(
        `/api/orders?lookup=${encodeURIComponent(q)}`
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (_) {
      toast.error("Could not search orders right now");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (
      !confirm(
        "Cancel this order? Reserved inventory will be returned to stock immediately."
      )
    ) {
      return;
    }
    setCancellingId(orderId);
    try {
      const res = await apiClient.put(`/api/orders/${orderId}`, {
        status: "cancelled",
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" } : o
          )
        );
        toast.success("Order cancelled successfully");
      } else {
        toast.error("Unable to cancel order");
      }
    } catch {
      toast.error("Network error cancelling order");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Order Placed Confirmation Banner */}
      {placedOrderId && (
        <div className="no-print rounded-3xl bg-emerald-50 border border-emerald-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <FaCircleCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-emerald-950">
                Thank you! Your order is confirmed.
              </h2>
              <p className="text-sm text-emerald-800 mt-0.5">
                Order ID:{" "}
                <code className="font-mono font-bold bg-white/80 px-2 py-0.5 rounded">
                  #{placedOrderId}
                </code>
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Save your Order ID or print your receipt below for your records.
              </p>
            </div>
          </div>
          <Link
            href="/shop"
            className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 shrink-0 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Order Lookup Bar */}
      <div className="no-print bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm">
        <h2 className="text-base font-bold text-stone-900 mb-1">
          Track an Order
        </h2>
        <p className="text-xs text-stone-500 mb-4">
          Enter your Order ID (e.g.{" "}
          <code className="font-mono">ord-demo-1001</code>) or the email address
          used at checkout.
        </p>
        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FaMagnifyingGlass className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="Order ID or email address..."
              className="w-full rounded-xl border border-stone-200 pl-10 pr-4 py-2.5 text-sm text-stone-900 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-6 py-2.5 transition-colors"
          >
            {loading ? "Searching..." : "Track Order"}
          </button>
        </form>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-stone-500">
          Loading orders...
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-5">
          {orders.map((order) => {
            const badge = statusStyle(order.status);
            const canCancel =
              order.status === "processing" || order.status === "pending";

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden"
              >
                <div className="bg-canvas/70 px-6 py-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                    <div>
                      <p className="text-stone-400 font-medium">Order ID</p>
                      <p className="font-mono font-bold text-stone-900 mt-0.5">
                        #{order.id.slice(0, 14)}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-400 font-medium">Date Placed</p>
                      <p className="font-semibold text-stone-800 mt-0.5">
                        {order.dateTime
                          ? new Date(order.dateTime).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "Today"}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-400 font-medium">Ship To</p>
                      <p className="font-semibold text-stone-800 mt-0.5">
                        {order.name} {order.lastname} · {order.city},{" "}
                        {order.country}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-400 font-medium">Total</p>
                      <p className="font-extrabold text-stone-900 mt-0.5">
                        ${Number(order.total).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badge.cls}`}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Visual Fulfillment Step Progress */}
                {badge.step > 0 && (
                  <div className="px-6 pt-4 pb-2">
                    <div className="grid grid-cols-3 gap-2">
                      {["Order Confirmed", "In Transit", "Delivered"].map(
                        (label, i) => {
                          const reached = badge.step >= i + 1;
                          return (
                            <div key={label} className="space-y-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-colors ${
                                  reached ? "bg-teal-700" : "bg-stone-100"
                                }`}
                              />
                              <p
                                className={`text-[11px] font-semibold ${
                                  reached ? "text-teal-800" : "text-stone-400"
                                }`}
                              >
                                {label}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {order.products && order.products.length > 0 && (
                  <ul className="divide-y divide-stone-100 px-6 py-2">
                    {order.products.map((line) => (
                      <li
                        key={line.id}
                        className="py-3.5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-14 h-14 rounded-xl bg-canvas border border-stone-100 p-1.5 flex items-center justify-center shrink-0">
                            <Image
                              src={
                                line.product?.mainImage
                                  ? `/${line.product.mainImage}`
                                  : "/product_placeholder.jpg"
                              }
                              alt={line.product?.title || "Product"}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={
                                line.product?.slug
                                  ? `/product/${line.product.slug}`
                                  : "/shop"
                              }
                              className="text-sm font-bold text-stone-900 hover:text-teal-700 truncate block"
                            >
                              {line.product?.title || "Product"}
                            </Link>
                            <p className="text-xs text-stone-500">
                              Qty: {line.quantity}
                              {line.product?.price
                                ? ` · $${line.product.price.toLocaleString()} each`
                                : ""}
                            </p>
                          </div>
                        </div>
                        {line.product?.price && (
                          <span className="text-sm font-bold text-stone-900 shrink-0">
                            $
                            {(
                              line.product.price * line.quantity
                            ).toLocaleString()}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Order Footer Actions: Address + Print Receipt + Cancel */}
                <div className="px-6 py-3.5 bg-canvas/50 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-stone-500">
                    Delivery address: {order.adress}
                    {order.apartment ? `, ${order.apartment}` : ""},{" "}
                    {order.city} {order.postalCode}, {order.country}
                  </span>

                  <div className="no-print flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 px-3 py-1.5 font-semibold text-stone-700 transition-colors"
                    >
                      <FaPrint className="w-3 h-3 text-stone-500" />
                      <span>Print Receipt</span>
                    </button>

                    {canCancel && (
                      <button
                        type="button"
                        disabled={cancellingId === order.id}
                        onClick={() => handleCancelOrder(order.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 font-semibold disabled:opacity-50 transition-colors"
                      >
                        <FaBan className="w-3 h-3" />
                        <span>
                          {cancellingId === order.id
                            ? "Cancelling..."
                            : "Cancel Order"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : searchedOnce ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <FaBoxOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-stone-900">
            No matching orders found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Double-check your Order ID or email address, or start shopping to
            place your first order.
          </p>
          <Link
            href="/shop"
            className="inline-block mt-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-5 py-2.5 transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div className="bg-canvas min-h-[75vh] pb-20">
      <div className="no-print">
        <SectionTitle title="Orders & Tracking" path="Home | Orders" />
      </div>
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-stone-500">
            Loading orders...
          </div>
        }
      >
        <OrdersContent />
      </Suspense>
    </div>
  );
}
