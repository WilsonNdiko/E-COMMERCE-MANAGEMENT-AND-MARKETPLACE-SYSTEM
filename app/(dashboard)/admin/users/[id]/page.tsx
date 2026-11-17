"use client";
import DashboardSidebar from "@/components/DashboardSidebar";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { isValidEmailAddressFormat } from "@/lib/utils";
import apiClient from "@/lib/api";
import Link from "next/link";
import { FaArrowLeft, FaTrashCan } from "react-icons/fa6";

const DashboardSingleUserPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [userInput, setUserInput] = useState({
    email: "",
    newPassword: "",
    role: "user",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    apiClient
      .get(`/api/users/${params.id}`)
      .then((res) => res.json())
      .then((data) =>
        setUserInput({
          email: data?.email || "",
          newPassword: "",
          role: data?.role || "user",
        })
      )
      .catch(() => toast.error("Failed to load user"));
  }, [params?.id]);

  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmailAddressFormat(userInput.email)) {
      toast.error("Invalid email format");
      return;
    }
    if (userInput.newPassword && userInput.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {
        email: userInput.email.trim().toLowerCase(),
        role: userInput.role,
      };
      if (userInput.newPassword) {
        payload.password = userInput.newPassword;
      }
      const res = await apiClient.put(`/api/users/${params.id}`, payload);
      if (res.ok) {
        toast.success("User updated!");
        setUserInput((p) => ({ ...p, newPassword: "" }));
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Error updating user");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (!confirm(`Delete user "${userInput.email}"?`)) return;
    const res = await apiClient.delete(`/api/users/${params.id}`);
    if (res.status === 204 || res.ok) {
      toast.success("User deleted");
      router.push("/admin/users");
    } else {
      toast.error("Error deleting user");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10";

  return (
    <div className="bg-canvas min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />
        <div className="flex-1 max-w-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline mb-1"
              >
                <FaArrowLeft className="w-3 h-3" />
                <span>Back to Users</span>
              </Link>
              <h1 className="text-2xl font-extrabold text-stone-900">
                Manage User
              </h1>
            </div>
            <button
              type="button"
              onClick={deleteUser}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3.5 py-2 text-xs font-bold"
            >
              <FaTrashCan className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <form
            onSubmit={updateUser}
            className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={userInput.email}
                onChange={(e) =>
                  setUserInput({ ...userInput, email: e.target.value })
                }
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Reset Password (leave blank to keep unchanged)
              </label>
              <input
                type="password"
                value={userInput.newPassword}
                onChange={(e) =>
                  setUserInput({ ...userInput, newPassword: e.target.value })
                }
                placeholder="Enter new password (optional)"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Role
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
              {saving ? "Saving..." : "Save User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardSingleUserPage;
