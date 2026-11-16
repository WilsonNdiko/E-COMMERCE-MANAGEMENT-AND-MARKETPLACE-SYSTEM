"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartPie,
  FaBagShopping,
  FaBoxArchive,
  FaTags,
  FaUsers,
  FaStore,
  FaFileArrowUp,
  FaGear,
} from "react-icons/fa6";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: FaChartPie, exact: true },
  { label: "Orders", href: "/admin/orders", icon: FaBagShopping },
  { label: "Products", href: "/admin/products", icon: FaBoxArchive },
  { label: "Categories", href: "/admin/categories", icon: FaTags },
  { label: "Bulk Upload", href: "/admin/bulk-upload", icon: FaFileArrowUp },
  { label: "Merchants", href: "/admin/merchant", icon: FaStore },
  { label: "Users", href: "/admin/users", icon: FaUsers },
  { label: "Settings & Inbox", href: "/admin/settings", icon: FaGear },
];

const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-full xl:w-64 shrink-0">
      <nav
        aria-label="Admin navigation"
        className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm xl:sticky xl:top-24"
      >
        <p className="hidden xl:block px-3 pt-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Management
        </p>
        <ul className="flex xl:flex-col gap-1 overflow-x-auto pb-1 xl:pb-0">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-white" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
