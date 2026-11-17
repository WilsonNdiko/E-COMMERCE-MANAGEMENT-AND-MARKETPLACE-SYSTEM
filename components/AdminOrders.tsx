"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";
import { FaMagnifyingGlass, FaTrashCan, FaDownload } from "react-icons/fa6";

const STATUSES = ["all", "processing", "shipped", "delivered", "cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/orders?limit=100", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data?.orders || []);
      }
    } catch (_) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleQuickStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await apiClient.put(`/api/orders/${orderId}`, {
        status: newStatus,
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus as any } : o
          )
        );
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (_) {
      toast.error("Network error updating order");
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Delete this order permanently?")) return;
    try {
      const res = await apiClient.delete(`/api/orders/${orderId}`);
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        toast.success("Order deleted");
      } else {
        toast.error("Failed to delete order");
      }
    } catch (_) {
      toast.error("Network error deleting order");
    }
  };

  const filtered = orders.filter((o) => {
    const norm =
      o.status === "canceled" ? "cancelled" : (o.status || "processing").toLowerCase();
    if (statusFilter !== "all" && norm !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      `${o.name} ${o.lastname}`.toLowerCase().includes(q) ||
      o.email.toLowerCase().includes(q) ||
      o.country.toLowerCase().includes(q)
    );
  });

  const exportCsv = () => {
    const header = "order_id,customer,email,country,city,status,total,date";
    const rows = filtered.map((o) =>
      [
        o.id,
        `"${`${o.name} ${o.lastname}`.replace(/"/g, '""')}"`,
        o.email,
        `"${(o.country || "").replace(/"/g, '""')}"`,
        `"${(o.city || "").replace(/"/g, '""')}"`,
        o.status,
        o.total,
        o.dateTime || "",
      ].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "singitronic-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} order(s)`);
  };

  return (
    <div className="flex-1 min-w-0 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
            Orders
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            View customer orders, update fulfillment statuses, and export reports.
          </p>
        </div>
        {filtered.length > 0 && (
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-canvas px-4 py-2 text-xs font-bold text-stone-700 shadow-sm transition-colors"
          >
            <FaDownload className="w-3 h-3 text-teal-700" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === s
                  ? "bg-teal-700 text-white"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-canvas"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <FaMagnifyingGlass className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order, name, email..."
            className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-2 text-xs text-stone-900 focus:border-teal-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-100">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-stone-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-stone-500">
                    No orders match your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-canvas/60">
                    <td className="px-5 py-3.5 font-mono font-bold text-stone-900">
                      #{order.id.slice(0, 12)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-stone-900">
                        {order.name} {order.lastname}
                      </p>
                      <p className="text-stone-400">
                        {order.email} · {order.country}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={
                          order.status === "canceled"
                            ? "cancelled"
                            : order.status || "processing"
                        }
                        onChange={(e) =>
                          handleQuickStatus(order.id, e.target.value)
                        }
                        className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 capitalize focus:border-teal-600 focus:outline-none"
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-stone-900">
                      ${Number(order.total).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-stone-500">
                      {order.dateTime
                        ? new Date(order.dateTime).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="rounded-lg border border-stone-200 hover:bg-stone-100 px-3 py-1.5 font-semibold text-stone-700 transition-colors"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(order.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete order"
                        >
                          <FaTrashCan className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
