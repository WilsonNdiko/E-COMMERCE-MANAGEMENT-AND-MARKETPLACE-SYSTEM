"use client";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaMagnifyingGlass } from "react-icons/fa6";

const DashboardUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/api/users", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to fetch users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.role || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-canvas min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900">Users</h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Manage customer accounts and administrator permissions.
              </p>
            </div>
            <Link
              href="/admin/users/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-4 py-2.5 text-xs font-bold shadow-sm"
            >
              <FaPlus className="w-3 h-3" />
              <span>Add User</span>
            </Link>
          </div>

          <div className="relative max-w-xs">
            <FaMagnifyingGlass className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -transtone-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or role..."
              className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 py-2 text-xs text-stone-900 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-100">
                  <tr>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">User ID</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-stone-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-stone-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-canvas/70">
                        <td className="px-6 py-3.5 font-bold text-stone-900">
                          {u.email}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-bold capitalize ${
                              u.role === "admin"
                                ? "bg-teal-50 text-teal-800"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-stone-400">
                          {u.id.slice(0, 12)}...
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="rounded-lg border border-stone-200 hover:bg-stone-100 px-3 py-1.5 font-semibold text-stone-700"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUsers;
