"use client";
import { DashboardSidebar } from "@/components";
import { isValidEmailAddressFormat } from "@/lib/utils";
import React, { useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";

const DashboardCreateNewUser = () => {
  const router = useRouter();
  const [userInput, setUserInput] = useState({
    email: "",
    password: "",
    role: "user",
  });
  const [saving, setSaving] = useState(false);

  const addNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmailAddressFormat(userInput.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (userInput.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.post("/api/users", {
        email: userInput.email.trim().toLowerCase(),
        password: userInput.password,
        role: userInput.role,
      });
      if (response.status === 201 || response.ok) {
        toast.success("User created successfully!");
        router.push("/admin/users");
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || err.message || "Error creating user");
      }
    } catch (_) {
      toast.error("Network error creating user");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10";

  return (
    <div className="bg-canvas min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />
        <div className="flex-1 max-w-xl space-y-5">
          <div>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline mb-1"
            >
              <FaArrowLeft className="w-3 h-3" />
              <span>Back to Users</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-stone-900">
              Add New User
            </h1>
          </div>

          <form
            onSubmit={addNewUser}
            className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={userInput.email}
                onChange={(e) =>
                  setUserInput({ ...userInput, email: e.target.value })
                }
                placeholder="customer@example.com"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password (min. 8 chars) *
              </label>
              <input
                type="password"
                required
                value={userInput.password}
                onChange={(e) =>
                  setUserInput({ ...userInput, password: e.target.value })
                }
                placeholder="••••••••"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Account Role
              </label>
              <select
                value={userInput.role}
                onChange={(e) =>
                  setUserInput({ ...userInput, role: e.target.value })
                }
                className={inputCls}
              >
                <option value="user">Customer (User)</option>
                <option value="admin">Administrator (Admin)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold px-6 py-2.5 text-sm"
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardCreateNewUser;
