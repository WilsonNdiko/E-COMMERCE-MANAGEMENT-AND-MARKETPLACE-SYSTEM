export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Breadcrumb, Filters, Products, SortBy } from "@/components";
import React from "react";
import { sanitize } from "@/lib/sanitize";

const improveCategoryText = (text: string): string =>
  decodeURIComponent(text).replace(/-/g, " ");

const ShopPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const awaitedParams = await params;
  const awaitedSearchParams = await searchParams;
  const heading =
    awaitedParams?.slug && awaitedParams.slug[0]?.length > 0
      ? sanitize(improveCategoryText(awaitedParams.slug[0]))
      : "All Electronics";

  return (
    <div className="bg-canvas min-h-[75vh] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb />

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          <Filters />

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-stone-200/80">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 capitalize">
                {heading}
              </h1>
              <SortBy />
            </div>

            <Products
              params={awaitedParams}
              searchParams={awaitedSearchParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
