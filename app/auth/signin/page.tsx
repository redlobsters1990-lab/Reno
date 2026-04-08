"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, Loader2, Home, ArrowLeft } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-b from-background to-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="h-10 w-10 rounded-xl bg-slate-800 animate-pulse mx-auto mb-4"></div>
          <div className="h-6 w-48 bg-slate-800 rounded animate-pulse mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-950 flex items-center justify-center p-6">
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary-500/10 blur-3xl" />
      </div>
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary-500/30 to-secondary-500/30 border border-primary-400/40 flex items-center justify-center mx-auto mb-6 shadow-glow-sm">
            <Home className="h-8 w-8 text-primary-300" />
          </div>
          <h1 className="text-h1 font-bold mb-4">Welcome Back</h1>
          <p className="text-body text-text-secondary">Sign in to your Renovation Advisor account</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert-error mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="input-label">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                <input
                  id="email"
                  type="email"
                  className="input pl-12"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  aria-describedby="email-description"
                />
              </div>
              <p id="email-description" className="sr-only">
                Enter your email address to sign in
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="input-label">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                <input
                  id="password"
                  type="password"
                  className="input pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  aria-describedby="password-description"
                />
              </div>
              <p id="password-description" className="sr-only">
                Enter your password to sign in
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center justify-between text-small">
              <Link
                href="/auth/signup"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors focus-ring rounded"
              >
                Don't have an account?
              </Link>
              <Link
                href="#"
                className="text-text-secondary hover:text-text-primary transition-colors focus-ring rounded"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg focus-ring"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Terms */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-small text-text-tertiary text-center">
              By signing in, you agree to our{" "}
              <Link href="#" className="text-primary-400 hover:text-primary-300 font-medium focus-ring rounded">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary-400 hover:text-primary-300 font-medium focus-ring rounded">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="btn-ghost inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}