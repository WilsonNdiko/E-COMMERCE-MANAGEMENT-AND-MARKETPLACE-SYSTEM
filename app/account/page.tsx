"use client";
import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";
import {
  FaBoxOpen,
  FaHeart,
  FaBell,
  FaGaugeHigh,
  FaLock,
  FaArrowRightFromBracket,
} from "react-icons/fa6";

export default function AccountPage() {
  const { data: session, status }: any = useSession();
  const router = useRouter();

  const [userRecord, setUserRecord] = useState<User | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.email) return;
      try {
        const [uRes, oRes] = await Promise.all([
          apiClient.get(
            `/api/users/email/${encodeURIComponent(session.user.email)}`
          ),
          apiClient.get(
            `/api/orders?email=${encodeURIComponent(session.user.email)}`
          ),
        ]);
        if (uRes.ok) setUserRecord(await uRes.json());
        if (oRes.ok) {
          const od = await oRes.json();
          setOrderCount(od?.pagination?.total || od?.orders?.length || 0);
        }
      } catch (_) {}
    };
    loadProfile();
  }, [session?.user?.email]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userRecord?.id) return;
    if (pwForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSavingPw(true);
    try {
      const res = await apiClient.put(`/api/users/${userRecord.id}`, {
        currentPassword: pwForm.currentPassword,
        password: pwForm.newPassword,
      });
      if (res.ok) {
        toast.success("Password updated successfully!");
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || err.message || "Failed to update password");
      }
    } catch (_) {
      toast.error("Network error updating password");
    } finally {
      setSavingPw(false);
    }
  };

  if (status === "loading" || !session?.user) {
    return (
      <div className="py-20 text-center text-sm text-stone-500">
        Loading your account...
      </div>
    );
  }

  const isAdmin = (userRecord?.role || session.user.role) === "admin";

  return (
    <div className="bg-canvas min-h-[75vh] pb-20">
      <SectionTitle title="My Account" path="Home | Account" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white text-xl font-extrabold flex items-center justify-center">
              {(session.user.email?.[0] || "U").toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-stone-900">
                  {session.user.email}
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                    isAdmin
                      ? "bg-teal-50 text-teal-800 border border-teal-200"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {isAdmin ? "Admin" : "Member"}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {orderCount} {orderCount === 1 ? "order" : "orders"} placed with
                Singitronic
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              toast.success("Signed out");
              await signOut({ callbackUrl: "/" });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 px-4 py-2.5 text-xs font-semibold text-stone-700 transition-colors"
          >
            <FaArrowRightFromBracket />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/orders"
            className="bg-white rounded-2xl border border-stone-200/80 hover:border-teal-500 p-5 space-y-2 shadow-sm transition-all"
          >
            <FaBoxOpen className="w-5 h-5 text-teal-700" />
            <h3 className="text-sm font-bold text-stone-900">My Orders</h3>
            <p className="text-xs text-stone-500">
              Track deliveries and inspect past receipts
            </p>
          </Link>

          <Link
            href="/wishlist"
            className="bg-white rounded-2xl border border-stone-200/80 hover:border-teal-500 p-5 space-y-2 shadow-sm transition-all"
          >
            <FaHeart className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-stone-900">Saved Wishlist</h3>
            <p className="text-xs text-stone-500">
              View favorited items & move them to cart
            </p>
          </Link>

          <Link
            href="/notifications"
            className="bg-white rounded-2xl border border-stone-200/80 hover:border-teal-500 p-5 space-y-2 shadow-sm transition-all"
          >
            <FaBell className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-stone-900">Notifications</h3>
            <p className="text-xs text-stone-500">
              Order updates, shipping alerts, and offers
            </p>
          </Link>

          {isAdmin ? (
            <Link
              href="/admin"
              className="bg-teal-700 hover:bg-teal-800 text-white rounded-2xl p-5 space-y-2 shadow-sm transition-all"
            >
              <FaGaugeHigh className="w-5 h-5 text-white" />
              <h3 className="text-sm font-bold">Admin Console</h3>
              <p className="text-xs text-teal-100">
                Manage products, inventory, orders & settings
              </p>
            </Link>
          ) : (
            <Link
              href="/contact"
              className="bg-white rounded-2xl border border-stone-200/80 hover:border-teal-500 p-5 space-y-2 shadow-sm transition-all"
            >
              <FaLock className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-stone-900">
                Customer Support
              </h3>
              <p className="text-xs text-stone-500">
                24/7 assistance for warranty and orders
              </p>
            </Link>
          )}
        </div>

        {/* Security / Change Password */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-sm max-w-xl">
          <h3 className="text-base font-extrabold text-stone-900 mb-1">
            Update Password
          </h3>
          <p className="text-xs text-stone-500 mb-5">
            Keep your account secure by using a unique password of at least 8
            characters.
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={pwForm.currentPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, currentPassword: e.target.value })
                }
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={pwForm.newPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, newPassword: e.target.value })
                }
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={pwForm.confirmPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, confirmPassword: e.target.value })
                }
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
              />
            </div>
            <button
              type="submit"
              disabled={savingPw}
              className="rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 transition-colors"
            >
              {savingPw ? "Updating..." : "Save New Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
