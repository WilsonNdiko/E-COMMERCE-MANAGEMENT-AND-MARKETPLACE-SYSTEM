"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api";
import {
  FaHeadphones,
  FaRegEnvelope,
  FaRegUser,
  FaTruckFast,
  FaGaugeHigh,
  FaArrowRightFromBracket,
  FaBoxOpen,
} from "react-icons/fa6";

const HeaderTop = () => {
  const { data: session }: any = useSession();
  const [meta, setMeta] = useState({
    phone: "+1 (800) 555-0194",
    email: "support@singitronic.com",
    banner: "Free delivery on orders over $150",
  });

  useEffect(() => {
    let active = true;
    apiClient
      .get("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active || !d) return;
        setMeta({
          phone: d.supportPhone || "+1 (800) 555-0194",
          email: d.supportEmail || "support@singitronic.com",
          banner:
            d.announcementText ||
            `Free delivery on orders over $${d.freeShippingThreshold || 150}`,
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    toast.success("Signed out successfully");
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="bg-teal-900 text-teal-50 text-xs border-b border-teal-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[38px] py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="hidden md:flex items-center gap-5 text-teal-100/90">
          <a
            href={`tel:${meta.phone.replace(/[^+\d]/g, "")}`}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <FaHeadphones className="text-amber-300" />
            <span>{meta.phone}</span>
          </a>
          <a
            href={`mailto:${meta.email}`}
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <FaRegEnvelope className="text-amber-300" />
            <span>{meta.email}</span>
          </a>
        </div>

        <div className="hidden xl:flex items-center gap-2 text-teal-50 font-medium">
          <FaTruckFast className="text-amber-300" />
          <span>
            {meta.banner} · Code{" "}
            <strong className="text-amber-200 font-semibold">SAVE10</strong> for
            10% off
          </span>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-teal-100 hover:text-white transition-colors font-medium"
          >
            <FaBoxOpen className="text-teal-200" />
            <span>Track Order</span>
          </Link>

          <span className="h-3.5 w-px bg-teal-700" aria-hidden="true" />

          {!session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-teal-50 hover:text-white font-medium transition-colors"
              >
                <FaRegUser className="text-teal-200" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 px-3 py-0.5 font-bold transition-colors"
              >
                Join Free
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {session.user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white px-2.5 py-0.5 font-semibold transition-colors"
                >
                  <FaGaugeHigh className="text-[11px] text-amber-300" />
                  <span>Admin</span>
                </Link>
              )}
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 text-teal-50 hover:text-white font-medium transition-colors max-w-[160px] truncate"
                title={session.user?.email}
              >
                <FaRegUser className="text-amber-300 shrink-0" />
                <span className="truncate">{session.user?.email}</span>
              </Link>
              <button
                onClick={handleLogout}
                type="button"
                className="inline-flex items-center gap-1 text-teal-200 hover:text-white font-medium transition-colors"
              >
                <FaArrowRightFromBracket />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderTop;
