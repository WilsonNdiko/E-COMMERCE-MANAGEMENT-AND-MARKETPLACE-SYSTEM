"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaBagShopping } from "react-icons/fa6";
import { useProductStore } from "@/app/_zustand/store";

const CartElement = () => {
  const { allQuantity, total } = useProductStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const qty = mounted ? allQuantity : 0;
  const subtotal = mounted ? total : 0;

  return (
    <Link
      href="/cart"
      className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white transition-colors shadow-sm"
      aria-label={`Shopping cart (${qty} items)`}
    >
      <div className="relative">
        <FaBagShopping className="w-4 h-4" />
        {qty > 0 && (
          <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-blue-500 text-white rounded-full flex items-center justify-center ring-2 ring-slate-900">
            {qty > 99 ? "99+" : qty}
          </span>
        )}
      </div>
      <span className="hidden sm:inline text-xs font-semibold pl-1">
        ${subtotal.toLocaleString()}
      </span>
    </Link>
  );
};

export default CartElement;
