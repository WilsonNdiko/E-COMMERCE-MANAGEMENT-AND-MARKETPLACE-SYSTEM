import React from "react";
import SectionTitle from "@/components/SectionTitle";

export default function PrivacyPage() {
  return (
    <div className="bg-canvas pb-20">
      <SectionTitle title="Privacy Policy" path="Home | Privacy Policy" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-10 shadow-sm space-y-6 text-sm text-stone-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">
              1. Information We Collect
            </h2>
            <p>
              We collect only the details necessary to process your orders,
              deliver customer support, and personalize your account — such as
              your name, email address, shipping address, and order history.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">
              2. How We Use Your Data
            </h2>
            <p>
              Your information is used solely to fulfill orders, send delivery
              notifications, manage warranty coverage, and (when you opt in)
              share product news and member discounts. We never sell customer
              data to third parties.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-stone-900">
              3. Security &amp; Your Rights
            </h2>
            <p>
              Passwords are stored using strong bcrypt hashing and all checkout
              traffic is transmitted over encrypted HTTPS. You may request
              access to, correction of, or deletion of your account data at any
              time by contacting support@singitronic.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
