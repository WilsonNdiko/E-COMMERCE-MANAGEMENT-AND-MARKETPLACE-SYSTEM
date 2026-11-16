"use client";
import React, { useState } from "react";
import Link from "next/link";
import { SectionTitle } from "@/components";
import { FaChevronDown, FaMagnifyingGlass } from "react-icons/fa6";

const FAQS = [
  {
    q: "How fast is shipping and how much does it cost?",
    a: "All orders over $150 qualify for FREE Express Shipping. Orders under $150 ship for a flat $10 rate. In-stock items leave our warehouse within 24 hours with full tracking.",
  },
  {
    q: "How can I track my order?",
    a: "Visit our Orders & Tracking page (/orders) and enter your Order ID or email address. If you're signed in, all of your orders appear automatically along with status updates.",
  },
  {
    q: "Are there any active promo codes?",
    a: "Yes! Enter SAVE10 for 10% off, TECH15 for 15% off, WELCOME20 for 20% off your first order, or FREESHIP for complimentary shipping right in your cart or checkout.",
  },
  {
    q: "What is your return and warranty policy?",
    a: "Every item comes with a 30-day hassle-free return window and a 2-year official manufacturer hardware warranty covering defects in materials and workmanship.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Visa, Mastercard, American Express, and convenient Pay on Delivery (cash or card upon courier arrival).",
  },
  {
    q: "Do I need an account to place an order?",
    a: "No, guest checkout is supported! Creating a free account lets you sync your wishlist across devices, receive instant order notifications, and view full order history.",
  },
];

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = FAQS.filter(
    (item) =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-50 pb-20">
      <SectionTitle title="Frequently Asked Questions" path="Home | FAQ" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        <div className="relative">
          <FaMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions (shipping, returns, promo codes)..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((item, idx) => {
            const open = openIndex === idx;
            return (
              <div
                key={item.q}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {item.q}
                  </span>
                  <FaChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                      open ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                {open && (
                  <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center space-y-2">
          <p className="text-sm font-bold text-slate-900">
            Still have a question?
          </p>
          <p className="text-xs text-slate-500">
            Our specialists are ready to help around the clock.
          </p>
          <Link
            href="/contact"
            className="inline-block mt-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
