"use client";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft, FaTrashCan } from "react-icons/fa6";

const AdminSingleOrder = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    apiClient
      .get(`/api/orders/${params.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setOrder(data))
      .catch(() => toast.error("Failed to load order"));
  }, [params?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSaving(true);
    try {
      const res = await apiClient.put(`/api/orders/${order.id}`, {
        name: order.name,
        lastname: order.lastname,
        phone: order.phone,
        email: order.email,
        company: order.company || "",
        adress: order.adress,
        apartment: order.apartment || "",
        postalCode: order.postalCode,
        city: order.city,
        country: order.country,
        orderNotice: order.orderNotice || "",
        status: order.status,
        total: order.total,
      });
      if (res.ok) {
        toast.success("Order updated successfully");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.details?.[0]?.message || err.error || "Update failed");
      }
    } catch (_) {
      toast.error("Network error updating order");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!order || !confirm("Permanently delete this order?")) return;
    const res = await apiClient.delete(`/api/orders/${order.id}`);
    if (res.ok) {
      toast.success("Order deleted");
      router.push("/admin/orders");
    } else {
      toast.error("Could not delete order");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10";

  return (
    <div className="bg-canvas min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline mb-1"
              >
                <FaArrowLeft className="w-3 h-3" />
                <span>Back to Orders</span>
              </Link>
              <h1 className="text-2xl font-extrabold text-stone-900">
                Order {order ? `#${order.id.slice(0, 14)}` : ""}
              </h1>
            </div>
            {order && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 text-xs font-bold"
              >
                <FaTrashCan className="w-3.5 h-3.5" />
                <span>Delete Order</span>
              </button>
            )}
          </div>

          {!order ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center text-sm text-stone-500">
              Loading order details...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleSave}
                className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h2 className="text-sm font-bold text-stone-900">
                    Customer &amp; Shipping Details
                  </h2>
                  <select
                    value={
                      order.status === "canceled" ? "cancelled" : order.status
                    }
                    onChange={(e) =>
                      setOrder({ ...order, status: e.target.value as any })
                    }
                    className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-800"
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={order.name}
                      onChange={(e) =>
                        setOrder({ ...order, name: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={order.lastname}
                      onChange={(e) =>
                        setOrder({ ...order, lastname: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={order.email}
                      onChange={(e) =>
                        setOrder({ ...order, email: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={order.phone}
                      onChange={(e) =>
                        setOrder({ ...order, phone: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={order.adress}
                      onChange={(e) =>
                        setOrder({ ...order, adress: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Apartment / Suite
                    </label>
                    <input
                      type="text"
                      value={order.apartment || ""}
                      onChange={(e) =>
                        setOrder({ ...order, apartment: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={order.company || ""}
                      onChange={(e) =>
                        setOrder({ ...order, company: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={order.city}
                      onChange={(e) =>
                        setOrder({ ...order, city: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={order.postalCode}
                      onChange={(e) =>
                        setOrder({ ...order, postalCode: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={order.country}
                      onChange={(e) =>
                        setOrder({ ...order, country: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Order Notes
                    </label>
                    <textarea
                      rows={2}
                      value={order.orderNotice || ""}
                      onChange={(e) =>
                        setOrder({ ...order, orderNotice: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold px-6 py-2.5 text-sm"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>

              <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm space-y-4 h-fit">
                <h2 className="text-sm font-bold text-stone-900">
                  Ordered Items
                </h2>
                {order.products && order.products.length > 0 ? (
                  <ul className="divide-y divide-stone-100">
                    {order.products.map((item) => (
                      <li
                        key={item.id}
                        className="py-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Image
                            src={
                              item.product?.mainImage
                                ? `/${item.product.mainImage}`
                                : "/product_placeholder.jpg"
                            }
                            alt={item.product?.title || "Product"}
                            width={44}
                            height={44}
                            className="w-11 h-11 rounded-lg bg-canvas object-contain p-1 border border-stone-100"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/product/${item.product?.slug || ""}`}
                              className="text-xs font-bold text-stone-900 hover:text-teal-700 truncate block"
                            >
                              {item.product?.title || "Product"}
                            </Link>
                            <p className="text-[11px] text-stone-500">
                              Qty {item.quantity} × ${item.product?.price ?? 0}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-stone-900">
                          $
                          {(
                            (item.product?.price ?? 0) * item.quantity
                          ).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-500">No items recorded.</p>
                )}

                <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-700">
                    Order Total
                  </span>
                  <span className="text-lg font-extrabold text-stone-900">
                    ${Number(order.total).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSingleOrder;
