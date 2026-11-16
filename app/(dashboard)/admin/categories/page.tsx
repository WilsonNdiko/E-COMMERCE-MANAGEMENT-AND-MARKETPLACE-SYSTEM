"use client";
import { DashboardSidebar } from "@/components";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { formatCategoryName } from "../../../../utils/categoryFormating";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";
import { FaPlus, FaMagnifyingGlass, FaTrashCan } from "react-icons/fa6";

const DashboardCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/categories", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (_) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete category "${formatCategoryName(cat.name)}"?`)) return;
    const res = await apiClient.delete(`/api/categories/${cat.id}`);
    if (res.status === 204 || res.ok) {
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } else {
      toast.error("Cannot delete a category that still has products");
    }
  };

  const filtered = categories.filter((c) =>
    formatCategoryName(c.name).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Categories
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Organize products into browsable storefront collections.
              </p>
            </div>
            <Link
              href="/admin/categories/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm"
            >
              <FaPlus className="w-3 h-3" />
              <span>Add Category</span>
            </Link>
          </div>

          <div className="relative max-w-xs">
            <FaMagnifyingGlass className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter categories..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Category Name</th>
                    <th className="px-6 py-3.5">URL Slug</th>
                    <th className="px-6 py-3.5">Products</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-500">
                        Loading categories...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-500">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          {formatCategoryName(c.name)}
                        </td>
                        <td className="px-6 py-3.5 font-mono text-slate-500">
                          /shop/{c.name}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-700">
                            {c._count?.products ?? 0}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <Link
                              href={`/admin/categories/${c.id}`}
                              className="rounded-lg border border-slate-200 hover:bg-slate-100 px-3 py-1.5 font-semibold text-slate-700"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(c)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete category"
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
      </div>
    </div>
  );
};

export default DashboardCategory;
