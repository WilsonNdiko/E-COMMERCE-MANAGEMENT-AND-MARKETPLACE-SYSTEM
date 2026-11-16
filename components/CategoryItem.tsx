import Link from "next/link";
import React, { type ReactNode } from "react";

interface CategoryItemProps {
  children: ReactNode;
  title: string;
  href: string;
}

const CategoryItem = ({ title, children, href }: CategoryItemProps) => {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
    >
      <div className="w-14 h-14 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
        {children}
      </div>
      <h3 className="font-semibold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
    </Link>
  );
};

export default CategoryItem;
