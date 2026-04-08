"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, AlertCircle, Loader2, Home, ArrowLeft, CheckCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!password) {
      setError("Please enter a password");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sign up failed");
      }

      // Show success message
      setSuccess(true);
      
      // Auto-login after successful signup
      setTimeout(async () => {
        try {
          const loginResponse = await fetch("/api/direct-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            // Set cookies and redirect
            document.cookie = `auth-token=user-${loginData.user.id}; path=/; max-age=2592000; SameSite=Lax`;
            document.cookie = `user-email=${encodeURIComponent(loginData.user.email)}; path=/; max-age=2592000; SameSite=Lax`;
            router.push("/dashboard");
            router.refresh();
          } else {
            // If auto-login fails, redirect to signin
            router.push("/auth/signin");
          }
        } catch {
          router.push("/auth/signin");
        }
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sign up failed";
      
      // Improve error messages
      if (errorMessage.includes("already exists") || errorMessage.includes("already registered")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (errorMessage.includes("Invalid email") || errorMessage.includes("valid email")) {
        setError("Please enter a valid email address (e.g. you@example.com).");
      } else if (errorMessage.toLowerCase().includes("password")) {
        setError(errorMessage);
      } else if (errorMessage.includes("Name")) {
        setError(errorMessage);
      } else {
        setError("Sign up failed. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-h1 font-bold mb-4">Create Your Account</h1>
          <p className="text-body text-text-secondary">Start planning your dream renovation with AI guidance</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="alert-success mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <span className="font-medium">Account created successfully!</span>
                <p className="text-small mt-1">Redirecting you to the dashboard...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !success && (
          <div className="alert-error mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Sign Up Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="input-label">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                <input
                  id="name"
                  type="text"
                  className="input pl-12"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading || success}
                  aria-describedby="name-description"
                />
              </div>
              <p id="name-description" className="sr-only">
                Enter your full name
              </p>
            </div>

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
                  disabled={loading || success}
                  aria-describedby="email-description"
                />
              </div>
              <p id="email-description" className="sr-only">
                Enter your email address
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
                  disabled={loading || success}
                  aria-describedby="password-description"
                />
              </div>
              <p id="password-description" className="text-small text-text-tertiary mt-2">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="input-label">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                <input
                  id="confirmPassword"
                  type="password"
                  className="input pl-12"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || success}
                  aria-describedby="confirm-password-description"
                />
              </div>
              <p id="confirm-password-description" className="sr-only">
                Re-enter your password to confirm
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary w-full py-4 text-lg focus-ring"
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Account Created!
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Terms */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-small text-text-tertiary text-center">
              By creating an account, you agree to our{" "}
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

        {/* Links */}
        <div className="mt-8 space-y-4 text-center">
          <p className="text-body text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors focus-ring rounded"
            >
              Sign in
            </Link>
          </p>
          
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