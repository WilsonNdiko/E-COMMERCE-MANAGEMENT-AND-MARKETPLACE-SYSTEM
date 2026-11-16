import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-slate-50 min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-14 max-w-lg w-full text-center shadow-sm space-y-5">
        <span className="inline-block rounded-full bg-blue-50 text-blue-600 px-3.5 py-1 text-xs font-extrabold tracking-wider">
          404 ERROR
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Page not found
        </h1>
        <p className="text-sm text-slate-500">
          We couldn&apos;t locate the page or product you&apos;re looking for. It
          may have moved or sold out.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 text-sm transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-2.5 text-sm transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
