"use client";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FaDollarSign,
  FaBagShopping,
  FaBoxArchive,
  FaUsers,
  FaPlus,
  FaTriangleExclamation,
  FaArrowRight,
  FaRotate,
} from "react-icons/fa6";

interface AdminStats {
  kpis: {
    totalRevenue: number;
    avgOrderValue: number;
    totalOrders: number;
    totalProducts: number;
    inStockCount: number;
    outOfStockCount: number;
    totalUsers: number;
    totalCategories: number;
    activeMerchants: number;
    totalReviews: number;
    newsletterSubscribers: number;
    unreadMessages: number;
  };
  ordersByStatus: Record<string, number>;
  recentOrders: Order[];
  lowStockProducts: Product[];
  topCategories: { id: string; name: string; count: number }[];
}

const badgeCls = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s === "delivered") return "bg-emerald-50 text-emerald-700";
  if (s === "shipped") return "bg-sky-50 text-sky-700";
  if (s === "cancelled" || s === "canceled") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/admin/stats", {
        cache: "no-store",
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const kpis = stats?.kpis;

  return (
    <div className="bg-slate-50 min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 space-y-6">
          {/* Top Header & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Store Overview
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time revenue, order fulfillment, and catalog inventory metrics.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadStats}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors"
              >
                <FaRotate className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors"
              >
                <FaPlus className="w-3 h-3" />
                <span>Add Product</span>
              </Link>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Total Revenue
                </span>
                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FaDollarSign className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                ${(kpis?.totalRevenue ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Avg. order ${(kpis?.avgOrderValue ?? 0).toLocaleString()}
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 p-5 shadow-sm transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Total Orders
                </span>
                <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FaBagShopping className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {kpis?.totalOrders ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {stats?.ordersByStatus?.processing ?? 0} awaiting shipment
              </p>
            </Link>

            <Link
              href="/admin/products"
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 p-5 shadow-sm transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Catalog Products
                </span>
                <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FaBoxArchive className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {kpis?.totalProducts ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {kpis?.inStockCount ?? 0} in stock · {kpis?.outOfStockCount ?? 0}{" "}
                out
              </p>
            </Link>

            <Link
              href="/admin/users"
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 p-5 shadow-sm transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Customers &amp; Activity
                </span>
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FaUsers className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mt-3">
                {kpis?.totalUsers ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {kpis?.totalReviews ?? 0} reviews ·{" "}
                {kpis?.unreadMessages ?? 0} new messages
              </p>
            </Link>
          </div>

          {/* Order Pipeline + Inventory Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Fulfillment Status Breakdown */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900">
                Order Fulfillment Pipeline
              </h2>
              <div className="space-y-3">
                {[
                  {
                    key: "processing",
                    label: "Processing",
                    bar: "bg-amber-400",
                  },
                  { key: "shipped", label: "Shipped", bar: "bg-sky-500" },
                  {
                    key: "delivered",
                    label: "Delivered",
                    bar: "bg-emerald-500",
                  },
                  {
                    key: "cancelled",
                    label: "Cancelled",
                    bar: "bg-rose-400",
                  },
                ].map((s) => {
                  const count = stats?.ordersByStatus?.[s.key] ?? 0;
                  const total = Math.max(1, kpis?.totalOrders ?? 1);
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={s.key} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          {s.label}
                        </span>
                        <span className="text-slate-500">
                          {count} ({kpis?.totalOrders ? pct : 0}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.bar} transition-all`}
                          style={{
                            width: `${kpis?.totalOrders ? pct : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="font-extrabold text-slate-900">
                    {kpis?.totalCategories ?? 0}
                  </p>
                  <p className="text-slate-500">Categories</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="font-extrabold text-slate-900">
                    {kpis?.activeMerchants ?? 0}
                  </p>
                  <p className="text-slate-500">Merchants</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="font-extrabold text-slate-900">
                    {kpis?.newsletterSubscribers ?? 0}
                  </p>
                  <p className="text-slate-500">Subscribers</p>
                </div>
              </div>
            </div>

            {/* Low / Out of Stock Watchlist */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaTriangleExclamation className="text-amber-500 w-4 h-4" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Low &amp; Out-of-Stock Watchlist
                  </h2>
                </div>
                <Link
                  href="/admin/products"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  All inventory →
                </Link>
              </div>

              {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {stats.lowStockProducts.map((p) => (
                    <li
                      key={p.id}
                      className="py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                          <Image
                            src={
                              p.mainImage
                                ? `/${p.mainImage}`
                                : "/product_placeholder.jpg"
                            }
                            alt={p.title}
                            width={36}
                            height={36}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {p.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            ${p.price} · {p.manufacturer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            p.inStock <= 0
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {p.inStock <= 0 ? "Out of stock" : `${p.inStock} left`}
                        </span>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">
                  All products are well stocked!
                </p>
              )}
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <span>View all orders</span>
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                          #{o.id.slice(0, 12)}
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-slate-900">
                            {o.name} {o.lastname}
                          </p>
                          <p className="text-slate-400">
                            {o.city}, {o.country}
                          </p>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 font-bold capitalize ${badgeCls(
                              o.status
                            )}`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          ${Number(o.total).toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">
                          {o.dateTime
                            ? new Date(o.dateTime).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            Manage →
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        {loading ? "Loading orders..." : "No orders yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
