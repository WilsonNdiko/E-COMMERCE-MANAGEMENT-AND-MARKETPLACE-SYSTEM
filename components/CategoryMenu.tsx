import React from "react";
import CategoryItem from "./CategoryItem";
import Image from "next/image";
import Link from "next/link";
import { categoryMenuList } from "@/lib/utils";
import { FaArrowRight } from "react-icons/fa6";

const CategoryMenu = () => {
  return (
    <section className="py-14 sm:py-16 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Shop by Department
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mt-1">
              Browse Categories
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
          >
            <span>View all products</span>
            <FaArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categoryMenuList.map((item) => (
            <CategoryItem title={item.title} key={item.id} href={item.href}>
              <Image
                src={item.src}
                width={36}
                height={36}
                alt={item.title}
                className="w-9 h-9 object-contain"
              />
            </CategoryItem>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryMenu;
