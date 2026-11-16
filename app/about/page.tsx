import React from "react";
import Link from "next/link";
import { SectionTitle } from "@/components";
import {
  FaShieldHalved,
  FaTruckFast,
  FaHeadset,
  FaAward,
  FaArrowRight,
} from "react-icons/fa6";

export default function AboutPage() {
  const stats = [
    { label: "Happy Customers", value: "50,000+" },
    { label: "Authorized Brands", value: "35+" },
    { label: "Warranty Coverage", value: "2 Years" },
    { label: "Dispatch Speed", value: "< 24 hrs" },
  ];

  const pillars = [
    {
      icon: <FaAward className="w-5 h-5 text-blue-600" />,
      title: "100% Authentic Electronics",
      desc: "Every smartphone, laptop, camera, and audio device is sourced directly from authorized brand distributors.",
    },
    {
      icon: <FaTruckFast className="w-5 h-5 text-blue-600" />,
      title: "Fast, Insured Fulfillment",
      desc: "Orders ship within one business day in shock-tested packaging with end-to-end courier tracking.",
    },
    {
      icon: <FaShieldHalved className="w-5 h-5 text-blue-600" />,
      title: "2-Year Warranty & 30-Day Returns",
      desc: "Shop confidently knowing every purchase includes a full 2-year hardware warranty and easy 30-day returns.",
    },
    {
      icon: <FaHeadset className="w-5 h-5 text-blue-600" />,
      title: "Dedicated Tech Specialists",
      desc: "Real hardware enthusiasts ready to help compare specs, set up your gear, or handle warranty replacements.",
    },
  ];

  return (
    <div className="bg-slate-50 pb-20">
      <SectionTitle title="About Singitronic" path="Home | About" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-6">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Our Mission
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 max-w-3xl">
            Making flagship technology accessible, reliable, and effortless to
            buy.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Founded for creators, engineers, students, and everyday tech lovers,
            Singitronic curates carefully tested consumer electronics with
            transparent pricing and zero guesswork. Instead of overwhelming you
            with thousands of knockoffs, we stock products we actually stand
            behind.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-slate-50 border border-slate-100 p-5"
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                  {s.value}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-3xl border border-slate-200/80 p-7 shadow-sm space-y-3"
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                {p.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-extrabold">Ready to explore?</h3>
            <p className="text-sm text-slate-300 mt-1">
              Browse our full catalog or reach out to our team with any question.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-3 text-sm transition-colors"
            >
              <span>Shop Now</span>
              <FaArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="rounded-xl bg-white/10 hover:bg-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
