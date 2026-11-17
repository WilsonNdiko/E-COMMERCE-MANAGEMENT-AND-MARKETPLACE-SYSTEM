"use client";
import SectionTitle from "@/components/SectionTitle";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaKey, FaUser } from "react-icons/fa6";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus }: any = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [unregisteredEmail, setUnregisteredEmail] = useState("");

  useEffect(() => {
    const prefill = searchParams.get("email");
    if (prefill && !email) setEmail(prefill);
  }, [searchParams, email]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      const next =
        searchParams.get("callbackUrl") ||
        (session?.user?.role === "admin" ? "/admin" : "/");
      router.replace(next);
    }
  }, [sessionStatus, session?.user?.role, router, searchParams]);

  const signInWith = async (targetEmail: string, targetPassword: string) => {
    setError("");
    setUnregisteredEmail("");
    const cleanEmail = targetEmail.replace(/\s+/g, "").toLowerCase();

    if (!cleanEmail || !EMAIL_RE.test(cleanEmail)) {
      setError("Please enter a valid email address (for example: name@gmail.com).");
      return;
    }
    if (!targetPassword) {
      setError("Please enter your password.");
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
        if (res.error === "NO_ACCOUNT") {
          setUnregisteredEmail(cleanEmail);
          setError(`No account is registered with "${cleanEmail}" yet.`);
          toast.error("Account not found — create one in seconds!");
        } else if (res.error === "WRONG_PASSWORD") {
          setError("Incorrect password. Please double-check and try again.");
          toast.error("Incorrect password");
        } else {
          setError("Sign-in failed. Please check your details and try again.");
          toast.error("Sign-in failed");
        }
      } else {
        toast.success("Signed in successfully!");
        const dest =
          searchParams.get("callbackUrl") ||
          (cleanEmail === "admin@singitronic.com" ? "/admin" : "/");
        router.push(dest);
        router.refresh();
      }
    } catch {
      setError("Could not reach the sign-in server. Make sure the app is running.");
      toast.error("Connection error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWith(email, password);
  };

  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    await signInWith(demoEmail, demoPassword);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-10 pb-20">
      <div className="bg-white rounded-3xl border border-stone-200/80 p-7 sm:p-9 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-stone-900">
            Welcome back
          </h2>
          <p className="text-xs text-stone-500">
            Sign in to view orders, saved items, or manage your store.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-medium text-rose-700 space-y-2">
            <p>{error}</p>
            {unregisteredEmail && (
              <Link
                href={`/register?email=${encodeURIComponent(unregisteredEmail)}`}
                className="inline-flex items-center rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold px-3 py-1.5 text-xs transition-colors"
              >
                Create account with {unregisteredEmail} →
              </Link>
            )}
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
              placeholder="you@example.com"
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/10"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-stone-700 mb-1.5"
            >
              Password
            </label>
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold py-3 text-sm shadow-sm transition-colors"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="pt-4 border-t border-stone-100 space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 text-center">
            Quick Demo Access
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => quickLogin("admin@singitronic.com", "Admin123!")}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/70 disabled:opacity-60 px-3 py-2.5 text-xs font-semibold text-teal-800 transition-colors"
            >
              <FaKey className="w-3 h-3" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                quickLogin("sarah.kamau@example.com", "Customer123!")
              }
              className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-canvas hover:bg-sand disabled:opacity-60 px-3 py-2.5 text-xs font-semibold text-stone-800 transition-colors"
            >
              <FaUser className="w-3 h-3 text-teal-700" />
              <span>Customer Demo</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-stone-500">
          New to Singitronic?{" "}
          <Link
            href="/register"
            className="font-bold text-teal-700 hover:text-teal-800"
          >
            Create a free account
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
