import Link from "next/link";
import React from "react";
import { FaArrowRight, FaTag } from "react-icons/fa6";

const IntroducingSection = () => {
  return (
    <section className="py-14 sm:py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 px-6 py-12 sm:px-12 sm:py-16 shadow-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                <FaTag className="w-3 h-3" />
                <span>Season Tech Event</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Upgrade Your Setup with Singitronic
              </h2>
              <p className="text-blue-100 text-base sm:text-lg">
                Save up to 20% on workstation laptops, noise-cancelling
                headphones, and creator gear. Apply promo code{" "}
                <span className="font-mono font-bold text-white bg-white/15 px-2 py-0.5 rounded">
                  WELCOME20
                </span>{" "}
                at checkout.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-slate-100 text-blue-700 font-bold px-6 py-3.5 text-sm shadow-md transition-colors"
              >
                <span>Shop the Collection</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop/laptops"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-6 py-3.5 text-sm transition-colors"
              >
                <span>Browse Laptops</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroducingSection;
