import { navigation } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaBolt } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-slate-950 text-slate-300 border-t border-slate-800"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand column */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <FaBolt className="w-4 h-4" />
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white">
                SINGI<span className="text-blue-400">TRONIC</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your trusted destination for flagship smartphones, pro laptops,
              cameras, studio audio, and smart electronics — backed by a 2-year
              warranty and fast global shipping.
            </p>
            <div className="text-xs text-slate-400 space-y-1 pt-1">
              <p>742 Innovation Drive, Austin, TX 78701</p>
              <p>
                <a
                  href="mailto:support@singitronic.com"
                  className="hover:text-white transition-colors"
                >
                  support@singitronic.com
                </a>{" "}
                ·{" "}
                <a
                  href="tel:+18005550194"
                  className="hover:text-white transition-colors"
                >
                  +1 (800) 555-0194
                </a>
              </p>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Shop
              </h3>
              <ul role="list" className="mt-4 space-y-2.5">
                {navigation.sale.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Explore
              </h3>
              <ul role="list" className="mt-4 space-y-2.5">
                {navigation.about.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Orders & Legal
              </h3>
              <ul role="list" className="mt-4 space-y-2.5">
                {navigation.buy.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Support
              </h3>
              <ul role="list" className="mt-4 space-y-2.5">
                {navigation.help.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
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
          <p className="text-xs text-slate-500">
            © {currentYear} Singitronic Electronics. All rights reserved.
          </p>
          <div className="flex items-center gap-2 bg-white/95 rounded-lg px-3 py-1.5">
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
