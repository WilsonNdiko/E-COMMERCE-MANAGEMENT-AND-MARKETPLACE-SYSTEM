"use client";
import React, { useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/api";
import toast from "react-hot-toast";
import { FaCircleCheck, FaPaperPlane } from "react-icons/fa6";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribedMsg, setSubscribedMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post("/api/newsletter", {
        email: email.trim(),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribedMsg(
          data.message ||
            "Subscribed! Use code SAVE10 for 10% off your next order."
        );
        toast.success("Subscribed to Singitronic updates!");
        setEmail("");
      } else {
        toast.error(data.error || "Please enter a valid email address");
      }
    } catch (_) {
      toast.error("Could not subscribe right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white border-t border-slate-200/80 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
          <div className="lg:col-span-7 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Stay in the Loop
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Get launch alerts & member-only tech deals
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              Join our weekly digest for early access to new arrivals, price
              drops, and an instant 10% welcome coupon.
            </p>
          </div>

          <div className="lg:col-span-5">
            {subscribedMsg ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
                <FaCircleCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    {subscribedMsg}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubscribedMsg(null)}
                    className="text-xs text-emerald-700 underline mt-1"
                  >
                    Subscribe another email
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors"
                  >
                    <FaPaperPlane className="w-3.5 h-3.5" />
                    <span>{submitting ? "Joining..." : "Subscribe"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  No spam, unsubscribe anytime. Read our{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-slate-700 hover:text-blue-600 underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
