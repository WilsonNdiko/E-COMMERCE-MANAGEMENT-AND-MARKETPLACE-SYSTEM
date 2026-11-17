"use client";
import SectionTitle from "@/components/SectionTitle";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    const prefill = searchParams.get("email");
    if (prefill && !form.email) {
      setForm((prev) => ({ ...prev, email: prefill }));
    }
  }, [searchParams, form.email]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/");
    }
  }, [sessionStatus, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const email = form.email.replace(/\s+/g, "").toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      setError("Please enter a valid email address (for example: name@gmail.com).");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.acceptedTerms) {
      setError("Please accept the Terms of Use and Privacy Policy.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: form.password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Account created! Signing you in...");
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password: form.password,
        });
        if (!loginRes?.error) {
          router.push("/");
          router.refresh();
        } else {
          router.push(`/login?email=${encodeURIComponent(email)}`);
        }
      } else {
        const msg =
          Array.isArray(data.details) && data.details.length > 0
            ? data.details.map((err: any) => err.message).join(", ")
            : data.error || "Could not create account. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    } catch {
      setError("Network error creating your account. Please try again.");
      toast.error("Connection error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10";

  return (
    <div className="max-w-md mx-auto px-4 pt-10">
      <div className="bg-white rounded-3xl border border-stone-200/80 p-7 sm:p-9 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-stone-900">
            Create Your Account
          </h2>
          <p className="text-xs text-stone-500">
            Track deliveries, save favorites, and check out faster.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-stone-700 mb-1.5"
              >
                First Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="given-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Sarah"
                className={inputCls}
              />
            </div>
            <div>
              <label
                htmlFor="lastname"
                className="block text-xs font-semibold text-stone-700 mb-1.5"
              >
                Last Name
              </label>
              <input
                id="lastname"
                type="text"
                autoComplete="family-name"
                value={form.lastname}
                onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                placeholder="Kamau"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-stone-700 mb-1.5"
            >
              Email Address *
            </label>
            <input
              id="email"
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
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-stone-700 mb-1.5"
            >
              Password * <span className="text-stone-400 font-normal">(min. 6 characters)</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Create a password"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
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
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-stone-700 mb-1.5"
            >
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              placeholder="Re-enter your password"
              className={inputCls}
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600 pt-1">
            <input
              type="checkbox"
              checked={form.acceptedTerms}
              onChange={(e) =>
                setForm({ ...form, acceptedTerms: e.target.checked })
              }
              className="h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-600 mt-0.5"
            />
            <span>
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-teal-700 font-semibold hover:underline"
              >
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-teal-700 font-semibold hover:underline"
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
            {submitting ? "Creating Account..." : "Create Account"}
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
  );
}

const RegisterPage = () => {
  return (
    <div className="bg-canvas min-h-[75vh] pb-20">
      <SectionTitle title="Create Account" path="Home | Register" />
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-stone-500">
            Loading...
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
};

export default RegisterPage;
