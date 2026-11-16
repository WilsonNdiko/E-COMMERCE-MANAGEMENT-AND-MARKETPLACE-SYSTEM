"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SectionTitle } from "@/components";
import NotificationCard from "@/components/NotificationCard";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationStore } from "@/app/_zustand/notificationStore";
import {
  FaBell,
  FaCheck,
  FaTrash,
  FaMagnifyingGlass,
} from "react-icons/fa6";

const NotificationsPage = () => {
  const { status } = useSession();
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    total,
    page,
    totalPages,
    loading,
    filters,
    fetchNotifications,
    markNotificationAsRead,
    markSelectedAsRead,
    deleteNotificationById,
    deleteSelectedNotifications,
  } = useNotifications();

  const {
    selectedIds,
    setFilters,
    selectAll,
    clearSelection,
    toggleSelection,
  } = useNotificationStore();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications();
    }
  }, [status, filters, fetchNotifications]);

  if (status === "loading") {
    return (
      <div className="py-20 text-center text-sm text-slate-500">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-[75vh] pb-20">
      <SectionTitle title="Notifications" path="Home | Notifications" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-5">
        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <FaMagnifyingGlass className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
              placeholder="Search notifications..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={
                filters.isRead === undefined
                  ? "all"
                  : filters.isRead
                  ? "read"
                  : "unread"
              }
              onChange={(e) => {
                const v = e.target.value;
                setFilters({
                  isRead: v === "all" ? undefined : v === "read",
                  page: 1,
                });
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="all">All ({total})</option>
              <option value="unread">Unread ({unreadCount})</option>
              <option value="read">Read</option>
            </select>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  selectedIds.length === notifications.length
                    ? clearSelection()
                    : selectAll()
                }
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {selectedIds.length === notifications.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            )}

            {selectedIds.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={markSelectedAsRead}
                  className="inline-flex items-center gap-1 rounded-xl bg-blue-600 text-white px-3 py-2 text-xs font-bold"
                >
                  <FaCheck className="w-3 h-3" />
                  <span>Mark Read ({selectedIds.length})</span>
                </button>
                <button
                  type="button"
                  onClick={deleteSelectedNotifications}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-600 text-white px-3 py-2 text-xs font-bold"
                >
                  <FaTrash className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-14 text-center space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FaBell className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              You&apos;re all caught up
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you place an order or a shipment status changes, instant
              updates will show up right here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                isSelected={selectedIds.includes(n.id)}
                onToggleSelect={toggleSelection}
                onMarkAsRead={markNotificationAsRead}
                onDelete={deleteNotificationById}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setFilters({ page: Math.max(1, page - 1) })}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() =>
                setFilters({ page: Math.min(totalPages, page + 1) })
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
