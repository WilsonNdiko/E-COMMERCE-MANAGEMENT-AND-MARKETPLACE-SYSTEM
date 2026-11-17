import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-canvas min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="bg-white rounded-3xl border border-stone-200/80 p-10 sm:p-14 max-w-lg w-full text-center shadow-sm space-y-5">
        <span className="inline-block rounded-full bg-teal-50 text-teal-700 px-3.5 py-1 text-xs font-extrabold tracking-wider">
          404 ERROR
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
          Page not found
        </h1>
        <p className="text-sm text-stone-500">
          We couldn&apos;t locate the page or product you&apos;re looking for. It
          may have moved or sold out.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-2.5 text-sm transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="rounded-xl border border-stone-200 hover:bg-canvas text-stone-700 font-semibold px-6 py-2.5 text-sm transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
