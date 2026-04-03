"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, LogIn } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Check for registration success from URL
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get("registered") === "true") {
        const registeredEmail = params.get("email");
        setSuccessMessage(
          registeredEmail 
            ? `Account created successfully! Please sign in with ${registeredEmail}`
            : "Account created successfully! Please sign in."
        );
        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Better error messages
        if (result.error.includes("User not found")) {
          setError("No account found with this email");
        } else if (result.error.includes("Invalid password")) {
          setError("Incorrect password");
        } else if (result.error.includes("Email and password required")) {
          setError("Please enter both email and password");
        } else {
          setError(result.error);
        }
      } else {
        // Redirect to dashboard
        router.push("/dashboard");
        // Don't call refresh immediately, let the redirect happen
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              </div>
              <span className="text-emerald-400">{successMessage}</span>
            </div>
          </div>
        )}
        
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
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        <div className="card p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center">
              <LogIn className="h-5 w-5 text-violet-300" />
            </div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-400">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
