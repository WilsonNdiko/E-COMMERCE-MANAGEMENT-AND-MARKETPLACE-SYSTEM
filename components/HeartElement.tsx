"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaRegHeart } from "react-icons/fa6";

const HeartElement = ({ wishQuantity }: { wishQuantity: number }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? wishQuantity : 0;

  return (
    <Link
      href="/wishlist"
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
      aria-label={`Wishlist (${count} items)`}
      title="Wishlist"
    >
      <FaRegHeart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 text-[11px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center shadow-sm">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
};

export default HeartElement;
