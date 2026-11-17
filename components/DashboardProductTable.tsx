"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { sanitize } from "@/lib/sanitize";
import toast from "react-hot-toast";
import { FaPlus, FaMagnifyingGlass, FaTrashCan } from "react-icons/fa6";

const DashboardProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/products?mode=admin", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (_) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter((p) => {
    if (stockFilter === "in" && p.inStock <= 0) return false;
    if (stockFilter === "out" && p.inStock > 0) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q) ||
      (p.category?.name || "").toLowerCase().includes(q)
    );
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((p) => p.id));
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (
      selectedIds.length === 0 ||
      !confirm(`Delete ${selectedIds.length} selected product(s)?`)
    )
      return;
    let deleted = 0;
    let blocked = 0;
    for (const id of selectedIds) {
      const res = await apiClient.delete(`/api/products/${id}`);
      if (res.ok) deleted += 1;
      else blocked += 1;
    }
    if (deleted > 0) toast.success(`Deleted ${deleted} product(s)`);
    if (blocked > 0)
      toast.error(`${blocked} product(s) kept (referenced in orders)`);
    setSelectedIds([]);
    loadProducts();
  };

  return (
    <div className="flex-1 min-w-0 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
            Products
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage catalog listings, pricing, images, and inventory counts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-3.5 py-2 text-xs font-bold"
            >
              <FaTrashCan className="w-3 h-3" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition-colors"
          >
            <FaPlus className="w-3 h-3" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {(
            [
              ["all", "All"],
              ["in", "In Stock"],
              ["out", "Out of Stock"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setStockFilter(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                stockFilter === val
                  ? "bg-teal-700 text-white"
                  : "bg-white border border-stone-200 text-stone-600 hover:bg-canvas"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <FaMagnifyingGlass className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or brands..."
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
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      selectedIds.length === filtered.length
                    }
                    onChange={toggleSelectAll}
                    className="checkbox checkbox-xs rounded"
                  />
                </th>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Inventory</th>
                <th className="px-4 py-3.5">Price</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-500">
                    Loading catalog...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-500">
                    No products match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-canvas/70">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleOne(product.id)}
                        className="checkbox checkbox-xs rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-canvas border border-stone-100 p-1 flex items-center justify-center shrink-0">
                          <Image
                            width={40}
                            height={40}
                            src={
                              product.mainImage
                                ? `/${product.mainImage}`
                                : "/product_placeholder.jpg"
                            }
                            alt={sanitize(product.title)}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">
                            {sanitize(product.title)}
                          </p>
                          <p className="text-stone-400">
                            {sanitize(product.manufacturer)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-stone-600">
                      {product.category?.name?.replace(/-/g, " ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {product.inStock > 0 ? (
                        <span className="inline-flex rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 font-bold">
                          {product.inStock} in stock
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-rose-50 text-rose-700 px-2.5 py-0.5 font-bold">
                          Out of stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-stone-900">
                      ${Number(product.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          className="text-stone-400 hover:text-teal-700 font-semibold"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="rounded-lg border border-stone-200 hover:bg-stone-100 px-3 py-1.5 font-semibold text-stone-700 transition-colors"
                        >
                          Edit
                        </Link>
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

export default DashboardProductTable;
