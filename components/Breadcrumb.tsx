"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { FaHouse, FaChevronRight } from "react-icons/fa6";

const Breadcrumb = () => {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const categorySlug = parts[1];

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-xs font-medium text-slate-500 py-5"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
      >
        <FaHouse className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      <FaChevronRight className="w-2.5 h-2.5 text-slate-300" />
      {categorySlug ? (
        <>
          <Link
            href="/shop"
            className="hover:text-blue-600 transition-colors"
          >
            Shop
          </Link>
          <FaChevronRight className="w-2.5 h-2.5 text-slate-300" />
          <span className="text-slate-900 font-semibold capitalize">
            {decodeURIComponent(categorySlug).replace(/-/g, " ")}
          </span>
        </>
      ) : (
        <span className="text-slate-900 font-semibold">All Products</span>
      )}
    </nav>
  );
};

export default Breadcrumb;
