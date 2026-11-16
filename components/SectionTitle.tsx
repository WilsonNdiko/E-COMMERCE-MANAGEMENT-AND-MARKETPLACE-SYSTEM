import React from "react";
import Link from "next/link";

const SectionTitle = ({ title, path }: { title: string; path: string }) => {
  const segments = path
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-2"
        >
          {segments.map((seg, idx) => {
            const isLast = idx === segments.length - 1;
            const href =
              seg.toLowerCase() === "home"
                ? "/"
                : seg.toLowerCase() === "shop"
                ? "/shop"
                : null;
            return (
              <React.Fragment key={`${seg}-${idx}`}>
                {idx > 0 && <span className="text-slate-300">/</span>}
                {!isLast && href ? (
                  <Link
                    href={href}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {seg}
                  </Link>
                ) : (
                  <span className={isLast ? "text-slate-800 font-semibold" : ""}>
                    {seg}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default SectionTitle;
