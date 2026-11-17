import { incentives } from "@/lib/utils";
import Image from "next/image";
import React from "react";

const Incentives = () => {
  return (
    <section className="bg-canvas pt-10 pb-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {incentives.map((incentive) => (
            <div
              key={incentive.name}
              className="flex items-start gap-4 p-5 rounded-2xl bg-ivory border border-stone-200/80 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-sage border border-teal-800/10 flex items-center justify-center shrink-0">
                <Image
                  width={28}
                  height={28}
                  className="w-7 h-7 object-contain"
                  src={incentive.imageSrc}
                  alt={incentive.name}
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  {incentive.name}
                </h3>
                <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                  {incentive.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Incentives;
