"use client";
import { DashboardSidebar } from "@/components";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { convertCategoryNameToURLFriendly } from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";

const DashboardNewCategoryPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = convertCategoryNameToURLFriendly(name.trim());
    if (!slug) {
      toast.error("Please enter a category name");
      return;
    }
    setSaving(true);
    try {
      const res = await apiClient.post("/api/categories", { name: slug });
      if (res.status === 201 || res.ok) {
        toast.success("Category created!");
        router.push("/admin/categories");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to create category");
      }
    } catch (_) {
      toast.error("Network error creating category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />
        <div className="flex-1 max-w-xl space-y-5">
          <div>
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline mb-1"
            >
              <FaArrowLeft className="w-3 h-3" />
              <span>Back to Categories</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Add New Category
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gaming Monitors"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              />
              {name.trim() && (
                <p className="text-[11px] text-slate-500 mt-1.5">
                  URL preview:{" "}
                  <code className="font-mono text-slate-700">
                    /shop/{convertCategoryNameToURLFriendly(name.trim())}
                  </code>
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 text-sm"
            >
              {saving ? "Creating..." : "Create Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardNewCategoryPage;
