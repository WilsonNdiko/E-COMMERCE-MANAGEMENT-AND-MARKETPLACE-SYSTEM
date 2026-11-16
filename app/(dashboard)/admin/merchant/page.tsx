"use client";
import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";

export default function MerchantPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/api/merchants", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setMerchants(Array.isArray(d) ? d : []))
      .catch(() => toast.error("Failed to load merchants"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-canvas min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900">
                Merchants
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Verified marketplace partners and product suppliers.
              </p>
            </div>
            <Link
              href="/admin/merchant/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 text-xs font-bold shadow-sm"
            >
              <FaPlus className="w-3 h-3" />
              <span>Add Merchant</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-100">
                  <tr>
                    <th className="px-6 py-3.5">Merchant</th>
                    <th className="px-6 py-3.5">Contact</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Products</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-stone-500">
                        Loading merchants...
                      </td>
                    </tr>
                  ) : merchants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-stone-500">
                        No merchants found.
                      </td>
                    </tr>
                  ) : (
                    merchants.map((m) => (
                      <tr key={m.id} className="hover:bg-canvas/70">
                        <td className="px-6 py-3.5">
                          <p className="font-bold text-stone-900">{m.name}</p>
                          <p className="text-stone-400">{m.address || "—"}</p>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="text-stone-700">{m.email || "—"}</p>
                          <p className="text-stone-400">{m.phone || ""}</p>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-bold ${
                              m.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-stone-700">
                          {m.products?.length ?? 0}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            href={`/admin/merchant/${m.id}`}
                            className="rounded-lg border border-stone-200 hover:bg-stone-100 px-3 py-1.5 font-semibold text-stone-700"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
