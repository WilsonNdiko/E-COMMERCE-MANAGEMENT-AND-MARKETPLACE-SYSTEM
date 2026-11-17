import React from "react";
import SectionTitle from "@/components/SectionTitle";

export default function TermsPage() {
  return (
    <div className="bg-canvas pb-20">
      <SectionTitle title="Terms of Use" path="Home | Terms of Use" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-10 shadow-sm space-y-6 text-sm text-stone-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">
              1. Orders &amp; Pricing
            </h2>
            <p>
              All prices listed on Singitronic are shown in USD. Orders are
              confirmed upon submission and subject to stock availability. In
              the rare event of an inventory discrepancy, we notify you promptly
              with a full refund or replacement option.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">
              2. Shipping, Returns &amp; Warranty
            </h2>
            <p>
              Unused items in original packaging may be returned within 30 days
              of delivery for a full refund. Hardware defects are covered for 24
              months under our standard manufacturer warranty.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">
              3. Account Responsibility
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              login credentials and for all activity conducted under your
              account. Contact our team immediately if you suspect unauthorized
              access.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
