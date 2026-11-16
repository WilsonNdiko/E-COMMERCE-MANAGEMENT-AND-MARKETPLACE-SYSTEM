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
    <section className="relative overflow-hidden bg-slate-950 text-white bg-hero-grid">
      {/* Subtle layered ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-10 h-[380px] w-[380px] rounded-full bg-cyan-500/15 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
          {/* Left Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 border border-blue-400/30 px-3.5 py-1 text-xs font-semibold text-blue-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Interactive 3D Showroom · Save 10% with SAVE10</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white">
              Next-Gen Tech,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300">
                Engineered for Everyday Life
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Explore precision wearables, pro laptops, mirrorless cameras, and
              studio-grade audio — inspect every device in interactive 360° 3D,
              backed by a 2-year official warranty.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3.5 text-sm sm:text-base shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 transition-all"
              >
                <span>Shop All Products</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/product/smart-watch-demo?view=3d"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-6 py-3.5 text-sm sm:text-base backdrop-blur-sm hover:-translate-y-0.5 transition-all"
              >
                <FaCube className="w-4 h-4 text-cyan-300" />
                <span>Inspect Watch in 3D</span>
              </Link>
            </div>

            {/* Trust pills */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <FaTruckFast className="text-blue-400 w-4 h-4" />
                <span>Free Shipping $150+</span>
              </div>
              <div className="flex items-center gap-2">
                <FaShieldHalved className="text-blue-400 w-4 h-4" />
                <span>2-Year Official Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <FaStar className="text-amber-400 w-4 h-4" />
                <span>4.9/5 Verified Reviews</span>
              </div>
            </div>
          </div>

          {/* Right Product Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="group relative w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-800/80 to-slate-900/95 border border-slate-700/70 p-8 flex flex-col items-center shadow-2xl hover:border-blue-500/60 transition-all backdrop-blur-sm">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                  Featured Release
                </span>
                <Link
                  href="/product/smart-watch-demo?view=3d"
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 hover:bg-blue-500/35 border border-blue-400/30 px-3 py-0.5 text-xs font-semibold text-blue-200 transition-colors"
                >
                  <FaCube className="w-3 h-3" />
                  <span>360° 3D</span>
                </Link>
              </div>

              <Link
                href="/product/smart-watch-demo"
                className="py-2 flex items-center justify-center"
              >
                <Image
                  src="/watch for banner.png"
                  width={320}
                  height={320}
                  priority
                  alt="Galaxy Watch Ultra Titanium"
                  className="w-60 sm:w-72 h-auto object-contain drop-shadow-[0_24px_36px_rgba(37,99,235,0.28)] animate-hero-float group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              <div className="w-full mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Samsung · Wearables
                  </p>
                  <Link
                    href="/product/smart-watch-demo"
                    className="text-base font-bold text-white hover:text-blue-300 transition-colors"
                  >
                    Galaxy Watch Ultra Titanium
                  </Link>
                </div>
                <span className="text-2xl font-extrabold text-blue-400">
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
