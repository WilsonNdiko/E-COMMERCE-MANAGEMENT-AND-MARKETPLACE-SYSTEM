"use client";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import { convertCategoryNameToURLFriendly } from "@/utils/categoryFormating";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft, FaTrashCan } from "react-icons/fa6";

const DashboardProductDetails = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    Promise.all([
      apiClient.get(`/api/products/${params.id}`).then((r) => r.json()),
      apiClient.get("/api/categories").then((r) => r.json()),
      apiClient.get("/api/merchants").then((r) => r.json()),
    ])
      .then(([prod, cats, mers]) => {
        setProduct(prod);
        setCategories(Array.isArray(cats) ? cats : []);
        setMerchants(Array.isArray(mers) ? mers : []);
      })
      .catch(() => toast.error("Failed to load product"));
  }, [params?.id]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);
    try {
      const res = await apiClient.post("/api/main-image", formData);
      const data = await res.json();
      if (res.ok && product) {
        setProduct({ ...product, mainImage: data.filename || file.name });
        toast.success("Image uploaded");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (_) {
      toast.error("Upload failed");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    try {
      const res = await apiClient.put(`/api/products/${product.id}`, {
        merchantId: product.merchantId || merchants[0]?.id || "1",
        title: product.title,
        slug: convertCategoryNameToURLFriendly(product.slug || product.title),
        price: Number(product.price),
        rating: Number(product.rating),
        manufacturer: product.manufacturer,
        categoryId: product.categoryId,
        inStock: Number(product.inStock),
        mainImage: product.mainImage,
        description: product.description,
      });
      if (res.ok) {
        toast.success("Product saved!");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || err.message || "Failed to update product");
      }
    } catch (_) {
      toast.error("Network error updating product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !confirm(`Delete "${product.title}"?`)) return;
    const res = await apiClient.delete(`/api/products/${product.id}`);
    if (res.status === 204 || res.ok) {
      toast.success("Product deleted");
      router.push("/admin/products");
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(
        err.error ||
          err.message ||
          "Cannot delete product referenced in customer orders"
      );
    }
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="bg-slate-50 min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 max-w-3xl space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline mb-1"
              >
                <FaArrowLeft className="w-3 h-3" />
                <span>Back to Products</span>
              </Link>
              <h1 className="text-2xl font-extrabold text-slate-900">
                Edit Product
              </h1>
            </div>
            {product && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 text-xs font-bold"
              >
                <FaTrashCan className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {!product ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
              Loading product...
            </div>
          ) : (
            <form
              onSubmit={handleUpdate}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={product.title}
                    onChange={(e) =>
                      setProduct({ ...product, title: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={product.slug}
                    onChange={(e) =>
                      setProduct({ ...product, slug: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    required
                    value={product.manufacturer}
                    onChange={(e) =>
                      setProduct({ ...product, manufacturer: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={product.price}
                    onChange={(e) =>
                      setProduct({ ...product, price: Number(e.target.value) })
                    }
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stock Quantity (0 = Out of Stock)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={product.inStock}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        inStock: Number(e.target.value),
                      })
                    }
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={product.categoryId}
                    onChange={(e) =>
                      setProduct({ ...product, categoryId: e.target.value })
                    }
                    className={`${inputCls} capitalize`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name.replace(/-/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Merchant
                  </label>
                  <select
                    value={product.merchantId || ""}
                    onChange={(e) =>
                      setProduct({ ...product, merchantId: e.target.value })
                    }
                    className={inputCls}
                  >
                    {merchants.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Main Image
                  </label>
                  <div className="flex items-center gap-4">
                    <Image
                      src={
                        product.mainImage
                          ? `/${product.mainImage}`
                          : "/product_placeholder.jpg"
                      }
                      alt={product.title}
                      width={72}
                      height={72}
                      className="w-18 h-18 rounded-xl border border-slate-200 bg-slate-50 object-contain p-1.5"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(f);
                      }}
                      className="file-input file-input-bordered file-input-sm rounded-xl w-full max-w-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={product.description}
                    onChange={(e) =>
                      setProduct({ ...product, description: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 text-sm"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <Link
                  href={`/product/${product.slug}`}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  View in Store →
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardProductDetails;
