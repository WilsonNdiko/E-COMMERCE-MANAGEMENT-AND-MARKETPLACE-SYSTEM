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
    <div className="bg-slate-50 min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Merchants
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified marketplace partners and product suppliers.
              </p>
            </div>
            <Link
              href="/admin/merchant/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm"
            >
              <FaPlus className="w-3 h-3" />
              <span>Add Merchant</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Merchant</th>
                    <th className="px-6 py-3.5">Contact</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Products</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        Loading merchants...
                      </td>
                    </tr>
                  ) : merchants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        No merchants found.
                      </td>
                    </tr>
                  ) : (
                    merchants.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-3.5">
                          <p className="font-bold text-slate-900">{m.name}</p>
                          <p className="text-slate-400">{m.address || "—"}</p>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="text-slate-700">{m.email || "—"}</p>
                          <p className="text-slate-400">{m.phone || ""}</p>
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-bold ${
                              m.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-slate-700">
                          {m.products?.length ?? 0}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            href={`/admin/merchant/${m.id}`}
                            className="rounded-lg border border-slate-200 hover:bg-slate-100 px-3 py-1.5 font-semibold text-slate-700"
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
