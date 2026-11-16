"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SortBy = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentSort = searchParams.get("sort") || "defaultSort";

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "defaultSort") params.delete("sort");
    else params.set("sort", value);
    params.set("page", "1");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2.5">
      <label
        htmlFor="shop-sort"
        className="text-xs font-semibold text-slate-500 whitespace-nowrap"
      >
        Sort by
      </label>
      <select
        id="shop-sort"
        value={currentSort}
        onChange={(e) => handleSort(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        name="sort"
      >
        <option value="defaultSort">Featured</option>
        <option value="lowPrice">Price: Low to High</option>
        <option value="highPrice">Price: High to Low</option>
        <option value="topRated">Top Rated</option>
        <option value="titleAsc">Name: A – Z</option>
        <option value="titleDesc">Name: Z – A</option>
      </select>
    </div>
  );
};

export default SortBy;
