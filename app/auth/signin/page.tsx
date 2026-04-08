"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, Loader2, Home, Sparkles } from "lucide-react";

// Simple auth check - same as dashboard
function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return document.cookie.includes('auth-token=');
}

export default function SimpleSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Don't check auth on mount - let middleware handle it
    // This prevents redirect loops
    setAuthChecked(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call direct login API
      const response = await fetch("/api/direct-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      console.log("Login successful, redirecting to dashboard");
      
      // API sets HttpOnly cookies — also set client-side copies for auth checks
      // Use data.user.id (correct field from API response)
      document.cookie = `auth-token=user-${data.user.id}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `user-email=${encodeURIComponent(data.user.email)}; path=/; max-age=2592000; SameSite=Lax`;
      
      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="h-10 w-10 rounded-xl bg-slate-800 animate-pulse mx-auto mb-4"></div>
          <div className="h-6 w-48 bg-slate-800 rounded animate-pulse mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
      </div>
      
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-500/30 border border-violet-400/40 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Home className="h-8 w-8 text-violet-300" />
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Welcome Back</h1>
          <p className="text-lg text-slate-400">Sign in to your Renovation Advisor account</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm animate-fade-in">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="p-10 rounded-3xl border border-white/20 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-3 text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-lg backdrop-blur-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-lg backdrop-blur-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/signup"
                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                Don't have an account?
              </Link>
              <Link
                href="#"
                className="text-slate-400 hover:text-slate-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-lg transition-all duration-500 hover:shadow-glow hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-center text-sm text-slate-400">
              By signing in, you agree to our{" "}
              <Link href="#" className="text-violet-400 hover:text-violet-300 font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-violet-400 hover:text-violet-300 font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors group"
          >
            <span className="h-5 w-5 rounded-full border border-slate-500 group-hover:border-slate-300 flex items-center justify-center">
              ←
            </span>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}