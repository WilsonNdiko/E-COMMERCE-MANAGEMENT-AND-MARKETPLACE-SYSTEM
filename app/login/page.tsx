"use client";
import SectionTitle from "@/components/SectionTitle";
import { isValidEmailAddressFormat } from "@/lib/utils";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa6";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus }: any = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showResetHelp, setShowResetHelp] = useState(false);

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setError("Your session expired. Please sign in again.");
    }
    if (sessionStatus === "authenticated") {
      const next =
        searchParams.get("callbackUrl") ||
        (session?.user?.role === "admin" ? "/admin" : "/");
      router.replace(next);
    }
  }, [sessionStatus, session?.user?.role, router, searchParams]);

  const signInWith = async (targetEmail: string, targetPassword: string) => {
    setError("");
    const cleanEmail = targetEmail.replace(/\s+/g, "").toLowerCase();

    if (!isValidEmailAddressFormat(cleanEmail)) {
      setError("Please enter a valid email address (e.g. name@example.com).");
      toast.error("Please enter a valid email address");
      return;
    }
    if (!targetPassword) {
      setError("Please enter your password.");
      toast.error("Please enter your password");
      return;
    }

    setSubmitting(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: cleanEmail,
        password: targetPassword,
      });

      if (res?.error) {
        setError(
          "Incorrect email or password. If you don't have an account yet, click 'Create one free' below — or use the Demo Admin Login button."
        );
        toast.error("Incorrect email or password");
      } else {
        toast.success("Welcome back!");
        const next =
          searchParams.get("callbackUrl") ||
          (cleanEmail === "admin@singitronic.com" ? "/admin" : "/");
        router.push(next);
        router.refresh();
      }
    } catch {
      setError("Unable to reach the sign-in service. Please try again.");
      toast.error("Sign-in error — please retry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWith(email, password);
  };

  const loginAsDemoAdmin = async () => {
    setEmail("admin@singitronic.com");
    setPassword("Admin123!");
    await signInWith("admin@singitronic.com", "Admin123!");
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-10 pb-20 space-y-5">
      <div className="bg-white rounded-3xl border border-stone-200/80 p-7 sm:p-9 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-stone-900">
            Welcome back
          </h2>
          <p className="text-xs text-stone-500">
            Sign in to track orders, view your wishlist, or open the admin dashboard.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs font-medium text-rose-700 leading-relaxed">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-stone-700 mb-1.5"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@singitronic.com"
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-stone-700"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowResetHelp((v) => !v)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-stone-200 pl-3.5 pr-10 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
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

          {showResetHelp && (
            <div className="rounded-xl bg-canvas border border-stone-200 p-3 text-xs text-stone-600 space-y-1">
              <p>
                <strong>Demo Admin:</strong>{" "}
                <code className="text-teal-800">admin@singitronic.com</code> /{" "}
                <code className="text-teal-800">Admin123!</code>
              </p>
              <p>
                Need help with a customer account? Visit our{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-teal-700 underline"
                >
                  Support page
                </Link>
                .
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold py-3 text-sm shadow-sm transition-colors"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* One-Click Demo Admin Login */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          <button
            type="button"
            disabled={submitting}
            onClick={loginAsDemoAdmin}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 disabled:opacity-60 px-4 py-2.5 text-xs font-semibold text-teal-800 transition-colors"
          >
            <FaKey className="w-3.5 h-3.5" />
            <span>One-Click Admin Sign In (admin@singitronic.com)</span>
          </button>
          <p className="text-center text-[11px] text-stone-400">
            Admin credentials: admin@singitronic.com · Admin123!
          </p>
        </div>

        <p className="text-center text-xs text-stone-500">
          Signing in with your own email?{" "}
          <Link
            href="/register"
            className="font-bold text-teal-700 hover:text-teal-800"
          >
            Create an account free
          </Link>
        </p>
      </div>
    </div>
  );
}

const LoginPage = () => {
  return (
    <div className="bg-canvas min-h-[75vh]">
      <SectionTitle title="Sign In" path="Home | Sign In" />
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-stone-500">
            Loading...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default LoginPage;
