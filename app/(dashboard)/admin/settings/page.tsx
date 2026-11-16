"use client";
import React, { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";
import { FaTrashCan, FaDownload, FaStar } from "react-icons/fa6";
import Link from "next/link";

interface AdminReview {
  id: string;
  author: string;
  rating: number;
  title?: string | null;
  comment: string;
  verified: boolean;
  createdAt: string;
  product?: { id: string; title: string; slug: string };
}

interface ContactTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<"store" | "inbox" | "reviews" | "newsletter">(
    "store"
  );
  const [settings, setSettings] = useState<Record<string, string>>({
    storeName: "Singitronic",
    supportEmail: "support@singitronic.com",
    supportPhone: "+1 (800) 555-0194",
    storeAddress: "742 Innovation Drive, Austin, TX 78701",
    shippingFee: "10",
    freeShippingThreshold: "150",
    taxRate: "8",
    announcementText: "Free express shipping on orders over $150",
  });
  const [saving, setSaving] = useState(false);

  const [tickets, setTickets] = useState<ContactTicket[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);

  useEffect(() => {
    apiClient
      .get("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setSettings((prev) => ({ ...prev, ...d })))
      .catch(() => {});
    apiClient
      .get("/api/contact")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setTickets(Array.isArray(d) ? d : []))
      .catch(() => {});
    apiClient
      .get("/api/newsletter")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setSubscribers(Array.isArray(d) ? d : []))
      .catch(() => {});
    apiClient
      .get("/api/reviews")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setReviews(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const deleteReviewItem = async (id: string) => {
    if (!confirm("Delete this customer review?")) return;
    const res = await apiClient.delete(`/api/reviews/${id}`);
    if (res.ok || res.status === 204) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review removed");
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.put("/api/admin/settings", settings);
      if (res.ok) toast.success("Store settings saved!");
      else toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateTicketStatus = async (id: string, status: string) => {
    const res = await apiClient.put(`/api/contact/${id}`, { status });
    if (res.ok) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
      toast.success("Ticket status updated");
    }
  };

  const deleteTicket = async (id: string) => {
    const res = await apiClient.delete(`/api/contact/${id}`);
    if (res.ok) {
      setTickets((prev) => prev.filter((t) => t.id !== id));
      toast.success("Message removed");
    }
  };

  const deleteSubscriber = async (id: string) => {
    const res = await apiClient.delete(`/api/newsletter/${id}`);
    if (res.ok) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      toast.success("Subscriber removed");
    }
  };

  const exportSubscribers = () => {
    const rows = [
      "email,subscribed_at",
      ...subscribers.map((s) => `${s.email},${s.createdAt}`),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="bg-slate-50 min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Settings &amp; Customer Inbox
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure store preferences, respond to support tickets, and manage newsletter subscribers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTab("store")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                tab === "store"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              Store Configuration
            </button>
            <button
              type="button"
              onClick={() => setTab("inbox")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                tab === "inbox"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              Support Inbox ({tickets.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("reviews")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                tab === "reviews"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("newsletter")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                tab === "newsletter"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              Newsletter ({subscribers.length})
            </button>
          </div>

          {tab === "store" && (
            <form
              onSubmit={saveSettings}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm max-w-3xl space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={settings.storeName || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, storeName: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={settings.supportEmail || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, supportEmail: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Support Phone
                  </label>
                  <input
                    type="text"
                    value={settings.supportPhone || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, supportPhone: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Flat Shipping Rate ($)
                  </label>
                  <input
                    type="number"
                    value={settings.shippingFee || "10"}
                    onChange={(e) =>
                      setSettings({ ...settings, shippingFee: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Free Shipping Threshold ($)
                  </label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold || "150"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        freeShippingThreshold: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.taxRate || "8"}
                    onChange={(e) =>
                      setSettings({ ...settings, taxRate: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Warehouse / Store Address
                  </label>
                  <input
                    type="text"
                    value={settings.storeAddress || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, storeAddress: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Announcement Banner Message
                  </label>
                  <input
                    type="text"
                    value={settings.announcementText || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        announcementText: e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 text-sm"
              >
                {saving ? "Saving..." : "Save Store Settings"}
              </button>
            </form>
          )}

          {tab === "inbox" && (
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                  No customer support messages yet. Messages sent via /contact appear here.
                </div>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {t.subject}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            — {t.name} ({t.email})
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(t.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={t.status}
                          onChange={(e) =>
                            updateTicketStatus(t.id, e.target.value)
                          }
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold"
                        >
                          <option value="NEW">New</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => deleteTicket(t.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <FaTrashCan className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {t.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                  No customer reviews yet.
                </div>
              ) : (
                reviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <FaStar
                              key={idx}
                              className={`w-3 h-3 ${
                                idx < r.rating
                                  ? "text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {r.author}
                        </span>
                        {r.product && (
                          <Link
                            href={`/product/${r.product.slug}`}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            on {r.product.title}
                          </Link>
                        )}
                      </div>
                      {r.title && (
                        <p className="text-xs font-bold text-slate-800">
                          {r.title}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {r.comment}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteReviewItem(r.id)}
                      title="Delete review"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                    >
                      <FaTrashCan className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "newsletter" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Subscribed Emails
                </h2>
                {subscribers.length > 0 && (
                  <button
                    type="button"
                    onClick={exportSubscribers}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <FaDownload className="w-3 h-3" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
              {subscribers.length === 0 ? (
                <p className="p-10 text-center text-xs text-slate-500">
                  No newsletter subscribers yet.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100 text-xs">
                  {subscribers.map((s) => (
                    <li
                      key={s.id}
                      className="px-6 py-3.5 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{s.email}</p>
                        <p className="text-slate-400">
                          Joined {new Date(s.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteSubscriber(s.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <FaTrashCan className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
