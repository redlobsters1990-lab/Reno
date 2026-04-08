"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, Loader2, Home, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setAuthChecked(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/direct-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      document.cookie = `auth-token=user-${data.user.id}; path=/; max-age=2592000; SameSite=Lax`;
      document.cookie = `user-email=${encodeURIComponent(data.user.email)}; path=/; max-age=2592000; SameSite=Lax`;
      
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
      <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #0b1020, #0f172a)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", margin: "0 auto 16px", animation: "pulse 2s infinite" }} />
          <div style={{ width: "192px", height: "24px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", margin: "0 auto" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #0b1020, #0f172a)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative" }}>
      {/* Background effects */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-160px", right: "-160px", width: "320px", height: "320px", background: "rgba(139,92,246,0.1)", borderRadius: "50%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "-160px", left: "-160px", width: "320px", height: "320px", background: "rgba(168,85,247,0.1)", borderRadius: "50%", filter: "blur(60px)" }} />
      </div>
      
      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(168,85,247,0.3))", border: "1px solid rgba(139,92,246,0.4)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Home size={32} color="#a78bfa" />
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>Welcome Back</h1>
          <p style={{ fontSize: "16px", color: "#94a3b8" }}>Sign in to your Renovation Advisor account</p>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ padding: "16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertCircle size={20} color="#ef4444" />
            <span style={{ color: "#ef4444", fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <div style={{ padding: "32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={20} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 48px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={20} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 48px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Links */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <Link href="/auth/signup" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>
                Don't have an account?
              </Link>
              <Link href="#" style={{ color: "#94a3b8", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading ? "rgba(139,92,246,0.5)" : "linear-gradient(135deg, #8b5cf6, #a855f7)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Terms */}
          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ fontSize: "12px", color: "#64748b", textAlign: "center", lineHeight: 1.5 }}>
              By signing in, you agree to our{" "}
              <Link href="#" style={{ color: "#a78bfa", textDecoration: "none" }}>Terms of Service</Link>
              {" "}and{" "}
              <Link href="#" style={{ color: "#a78bfa", textDecoration: "none" }}>Privacy Policy</Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#94a3b8", textDecoration: "none", fontSize: "14px" }}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
