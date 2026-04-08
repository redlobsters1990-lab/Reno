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

      setSuccess(true);
      
      setTimeout(async () => {
        try {
          const loginResponse = await fetch("/api/direct-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            document.cookie = `auth-token=user-${loginData.user.id}; path=/; max-age=2592000; SameSite=Lax`;
            document.cookie = `user-email=${encodeURIComponent(loginData.user.email)}; path=/; max-age=2592000; SameSite=Lax`;
            router.push("/dashboard");
            router.refresh();
          } else {
            router.push("/auth/signin");
          }
        } catch {
          router.push("/auth/signin");
        }
      }, 1500);

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
          <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>Create Your Account</h1>
          <p style={{ fontSize: "16px", color: "#94a3b8" }}>Start planning your dream renovation with AI guidance</p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{ padding: "16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "8px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
            <CheckCircle size={20} color="#22c55e" />
            <div>
              <span style={{ color: "#22c55e", fontWeight: 500 }}>Account created successfully!</span>
              <p style={{ fontSize: "14px", color: "#4ade80", marginTop: "4px" }}>Redirecting you to the dashboard...</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !success && (
          <div style={{ padding: "16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertCircle size={20} color="#ef4444" />
            <span style={{ color: "#ef4444", fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Sign Up Form */}
        <div style={{ padding: "32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Name Field */}
            <div>
              <label htmlFor="name" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={20} />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading || success}
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
                  disabled={loading || success}
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
                  disabled={loading || success}
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
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Must be at least 8 characters long</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={20} />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || success}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              style={{
                width: "100%",
                padding: "14px",
                background: loading || success ? "rgba(139,92,246,0.5)" : "linear-gradient(135deg, #8b5cf6, #a855f7)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: loading || success ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                  Creating Account...
                </>
              ) : success ? (
                <>
                  <CheckCircle size={20} />
                  Account Created!
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Terms */}
          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ fontSize: "12px", color: "#64748b", textAlign: "center", lineHeight: 1.5 }}>
              By creating an account, you agree to our{" "}
              <Link href="#" style={{ color: "#a78bfa", textDecoration: "none" }}>Terms of Service</Link>
              {" "}and{" "}
              <Link href="#" style={{ color: "#a78bfa", textDecoration: "none" }}>Privacy Policy</Link>
            </p>
          </div>
        </div>

        {/* Links */}
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#94a3b8", marginBottom: "16px" }}>
            Already have an account?{" "}
            <Link href="/auth/signin" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
          
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#94a3b8", textDecoration: "none", fontSize: "14px" }}>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
