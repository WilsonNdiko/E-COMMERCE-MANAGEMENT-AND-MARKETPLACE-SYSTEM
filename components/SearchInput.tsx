"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaMagnifyingGlass, FaXmark } from "react-icons/fa6";
import { sanitize } from "@/lib/sanitize";
import apiClient from "@/lib/api";

const SearchInput = () => {
  const [searchInput, setSearchInput] = useState<string>("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(
          `/api/search?query=${encodeURIComponent(trimmed)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data.slice(0, 5) : []);
          setOpen(true);
        }
      } catch (_) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const searchProducts = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sanitizedSearch = sanitize(searchInput.trim());
    setOpen(false);
    if (!sanitizedSearch) {
      router.push("/shop");
      return;
    }
    router.push(`/search?search=${encodeURIComponent(sanitizedSearch)}`);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={searchProducts}
        className="flex items-center w-full rounded-xl bg-slate-100 border border-slate-200/80 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all"
      >
        <FaMagnifyingGlass className="ml-3.5 text-slate-400 w-4 h-4 shrink-0" />
        <input
          type="text"
          value={searchInput}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search phones, laptops, headphones, cameras..."
          className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          aria-label="Search products"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setResults([]);
              setOpen(false);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <FaXmark className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="submit"
          className="m-1 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          {loading ? (
            <div className="p-4 text-sm text-slate-500 text-center">
              Searching catalog...
            </div>
          ) : results.length > 0 ? (
            <>
              <ul className="divide-y divide-slate-100">
                {results.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => {
                        setOpen(false);
                        setSearchInput("");
                      }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shrink-0">
                        <Image
                          src={
                            item.mainImage
                              ? `/${item.mainImage}`
                              : "/product_placeholder.jpg"
                          }
                          alt={item.title}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {item.manufacturer}
                          {item.category?.name
                            ? ` · ${item.category.name.replace(/-/g, " ")}`
                            : ""}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-blue-600 shrink-0">
                        ${item.price}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  const q = searchInput.trim();
                  setOpen(false);
                  router.push(`/search?search=${encodeURIComponent(q)}`);
                }}
                className="w-full px-4 py-2.5 text-xs font-semibold text-blue-600 bg-slate-50 hover:bg-blue-50 border-t border-slate-100 text-center transition-colors"
              >
                See all results for &ldquo;{searchInput.trim()}&rdquo; →
              </button>
            </>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-slate-600">
                No products matched &ldquo;{searchInput.trim()}&rdquo;
              </p>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="inline-block mt-1.5 text-xs font-semibold text-blue-600 hover:underline"
              >
                Browse all products →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
