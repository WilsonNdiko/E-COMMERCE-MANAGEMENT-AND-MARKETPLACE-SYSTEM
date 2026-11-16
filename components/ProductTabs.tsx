"use client";

import React, { useEffect, useState, useCallback } from "react";
import { formatCategoryName } from "@/utils/categoryFormating";
import { sanitize, sanitizeHtml } from "@/lib/sanitize";
import apiClient from "@/lib/api";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FaStar, FaCircleCheck } from "react-icons/fa6";

interface ReviewStats {
  reviews: Review[];
  total: number;
  average: number;
  breakdown: Record<number, number>;
}

const ProductTabs = ({ product }: { product: Product }) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">(
    "desc"
  );
  const [reviewData, setReviewData] = useState<ReviewStats>({
    reviews: [],
    total: 0,
    average: product.rating || 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review form state
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.email && !author) {
      setAuthor(session.user.email.split("@")[0]);
    }
  }, [session?.user?.email, author]);

  const fetchReviews = useCallback(async () => {
    if (!product?.id) return;
    setLoadingReviews(true);
    try {
      const res = await apiClient.get(`/api/reviews/product/${product.id}`);
      if (res.ok) {
        const data = await res.json();
        setReviewData(data);
      }
    } catch (_) {
    } finally {
      setLoadingReviews(false);
    }
  }, [product?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (author.trim().length < 2) {
      toast.error("Please enter your name");
      return;
    }
    if (comment.trim().length < 5) {
      toast.error("Please write a short review (at least 5 characters)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post(`/api/reviews/product/${product.id}`, {
        author: author.trim(),
        email: session?.user?.email || undefined,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Thank you! Your review has been published.");
        setTitle("");
        setComment("");
        setRating(5);
        fetchReviews();
      } else {
        toast.error(data.error || "Could not submit review");
      }
    } catch (_) {
      toast.error("Network error while submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  const sku = `SNG-${String(product.id).slice(0, 6).toUpperCase()}`;

  const tabs = [
    { id: "desc" as const, label: "Overview" },
    { id: "specs" as const, label: "Specifications" },
    {
      id: "reviews" as const,
      label: `Customer Reviews (${reviewData.total})`,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Tab Bar */}
      <div
        role="tablist"
        className="flex border-b border-slate-200 overflow-x-auto px-4 sm:px-8 bg-slate-50/60"
      >
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 sm:px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6 sm:p-8">
        {activeTab === "desc" && (
          <div className="max-w-3xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              About {sanitize(product.title)}
            </h3>
            <div
              className="text-sm sm:text-base text-slate-600 leading-relaxed prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(product?.description || ""),
              }}
            />
          </div>
        )}

        {activeTab === "specs" && (
          <div className="max-w-2xl">
            <dl className="divide-y divide-slate-100 text-sm">
              {[
                { label: "Manufacturer", value: sanitize(product.manufacturer) },
                {
                  label: "Category",
                  value: product.category?.name
                    ? sanitize(formatCategoryName(product.category.name))
                    : "Electronics",
                },
                { label: "SKU", value: sku },
                {
                  label: "Sold & Fulfilled By",
                  value:
                    product.merchant?.name || "Singitronic Official Store",
                },
                {
                  label: "Availability",
                  value:
                    product.inStock > 0
                      ? `In Stock (${product.inStock} units ready to ship)`
                      : "Out of Stock",
                },
                {
                  label: "Warranty",
                  value: "2-Year Manufacturer Hardware Warranty",
                },
                {
                  label: "Return Policy",
                  value: "30-Day Hassle-Free Returns",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4"
                >
                  <dt className="font-semibold text-slate-500">{row.label}</dt>
                  <dd className="sm:col-span-2 font-medium text-slate-900 capitalize">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Summary + Write a Review */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-extrabold text-slate-900">
                    {reviewData.total > 0
                      ? reviewData.average.toFixed(1)
                      : `${product.rating || 5}.0`}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar
                          key={i}
                          className={`w-4 h-4 ${
                            i <
                            Math.round(
                              reviewData.total > 0
                                ? reviewData.average
                                : product.rating || 5
                            )
                              ? "text-amber-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Based on {reviewData.total}{" "}
                      {reviewData.total === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </div>

                {/* Rating breakdown bars */}
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewData.breakdown[star] || 0;
                    const pct =
                      reviewData.total > 0
                        ? Math.round((count / reviewData.total) * 100)
                        : 0;
                    return (
                      <div
                        key={star}
                        className="flex items-center gap-2.5 text-xs"
                      >
                        <span className="w-10 font-medium text-slate-600">
                          {star} star
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-7 text-right text-slate-400">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write a review form */}
              <form
                onSubmit={handleSubmitReview}
                className="rounded-2xl border border-slate-200 p-5 space-y-4"
              >
                <h4 className="text-base font-bold text-slate-900">
                  Write a Review
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none"
                        aria-label={`Rate ${star} stars`}
                      >
                        <FaStar
                          className={`w-6 h-6 transition-colors ${
                            star <= rating
                              ? "text-amber-400"
                              : "text-slate-200 hover:text-amber-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="review-author"
                    className="block text-xs font-semibold text-slate-600 mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    id="review-author"
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="review-title"
                    className="block text-xs font-semibold text-slate-600 mb-1"
                  >
                    Headline (optional)
                  </label>
                  <input
                    id="review-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Great performance & build quality"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="review-comment"
                    className="block text-xs font-semibold text-slate-600 mb-1"
                  >
                    Your Review
                  </label>
                  <textarea
                    id="review-comment"
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share what you liked or disliked about this product..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 text-sm transition-colors"
                >
                  {submitting ? "Publishing..." : "Submit Review"}
                </button>
              </form>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-7 space-y-4">
              {loadingReviews ? (
                <p className="text-sm text-slate-500 py-8 text-center">
                  Loading reviews...
                </p>
              ) : reviewData.reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    No customer reviews yet
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Be the first to share your experience with this product!
                  </p>
                </div>
              ) : (
                reviewData.reviews.map((rev) => (
                  <article
                    key={rev.id}
                    className="rounded-2xl border border-slate-200/80 p-5 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {rev.author}
                          </span>
                          {rev.verified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              <FaCircleCheck className="w-2.5 h-2.5" />
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <FaStar
                              key={idx}
                              className={`w-3.5 h-3.5 ${
                                idx < rev.rating
                                  ? "text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <time className="text-xs text-slate-400 shrink-0">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    {rev.title && (
                      <h5 className="text-sm font-bold text-slate-900">
                        {rev.title}
                      </h5>
                    )}
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {rev.comment}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
