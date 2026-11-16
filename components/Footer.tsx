import { navigation } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaBagShopping } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-sand text-stone-700 border-t border-stone-300/70"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-300/70">
          {/* Brand column */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-sm">
                <FaBagShopping className="w-4 h-4" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-stone-900">
                SINGI<span className="text-teal-700">TRONIC</span>
              </span>
            </Link>
            <p className="text-sm text-stone-600 leading-relaxed max-w-sm">
              Friendly everyday shopping for dependable home appliances, phones,
              laptops, audio, and gifts — backed by a 2-year warranty, simple
              returns, and fast doorstep delivery.
            </p>
            <div className="text-xs text-stone-600 space-y-1 pt-1">
              <p>742 Innovation Drive, Austin, TX 78701</p>
              <p>
                <a
                  href="mailto:support@singitronic.com"
                  className="hover:text-teal-800 font-medium transition-colors"
                >
                  support@singitronic.com
                </a>{" "}
                ·{" "}
                <a
                  href="tel:+18005550194"
                  className="hover:text-teal-800 font-medium transition-colors"
                >
                  +1 (800) 555-0194
                </a>
              </p>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Shop
              </h3>
              <ul role="list" className="mt-4 space-y-2.5">
                {navigation.sale.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-stone-600 hover:text-teal-800 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Explore
              </h3>
              <ul role="list" className="mt-4 space-y-2.5">
                {navigation.about.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-stone-600 hover:text-teal-800 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Orders &amp; Legal
              </h3>
              <ul role="list" className="mt-4 space-y-2.5">
                {navigation.buy.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-stone-600 hover:text-teal-800 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Help &amp; Care
              </h3>
              <ul role="list" className="mt-4 space-y-2.5">
                {navigation.help.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-stone-600 hover:text-teal-800 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500">
            © {currentYear} Singitronic Marketplace. All rights reserved.
          </p>
          <div className="flex items-center gap-2.5 bg-white border border-stone-200 rounded-xl px-3.5 py-1.5 shadow-sm">
            <Image src="/visa.svg" width={34} height={22} alt="Visa" className="h-4 w-auto" />
            <Image src="/mastercard.svg" width={34} height={22} alt="Mastercard" className="h-4 w-auto" />
            <Image src="/ae.svg" width={34} height={22} alt="Amex" className="h-4 w-auto" />
            <Image src="/paypal.svg" width={34} height={22} alt="PayPal" className="h-4 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
