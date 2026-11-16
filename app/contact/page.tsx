"use client";
import React, { useState } from "react";
import { SectionTitle } from "@/components";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";
import {
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaClock,
  FaCircleCheck,
} from "react-icons/fa6";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Order & Shipping Question",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post("/api/contact", form);
      const data = await res.json();
      if (res.ok) {
        setSubmittedId(data.ticket?.id || "sent");
        toast.success("Message received! We'll reply shortly.");
        setForm({
          name: "",
          email: "",
          subject: "Order & Shipping Question",
          message: "",
        });
      } else {
        toast.error(data.error || "Please check your form details");
      }
    } catch (_) {
      toast.error("Network error sending message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="bg-slate-50 pb-20">
      <SectionTitle title="Contact Support" path="Home | Contact" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Details */}
        <div className="lg:col-span-5 space-y-4">
          {[
            {
              icon: <FaEnvelope className="text-blue-600" />,
              title: "Email Support",
              detail: "support@singitronic.com",
              sub: "Average response time under 4 hours",
            },
            {
              icon: <FaPhone className="text-blue-600" />,
              title: "Phone Hotline",
              detail: "+1 (800) 555-0194",
              sub: "Toll-free technical & order support",
            },
            {
              icon: <FaLocationDot className="text-blue-600" />,
              title: "Headquarters & Showroom",
              detail: "742 Innovation Drive, Austin, TX 78701",
              sub: "Authorized service & pickup center",
            },
            {
              icon: <FaClock className="text-blue-600" />,
              title: "Support Hours",
              detail: "24/7 Online · Mon–Sat 8am–8pm CST",
              sub: "Live specialists available every day",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-start gap-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {item.title}
                </h3>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {item.detail}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-7 sm:p-9 shadow-sm">
          {submittedId ? (
            <div className="py-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <FaCircleCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Message Sent!
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thanks for reaching out. Your support ticket{" "}
                <code className="font-mono font-bold text-slate-900">
                  #{submittedId.slice(0, 8)}
                </code>{" "}
                has been logged and our team will respond within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedId(null)}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-extrabold text-slate-900 mb-1">
                Send us a message
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Fill out the form below and our team will follow up directly by
                email.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Alex Morgan"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="alex@example.com"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Topic
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className={inputCls}
                  >
                    <option>Order &amp; Shipping Question</option>
                    <option>Product Recommendation</option>
                    <option>Warranty &amp; Returns</option>
                    <option>Account &amp; Password Help</option>
                    <option>Merchant Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Tell us how we can help (include your Order ID if applicable)..."
                    className={inputCls}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-8 py-3 text-sm shadow-sm transition-colors"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
