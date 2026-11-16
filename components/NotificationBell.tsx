"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaRegBell, FaCheckDouble } from "react-icons/fa6";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/api";
import { notificationApi } from "@/lib/notification-api";
import toast from "react-hot-toast";

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  className = "",
}) => {
  const { data: session } = useSession();
  const { unreadCount, refreshUnreadCount } = useUnreadCount() as any;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadRecentNotifications = async () => {
    if (!session?.user?.email) return;
    setLoading(true);
    try {
      const uRes = await apiClient.get(
        `/api/users/email/${encodeURIComponent(session.user.email)}`
      );
      if (!uRes.ok) return;
      const user = await uRes.json();
      if (!user?.id) return;
      const data = await notificationApi.getUserNotifications(user.id, {
        page: 1,
        limit: 4,
      });
      setRecent(data.notifications || []);
    } catch (_) {
      setRecent([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !isDropdownOpen;
    setIsDropdownOpen(next);
    if (next) loadRecentNotifications();
  };

  const handleMarkAllRead = async () => {
    if (!session?.user?.email) return;
    try {
      const uRes = await apiClient.get(
        `/api/users/email/${encodeURIComponent(session.user.email)}`
      );
      if (!uRes.ok) return;
      const user = await uRes.json();
      const unreadIds = recent.filter((n) => !n.isRead).map((n) => n.id);
      if (unreadIds.length > 0) {
        await notificationApi.bulkMarkAsRead({
          notificationIds: unreadIds,
          userId: user.id,
        });
      }
      setRecent((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (typeof refreshUnreadCount === "function") refreshUnreadCount();
      toast.success("Notifications marked as read");
    } catch (_) {
      toast.error("Failed to mark notifications as read");
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex items-center justify-center w-10 h-10 text-stone-700 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
        aria-label={`Notifications ${
          unreadCount > 0 ? `(${unreadCount} unread)` : ""
        }`}
        title="Notifications"
      >
        <FaRegBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold text-white bg-teal-700 rounded-full shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <h3 className="text-sm font-bold text-stone-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                <FaCheckDouble className="w-3 h-3" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
            {loading ? (
              <div className="p-6 text-center text-xs text-stone-500">
                Loading notifications...
              </div>
            ) : recent.length === 0 ? (
              <div className="p-8 text-center">
                <FaRegBell className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <p className="text-stone-600 text-sm font-medium">
                  All caught up
                </p>
                <p className="text-stone-400 text-xs mt-0.5">
                  Order updates and alerts will appear here.
                </p>
              </div>
            ) : (
              recent.map((item) => (
                <div
                  key={item.id}
                  className={`px-4 py-3 text-left ${
                    !item.isRead ? "bg-teal-50/50" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-stone-900">
                      {item.title}
                    </p>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-700 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">
                    {item.message}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-canvas border-t border-stone-100">
            <Link
              href="/notifications"
              onClick={() => setIsDropdownOpen(false)}
              className="block w-full text-center text-xs font-semibold text-teal-700 hover:text-teal-800 py-1"
            >
              Open Notification Center →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
