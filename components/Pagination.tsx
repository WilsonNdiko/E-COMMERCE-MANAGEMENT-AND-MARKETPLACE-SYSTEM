"use client";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
}

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
}: PaginationProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const safePage = Math.min(totalPages, Math.max(1, page));
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(safePage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 pt-10"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
        className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FaChevronLeft className="w-3 h-3" />
        <span>Prev</span>
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => goToPage(p)}
          className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
            p === currentPage
              ? "bg-teal-700 text-white shadow-sm"
              : "bg-white border border-stone-200 text-stone-700 hover:bg-canvas"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => goToPage(currentPage + 1)}
        className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span>Next</span>
        <FaChevronRight className="w-3 h-3" />
      </button>
    </nav>
  );
};

export default Pagination;
