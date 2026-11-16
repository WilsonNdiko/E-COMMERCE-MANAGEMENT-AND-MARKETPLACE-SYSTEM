"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FaCube, FaImages, FaMagnifyingGlassPlus } from "react-icons/fa6";

const Product3DViewer = dynamic(() => import("./Product3DViewer"), {
  ssr: false,
  loading: () => (
    <div className="aspect-square rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-sm">
      <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      <p className="text-xs font-semibold">Loading Interactive 3D Studio...</p>
    </div>
  ),
});

interface ImageItem {
  imageID: string;
  productID: string;
  image: string;
}

export default function ProductGallery({
  mainImage,
  title,
  category,
  manufacturer,
  images = [],
}: {
  mainImage?: string;
  title: string;
  category?: string;
  manufacturer?: string;
  images?: ImageItem[];
}) {
  const searchParams = useSearchParams();
  const primary = mainImage ? `/${mainImage}` : "/product_placeholder.jpg";
  const allSrcs = Array.from(
    new Set([
      primary,
      ...(Array.isArray(images)
        ? images.filter((i) => i?.image).map((i) => `/${i.image}`)
        : []),
    ])
  );

  const [selected, setSelected] = useState(allSrcs[0]);
  const [mode, setMode] = useState<"photo" | "3d">(
    searchParams?.get("view") === "3d" ? "3d" : "photo"
  );
  const [zoomOrigin, setZoomOrigin] = useState<string | null>(null);

  useEffect(() => {
    setSelected(allSrcs[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainImage]);

  useEffect(() => {
    if (searchParams?.get("view") === "3d") {
      setMode("3d");
    }
  }, [searchParams]);

  return (
    <div className="space-y-4">
      {/* Mode Switcher: Photos vs Interactive 3D View */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center rounded-2xl bg-white border border-slate-200/80 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMode("photo")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              mode === "photo"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaImages className="w-3.5 h-3.5" />
            <span>Photos ({allSrcs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("3d")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              mode === "3d"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaCube className="w-3.5 h-3.5" />
            <span>3D View</span>
          </button>
        </div>

        {mode === "photo" && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <FaMagnifyingGlassPlus className="w-3 h-3" />
            <span>Hover image to inspect</span>
          </span>
        )}
      </div>

      {/* Main Stage */}
      {mode === "3d" ? (
        <Product3DViewer
          title={title}
          imageSrc={selected}
          category={category}
          manufacturer={manufacturer}
        />
      ) : (
        <div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setZoomOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
          }}
          onMouseLeave={() => setZoomOrigin(null)}
          className="group relative aspect-square rounded-3xl bg-gradient-to-b from-white to-slate-50/70 border border-slate-200/80 p-8 sm:p-12 flex items-center justify-center shadow-sm overflow-hidden cursor-zoom-in"
        >
          <Image
            src={selected}
            width={520}
            height={520}
            priority
            alt={title}
            style={
              zoomOrigin
                ? {
                    transformOrigin: zoomOrigin,
                    transform: "scale(1.45)",
                  }
                : undefined
            }
            className="w-full h-full max-h-[380px] object-contain transition-transform duration-200 ease-out"
          />

          {/* Subtle quick switch pill to 3D */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMode("3d");
            }}
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 hover:bg-blue-600 text-white px-3.5 py-1.5 text-xs font-semibold shadow-md backdrop-blur-sm transition-colors"
          >
            <FaCube className="w-3 h-3" />
            <span>View in 3D</span>
          </button>
        </div>
      )}

      {/* Thumbnails + 3D Tile */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {allSrcs.map((src, idx) => {
          const active = mode === "photo" && src === selected;
          return (
            <button
              key={`${src}-${idx}`}
              type="button"
              onClick={() => {
                setSelected(src);
                setMode("photo");
              }}
              className={`w-20 h-20 rounded-xl bg-white p-2 border-2 flex items-center justify-center shrink-0 transition-all ${
                active
                  ? "border-blue-600 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={src}
                width={72}
                height={72}
                alt={`${title} view ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setMode("3d")}
          className={`w-20 h-20 rounded-xl p-2 border-2 flex flex-col items-center justify-center gap-1 shrink-0 transition-all ${
            mode === "3d"
              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
          }`}
          aria-label="Switch to interactive 3D view"
        >
          <FaCube className="w-5 h-5" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider">
            360° 3D
          </span>
        </button>
      </div>
    </div>
  );
}
