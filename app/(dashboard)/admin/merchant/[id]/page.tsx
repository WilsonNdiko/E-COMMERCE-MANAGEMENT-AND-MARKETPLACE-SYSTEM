"use client";
import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaTrashCan } from "react-icons/fa6";

export default function MerchantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    status: "ACTIVE",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    apiClient
      .get(`/api/merchants/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setMerchant(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          description: data.description || "",
          status: data.status || "ACTIVE",
        });
      })
      .catch(() => toast.error("Failed to load merchant"));
  }, [params?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.put(`/api/merchants/${params.id}`, formData);
      if (res.ok) toast.success("Merchant updated!");
      else toast.error("Failed to update merchant");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (merchant?.products && merchant.products.length > 0) {
      toast.error(
        "Reassign or remove this merchant's products before deleting"
      );
      return;
    }
    if (!confirm("Delete this merchant?")) return;
    const res = await apiClient.delete(`/api/merchants/${params.id}`);
    if (res.ok) {
      toast.success("Merchant deleted");
      router.push("/admin/merchant");
    } else {
      toast.error("Failed to delete merchant");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="bg-slate-50 min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />
        <div className="flex-1 max-w-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/merchant"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline mb-1"
              >
                <FaArrowLeft className="w-3 h-3" />
                <span>Back to Merchants</span>
              </Link>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Edit Merchant
              </h1>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 text-xs font-bold"
            >
              <FaTrashCan className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merchant Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 text-sm"
            >
              {saving ? "Saving..." : "Save Merchant"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
