"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import HeaderTop from "./HeaderTop";
import SearchInput from "./SearchInput";
import Link from "next/link";
import CartElement from "./CartElement";
import NotificationBell from "./NotificationBell";
import HeartElement from "./HeartElement";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";
import { categoryMenuList } from "@/lib/utils";
import {
  FaBars,
  FaXmark,
  FaChevronDown,
  FaBolt,
  FaStore,
} from "react-icons/fa6";

const Header = () => {
  const { data: session }: any = useSession();
  const pathname = usePathname();
  const { setWishlist, wishQuantity } = useWishlistStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    setMobileMenuOpen(false);
    setCatOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Sync server-side wishlist when user signs in
  useEffect(() => {
    const syncWishlist = async () => {
      if (!session?.user?.email) return;
      try {
        const userRes = await apiClient.get(
          `/api/users/email/${encodeURIComponent(session.user.email)}`,
          { cache: "no-store" }
        );
        if (!userRes.ok) return;
        const userData = await userRes.json();
        if (!userData?.id) return;

        const wishRes = await apiClient.get(`/api/wishlist/${userData.id}`, {
          cache: "no-store",
        });
        if (!wishRes.ok) return;
        const serverItems = await wishRes.json();
        if (Array.isArray(serverItems) && serverItems.length > 0) {
          const mapped: ProductInWishlist[] = serverItems
            .filter((item: any) => item?.product)
            .map((item: any) => ({
              id: item.product.id,
              title: item.product.title,
              price: item.product.price,
              image: item.product.mainImage,
              slug: item.product.slug,
              stockAvailabillity: item.product.inStock,
            }));
          setWishlist(mapped);
        }
      } catch (_) {
        // Keep local wishlist on transient error
      }
    };
    syncWishlist();
  }, [session?.user?.email, setWishlist]);

  const handleLogout = async () => {
    toast.success("Signed out successfully");
    await signOut({ callbackUrl: "/" });
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop All", href: "/shop" },
    { label: "Deals", href: "/shop?sort=lowPrice" },
    { label: "Orders", href: "/orders" },
    { label: "About", href: "/about" },
    { label: "Support", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <HeaderTop />

      {!isAdminRoute ? (
        <>
          {/* Main Header Row */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
            {/* Mobile menu toggle + Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <FaXmark className="w-5 h-5" />
                ) : (
                  <FaBars className="w-5 h-5" />
                )}
              </button>

              <Link href="/" className="flex items-center gap-2.5 group">
                <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
                  <FaBolt className="w-4 h-4" />
                </span>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  SINGI<span className="text-blue-600">TRONIC</span>
                </span>
              </Link>
            </div>

            {/* Center Search */}
            <div className="hidden md:block flex-1 max-w-xl mx-4">
              <SearchInput />
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <NotificationBell />
              <HeartElement wishQuantity={wishQuantity} />
              <CartElement />
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden px-4 pb-3">
            <SearchInput />
          </div>

          {/* Desktop Navigation Strip */}
          <nav className="hidden lg:block border-t border-slate-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {/* Categories Dropdown */}
                <div className="relative" ref={catRef}>
                  <button
                    type="button"
                    onClick={() => setCatOpen((v) => !v)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors mr-2"
                  >
                    <FaBars className="w-3.5 h-3.5 text-blue-600" />
                    <span>Categories</span>
                    <FaChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform ${
                        catOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {catOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 grid grid-cols-1">
                      {categoryMenuList.map((cat) => (
                        <Link
                          key={cat.id}
                          href={cat.href}
                          onClick={() => setCatOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
                        >
                          <span>{cat.title}</span>
                          <span className="text-slate-300 text-xs">→</span>
                        </Link>
                      ))}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <Link
                          href="/shop"
                          onClick={() => setCatOpen(false)}
                          className="block px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          Browse All Categories
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {navLinks.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href.split("?")[0] &&
                        !item.href.includes("?");
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "text-blue-600 bg-blue-50 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <Link
                href="/faq"
                className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                Need help? Visit FAQ
              </Link>
            </div>
          </nav>

          {/* Mobile Drawer Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-lg">
              <div className="grid grid-cols-2 gap-1.5">
                {navLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/faq"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  FAQ
                </Link>
                <Link
                  href="/account"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  My Account
                </Link>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
                  Top Categories
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {categoryMenuList.map((cat) => (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      {cat.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Admin Header Bar */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <FaBolt className="w-4 h-4" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                SINGI<span className="text-blue-600">TRONIC</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
            >
              <FaStore className="text-blue-600" />
              <span>View Store</span>
            </Link>
            <NotificationBell />
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                type="button"
                className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center hover:bg-blue-700 transition-colors"
                aria-label="Admin menu"
              >
                {(session?.user?.email?.[0] || "A").toUpperCase()}
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content z-50 menu p-2 shadow-xl bg-white border border-slate-200 rounded-xl w-52 mt-2 text-sm"
              >
                <li>
                  <Link href="/admin">Dashboard Overview</Link>
                </li>
                <li>
                  <Link href="/admin/settings">Store Settings</Link>
                </li>
                <li>
                  <Link href="/account">My Profile</Link>
                </li>
                <li className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-rose-600 hover:text-rose-700"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
