import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  FaArrowRight,
  FaCube,
  FaShieldHalved,
  FaTruckFast,
  FaStar,
} from "react-icons/fa6";

const Hero = () => {
  return (
    <section className="bg-sage border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-22">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-12">
          {/* Left Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-teal-800/15 px-4 py-1.5 text-xs font-semibold text-teal-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Welcome Offer · Enjoy 10% Off with Code SAVE10</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.1] text-stone-900">
              Quality Essentials for{" "}
              <span className="text-teal-800">Home, Work &amp; Everyday Life</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Shop thoughtfully selected home appliances, phones, laptops,
              cameras, and everyday gadgets — easy to browse, preview in 360° 3D,
              and delivered right to your door with a 2-year warranty.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold px-7 py-3.5 text-sm sm:text-base shadow-sm hover:-transtone-y-0.5 transition-all"
              >
                <span>Start Shopping</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/product/smart-watch-demo?view=3d"
                className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-ivory border border-stone-300/90 text-stone-800 font-semibold px-6 py-3.5 text-sm sm:text-base shadow-sm hover:-transtone-y-0.5 transition-all"
              >
                <FaCube className="w-4 h-4 text-teal-700" />
                <span>Try 3D Product View</span>
              </Link>
            </div>

            {/* Friendly Buyer Trust Strip */}
            <div className="pt-6 border-t border-teal-900/10 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 text-xs sm:text-sm font-medium text-stone-700">
              <div className="flex items-center gap-2">
                <FaTruckFast className="text-teal-700 w-4 h-4" />
                <span>Free Delivery Over $150</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldHalved className="text-teal-700 w-4 h-4" />
                <span>2-Year Easy Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <FaStar className="text-amber-500 w-4 h-4" />
                <span>4.9/5 Happy Shoppers</span>
              </div>
            </div>
          </div>

          {/* Right Clean Warm Showcase Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="group w-full max-w-md rounded-3xl bg-white border border-stone-200/90 p-7 sm:p-8 flex flex-col items-center shadow-lg shadow-stone-900/5 hover:border-teal-600/40 transition-all">
              <div className="w-full flex items-center justify-between mb-3">
                <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-xs font-semibold text-amber-800">
                  Bestseller Pick
                </span>
                <Link
                  href="/product/smart-watch-demo?view=3d"
                  className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 hover:bg-teal-700 border border-teal-200 hover:border-teal-700 px-3 py-0.5 text-xs font-semibold text-teal-800 hover:text-white transition-colors"
                >
                  <FaCube className="w-3 h-3" />
                  <span>360° 3D</span>
                </Link>
              </div>

              <Link
                href="/product/smart-watch-demo"
                className="w-full rounded-2xl bg-canvas py-6 px-4 flex items-center justify-center"
              >
                <Image
                  src="/watch for banner.png"
                  width={300}
                  height={300}
                  priority
                  alt="Galaxy Watch Ultra Titanium"
                  className="w-56 sm:w-64 h-auto object-contain animate-hero-float group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              <div className="w-full mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-stone-500">
                    Everyday Smart Wearable
                  </p>
                  <Link
                    href="/product/smart-watch-demo"
                    className="text-base font-bold text-stone-900 hover:text-teal-700 transition-colors"
                  >
                    Galaxy Watch Ultra Titanium
                  </Link>
                </div>
                <span className="text-2xl font-extrabold text-teal-800">
                  $399
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
