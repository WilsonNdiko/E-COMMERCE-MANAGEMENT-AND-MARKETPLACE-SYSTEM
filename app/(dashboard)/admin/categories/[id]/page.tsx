"use client";
import { DashboardSidebar } from "@/components";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  convertCategoryNameToURLFriendly,
  formatCategoryName,
} from "../../../../../utils/categoryFormating";
import apiClient from "@/lib/api";
import { FaArrowLeft, FaTrashCan } from "react-icons/fa6";

const DashboardSingleCategory = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    apiClient
      .get(`/api/categories/${params.id}`)
      .then((r) => r.json())
      .then((d) => setName(formatCategoryName(d?.name || "")))
      .catch(() => toast.error("Failed to load category"));
  }, [params?.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await apiClient.put(`/api/categories/${params.id}`, {
        name: convertCategoryNameToURLFriendly(name.trim()),
      });
      if (res.ok) {
        toast.success("Category updated!");
      } else {
        toast.error("Error updating category");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this category?")) return;
    const res = await apiClient.delete(`/api/categories/${params.id}`);
    if (res.status === 204 || res.ok) {
      toast.success("Category deleted");
      router.push("/admin/categories");
    } else {
      toast.error("Cannot delete a category that still has products");
    }
  };

  return (
    <div className="bg-canvas min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />
        <div className="flex-1 max-w-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/categories"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline mb-1"
              >
                <FaArrowLeft className="w-3 h-3" />
                <span>Back to Categories</span>
              </Link>
              <h1 className="text-2xl font-extrabold text-stone-900">
                Edit Category
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
            onSubmit={handleUpdate}
            className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold px-6 py-2.5 text-sm"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardSingleCategory;
