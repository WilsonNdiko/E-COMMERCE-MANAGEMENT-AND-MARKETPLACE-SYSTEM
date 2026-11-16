import Link from "next/link";
import React from "react";
import { FaArrowRight, FaTag } from "react-icons/fa6";

const IntroducingSection = () => {
  return (
    <section className="py-12 sm:py-16 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-sand border border-stone-300/60 px-6 py-11 sm:px-12 sm:py-14 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-semibold text-amber-800">
                <FaTag className="w-3 h-3 text-amber-600" />
                <span>Special Seasonal Savings</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
                Thoughtful Finds for Every Room &amp; Routine
              </h2>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Enjoy up to 20% off kitchen helpers, family tablets, headphones,
                and everyday favorites. Enter code{" "}
                <span className="font-mono font-bold text-teal-800 bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                  WELCOME20
                </span>{" "}
                at checkout.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-3.5 text-sm shadow-sm transition-colors"
              >
                <span>Browse All Deals</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-ivory border border-stone-300/80 text-stone-800 font-semibold px-6 py-3.5 text-sm transition-colors"
              >
                <span>How Ordering Works</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroducingSection;
