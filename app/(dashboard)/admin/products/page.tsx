"use client";
import { DashboardProductTable, DashboardSidebar } from "@/components";
import React from "react";

const DashboardProducts = () => {
  return (
    <div className="bg-slate-50 min-h-[80vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col xl:flex-row gap-6">
        <DashboardSidebar />
        <DashboardProductTable />
      </div>
    </div>
  );
};

export default DashboardProducts;
