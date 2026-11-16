import React from "react";
import Link from "next/link";

const SectionTitle = ({ title, path }: { title: string; path: string }) => {
  const segments = path
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="bg-sage border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-stone-600 mb-1.5"
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
                {idx > 0 && <span className="text-stone-400">/</span>}
                {!isLast && href ? (
                  <Link
                    href={href}
                    className="hover:text-teal-800 transition-colors"
                  >
                    {seg}
                  </Link>
                ) : (
                  <span className={isLast ? "text-teal-900 font-semibold" : ""}>
                    {seg}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
          {title}
        </h1>
      </div>
    </div>
  );
};

export default SectionTitle;
