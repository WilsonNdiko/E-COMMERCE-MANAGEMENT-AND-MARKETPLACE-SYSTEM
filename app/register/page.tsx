"use client";
import SectionTitle from "@/components/SectionTitle";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const RegisterPage = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/");
    }
  }, [sessionStatus, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long");
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
    if (!form.acceptedTerms) {
      setError("Please accept the Terms of Use and Privacy Policy");
      toast.error("Please accept the Terms of Use");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: form.password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Account created! Signing you in...");
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password: form.password,
        });
        if (!loginRes?.error) {
          router.push("/");
        } else {
          router.push("/login");
        }
      } else {
        const msg =
          Array.isArray(data.details) && data.details.length > 0
            ? data.details.map((err: any) => err.message).join(", ")
            : data.error || "Registration failed";
        setError(msg);
        toast.error(msg);
      }
    } catch (_) {
      setError("Network error. Please try again.");
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10";

  return (
    <div className="bg-canvas min-h-[75vh] pb-20">
      <SectionTitle title="Create Account" path="Home | Register" />

      <div className="max-w-md mx-auto px-4 pt-10">
        <div className="bg-white rounded-3xl border border-stone-200/80 p-7 sm:p-9 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-stone-900">
              Join Singitronic
            </h2>
            <p className="text-xs text-stone-500">
              Track orders, sync your wishlist, and get member-only deals.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={form.lastname}
                  onChange={(e) =>
                    setForm({ ...form, lastname: e.target.value })
                  }
                  placeholder="Morgan"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Password (min. 8 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Create a strong password"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-4 h-4" />
                  ) : (
                    <FaEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                placeholder="Repeat your password"
                className={inputCls}
              />
            </div>

            <label className="flex items-start gap-2.5 text-xs text-stone-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.acceptedTerms}
                onChange={(e) =>
                  setForm({ ...form, acceptedTerms: e.target.checked })
                }
                className="checkbox checkbox-xs rounded mt-0.5"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-teal-700 hover:underline"
                >
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-teal-700 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold py-3 text-sm shadow-sm transition-colors"
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-stone-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-teal-700 hover:text-teal-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
