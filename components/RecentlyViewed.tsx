"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCube, FaStar } from "react-icons/fa6";

interface RecentProduct {
  id: string;
  slug: string;
  title: string;
  mainImage: string;
  price: number;
  rating: number;
  manufacturer: string;
}

const STORAGE_KEY = "singitronic-recently-viewed";

export default function RecentlyViewed({
  currentProduct,
}: {
  currentProduct: RecentProduct;
}) {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: RecentProduct[] = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];

      const others = list.filter((p) => p.id !== currentProduct.id);
      setItems(others.slice(0, 4));

      const updated = [currentProduct, ...others].slice(0, 8);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors in private browsing modes
    }
  }, [currentProduct]);

  if (items.length === 0) return null;

  return (
    <section className="mt-14 pt-10 border-t border-slate-200/70">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
          Recently Viewed
        </h2>
        <span className="text-xs text-slate-400">Your browsing history</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.slug}`}
            className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md p-4 flex items-center gap-3.5 transition-all"
          >
            <div className="w-16 h-16 rounded-xl bg-slate-50 p-2 flex items-center justify-center shrink-0">
              <Image
                src={p.mainImage ? `/${p.mainImage}` : "/product_placeholder.jpg"}
                alt={p.title}
                width={56}
                height={56}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[11px] text-slate-400 truncate">
                {p.manufacturer}
              </p>
              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 line-clamp-1 transition-colors">
                {p.title}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  ${Number(p.price).toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-500">
                  {p.rating > 0 ? (
                    <>
                      <FaStar className="w-2.5 h-2.5 text-amber-400" />
                      {p.rating}.0
                    </>
                  ) : (
                    <FaCube className="w-2.5 h-2.5 text-blue-500" />
                  )}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
