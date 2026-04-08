"use client";

import { useState } from "react";
// signIn from next-auth not used — using direct-login instead
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, UserPlus } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
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

      // Auto-login after successful registration using direct-login
      const loginResponse = await fetch("/api/direct-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginResponse.json();

      if (loginResponse.ok && loginData.user?.id) {
        // Set client-side cookies
        document.cookie = `auth-token=user-${loginData.user.id}; path=/; max-age=2592000`;
        document.cookie = `user-email=${encodeURIComponent(email)}; path=/; max-age=2592000`;
        router.push("/dashboard");
      } else {
        // Fallback: redirect to signin
        router.push("/auth/signin?registered=true&email=" + encodeURIComponent(email));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sign up failed";
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-bold mb-2"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            Renovation Advisor AI
          </Link>
          <p className="text-slate-400">Create your account</p>
        </div>

        <div className="card p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-violet-300" />
            </div>
            <h1 className="text-2xl font-bold">Join Us</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-3">
            <p className="text-slate-400">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-violet-400 hover:text-violet-300 font-medium">
                Sign in
              </Link>
            </p>
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
