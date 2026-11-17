"use client";
import DashboardSidebar from "@/components/DashboardSidebar";
import apiClient from "@/lib/api";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa6";

const DashboardCreateNewProduct = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [saving, setSaving] = useState(false);

  const [product, setProduct] = useState({
    merchantId: "",
    title: "",
    price: 99,
    manufacturer: "",
    inStock: 10,
    mainImage: "",
    description: "",
    slug: "",
    categoryId: "",
  });

  useEffect(() => {
    Promise.all([
      apiClient.get("/api/categories").then((r) => (r.ok ? r.json() : [])),
      apiClient.get("/api/merchants").then((r) => (r.ok ? r.json() : [])),
    ]).then(([cats, mers]) => {
      const catList = Array.isArray(cats) ? cats : [];
      const merList = Array.isArray(mers) ? mers : [];
      setCategories(catList);
      setMerchants(merList);
      setProduct((prev) => ({
        ...prev,
        categoryId: catList[0]?.id || "",
        merchantId: merList[0]?.id || "",
      }));
    });
  }, []);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);
    try {
      const res = await apiClient.post("/api/main-image", formData);
      const data = await res.json();
      if (res.ok) {
        setProduct((prev) => ({
          ...prev,
          mainImage: data.filename || file.name,
        }));
        toast.success("Image uploaded");
      } else {
        toast.error(data.message || "Image upload failed");
      }
    } catch (_) {
      toast.error("Network error uploading image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.title.trim() || !product.manufacturer.trim()) {
      toast.error("Please fill in title and manufacturer");
      return;
    }
    const slug = convertSlugToURLFriendly(
      product.slug.trim() || product.title.trim()
    );

    setSaving(true);
    try {
      const res = await apiClient.post("/api/products", {
        ...product,
        slug,
        price: Number(product.price),
        inStock: Number(product.inStock),
        mainImage: product.mainImage || "product_placeholder.jpg",
      });
      if (res.ok) {
        toast.success("Product created successfully!");
        router.push("/admin/products");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || err.message || "Could not create product");
      }
    } catch (_) {
      toast.error("Network error creating product");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10";

  return (
    <div className="bg-canvas min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 max-w-3xl space-y-5">
          <div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline mb-1"
            >
              <FaArrowLeft className="w-3 h-3" />
              <span>Back to Products</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-stone-900">
              Add New Product
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-sm space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={product.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setProduct((prev) => ({
                      ...prev,
                      title,
                      slug: convertSlugToURLFriendly(title),
                    }));
                  }}
                  placeholder="ProBook Ultra 14 Laptop"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={product.slug}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      slug: convertSlugToURLFriendly(e.target.value),
                    })
                  }
                  placeholder="probook-ultra-14-laptop"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Manufacturer / Brand *
                </label>
                <input
                  type="text"
                  required
                  value={product.manufacturer}
                  onChange={(e) =>
                    setProduct({ ...product, manufacturer: e.target.value })
                  }
                  placeholder="Samsung, Sony, HP..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={product.price}
                  onChange={(e) =>
                    setProduct({ ...product, price: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={product.inStock}
                  onChange={(e) =>
                    setProduct({ ...product, inStock: Number(e.target.value) })
                  }
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Category *
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
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Merchant *
                </label>
                <select
                  value={product.merchantId}
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
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f);
                    }}
                    className="block w-full max-w-sm text-xs text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-teal-800 hover:file:bg-teal-100"
                  />
                  {product.mainImage && (
                    <Image
                      src={`/${product.mainImage}`}
                      alt="Preview"
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-xl border border-stone-200 object-contain p-1 bg-canvas"
                    />
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={product.description}
                  onChange={(e) =>
                    setProduct({ ...product, description: e.target.value })
                  }
                  placeholder="Key features, hardware specs, and what's in the box..."
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold px-6 py-2.5 text-sm"
              >
                {saving ? "Creating..." : "Publish Product"}
              </button>
              <Link
                href="/admin/products"
                className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm font-semibold text-stone-600 hover:bg-canvas"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardCreateNewProduct;
