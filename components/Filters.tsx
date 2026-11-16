"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FaStar, FaRotateLeft } from "react-icons/fa6";
import apiClient from "@/lib/api";

const MAX_PRICE = 2000;

const Filters = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);

  const inStock = searchParams.get("inStock") !== "false";
  const outOfStock = searchParams.get("outOfStock") !== "false";
  const urlPrice = Number(searchParams.get("price") || MAX_PRICE);
  const minRating = Number(searchParams.get("rating") || 0);
  const [priceDraft, setPriceDraft] = useState<number>(
    Number.isNaN(urlPrice) ? MAX_PRICE : Math.min(MAX_PRICE, urlPrice)
  );

  useEffect(() => {
    const next = Number(searchParams.get("price") || MAX_PRICE);
    setPriceDraft(Number.isNaN(next) ? MAX_PRICE : Math.min(MAX_PRICE, next));
  }, [searchParams]);

  useEffect(() => {
    apiClient
      .get("/api/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    params.set("page", "1");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const resetAll = () => {
    setPriceDraft(MAX_PRICE);
    router.push("/shop");
  };

  const activeCategorySlug = pathname.startsWith("/shop/")
    ? decodeURIComponent(pathname.replace("/shop/", "").split("/")[0])
    : "";

  const hasActiveFilters =
    !inStock ||
    !outOfStock ||
    urlPrice < MAX_PRICE ||
    minRating > 0 ||
    Boolean(activeCategorySlug);

  return (
    <aside className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 h-fit">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <FaRotateLeft className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Availability */}
      <div className="pt-4 border-t border-slate-100 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Availability
        </h4>
        <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
          <input
            type="checkbox"
            checked={inStock}
            onChange={() =>
              updateParams({ inStock: (!inStock).toString() })
            }
            className="checkbox checkbox-sm rounded"
          />
          <span>In Stock</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
          <input
            type="checkbox"
            checked={outOfStock}
            onChange={() =>
              updateParams({ outOfStock: (!outOfStock).toString() })
            }
            className="checkbox checkbox-sm rounded"
          />
          <span>Out of Stock</span>
        </label>
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Max Price
          </h4>
          <span className="text-sm font-bold text-blue-600">
            ${priceDraft.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={MAX_PRICE}
          step={25}
          value={priceDraft}
          onChange={(e) => setPriceDraft(Number(e.target.value))}
          onMouseUp={(e) =>
            updateParams({
              price: (e.target as HTMLInputElement).value,
            })
          }
          onTouchEnd={(e) =>
            updateParams({
              price: (e.target as HTMLInputElement).value,
            })
          }
          onKeyUp={() => updateParams({ price: String(priceDraft) })}
          className="range range-xs range-primary"
        />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[150, 350, 750, 2000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setPriceDraft(preset);
                updateParams({
                  price: preset === MAX_PRICE ? null : String(preset),
                });
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                urlPrice === preset
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              {preset === MAX_PRICE ? "Any" : `≤ $${preset}`}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Customer Rating
        </h4>
        <div className="space-y-1">
          {[5, 4, 3, 0].map((stars) => {
            const active = minRating === stars;
            return (
              <button
                key={stars}
                type="button"
                onClick={() =>
                  updateParams({
                    rating: stars === 0 ? null : String(stars),
                  })
                }
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {stars === 0 ? (
                  <span>All Ratings</span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-3 h-3 ${
                          i < stars ? "text-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                    <span className="ml-1">{stars === 5 ? "5.0" : `${stars}+`}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Categories
          </h4>
          <ul className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
            <li>
              <Link
                href="/shop"
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  !activeCategorySlug
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>All Categories</span>
              </Link>
            </li>
            {categories.map((cat) => {
              const isSelected = activeCategorySlug === cat.name;
              return (
                <li key={cat.id}>
                  <Link
                    href={`/shop/${cat.name}`}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{cat.name.replace(/-/g, " ")}</span>
                    {cat._count?.products !== undefined && (
                      <span className="text-[11px] text-slate-400">
                        {cat._count.products}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default Filters;
