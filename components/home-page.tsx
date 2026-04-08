"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Home, MessageSquare, Calculator, FileText, Upload, Shield, Sparkles, ArrowRight, CheckCircle, Users, Clock, Star } from "lucide-react";

export function HomePage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log("Waitlist submission:", email);
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #0b1020, #0f172a)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
          <div style={{ height: "60px", background: "rgba(255,255,255,0.1)", borderRadius: "8px", marginBottom: "40px" }} />
          <div style={{ height: "400px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #0b1020, #0f172a)", color: "white" }}>
      {/* Navigation */}
      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(11,16,32,0.8)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #8b5cf6, #a855f7)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Home size={20} color="white" />
            </div>
            <span style={{ fontSize: "20px", fontWeight: "bold" }}>Renovation Advisor AI</span>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {status === "authenticated" ? (
              <>
                <Link href="/dashboard" style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", color: "white", textDecoration: "none" }}>Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: "/", redirect: true })} style={{ padding: "10px 20px", borderRadius: "8px", background: "transparent", color: "white", border: "none", cursor: "pointer" }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", color: "white", textDecoration: "none" }}>Sign In</Link>
                <Link href="/auth/signup" style={{ padding: "10px 20px", borderRadius: "8px", background: "linear-gradient(135deg, #8b5cf6, #a855f7)", color: "white", textDecoration: "none" }}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "20px", marginBottom: "32px" }}>
            <Sparkles size={16} color="#a78bfa" />
            <span style={{ fontSize: "14px", color: "#a78bfa" }}>AI-Powered Renovation Intelligence</span>
          </div>

          <h1 style={{ fontSize: "48px", fontWeight: "bold", marginBottom: "24px", lineHeight: 1.2 }}>
            Transform Your Home with{" "}
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              AI-Powered Precision
            </span>
          </h1>

          <p style={{ fontSize: "20px", color: "#94a3b8", marginBottom: "32px", lineHeight: 1.6 }}>
            Stop guessing, start building. Get accurate cost estimates, personalized guidance, and stress-free planning for your renovation.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
              <Shield size={16} color="#4ade80" />
              <span style={{ fontSize: "14px" }}>Secure & Private</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
              <CheckCircle size={16} color="#4ade80" />
              <span style={{ fontSize: "14px" }}>No Credit Card Required</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
              <Clock size={16} color="#60a5fa" />
              <span style={{ fontSize: "14px" }}>Setup in 2 Minutes</span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "48px", flexWrap: "wrap" }}>
            <Link
              href={status === "authenticated" ? "/dashboard" : "/auth/signup"}
              style={{ padding: "16px 32px", background: "linear-gradient(135deg, #8b5cf6, #a855f7)", color: "white", borderRadius: "10px", textDecoration: "none", fontWeight: "600", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}
            >
              Start Your Free Project
              <ArrowRight size={20} />
            </Link>
            <Link
              href="#features"
              style={{ padding: "16px 32px", border: "2px solid rgba(255,255,255,0.2)", color: "white", borderRadius: "10px", textDecoration: "none", fontWeight: "600", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Sparkles size={20} />
              See How It Works
            </Link>
          </div>

          <p style={{ fontSize: "14px", color: "#64748b" }}>No commitment • 100% free to start</p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "36px", fontWeight: "bold", color: "white" }}>1,000+</div>
              <div style={{ fontSize: "14px", color: "#94a3b8", marginTop: "4px" }}>Projects Planned</div>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.2)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "36px", fontWeight: "bold", color: "white" }}>$2.5M+</div>
              <div style={{ fontSize: "14px", color: "#94a3b8", marginTop: "4px" }}>Costs Estimated</div>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.2)" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "36px", fontWeight: "bold", color: "white" }}>94%</div>
              <div style={{ fontSize: "14px", color: "#94a3b8", marginTop: "4px" }}>User Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "bold", textAlign: "center", marginBottom: "48px" }}>
            Renovation Shouldn't Be{" "}
            <span style={{ background: "linear-gradient(135deg, #fbbf24, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              This Stressful
            </span>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            <div style={{ padding: "24px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>💸</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>Budget Surprises</h3>
              <p style={{ color: "#94a3b8" }}>Hidden costs and inaccurate estimates derail 68% of renovation projects.</p>
            </div>
            <div style={{ padding: "24px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏰</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>Time Overruns</h3>
              <p style={{ color: "#94a3b8" }}>Projects take 40% longer than planned due to poor coordination.</p>
            </div>
            <div style={{ padding: "24px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>😵</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>Decision Fatigue</h3>
              <p style={{ color: "#94a3b8" }}>Too many choices without expert guidance leads to costly mistakes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "80px 24px", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "20px", marginBottom: "16px" }}>
              <Sparkles size={16} color="#a78bfa" />
              <span style={{ fontSize: "14px", color: "#a78bfa" }}>AI-POWERED PLATFORM</span>
            </div>
            <h2 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px" }}>
              Your Complete Renovation{" "}
              <span style={{ background: "linear-gradient(135deg, #a78bfa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Command Center
              </span>
            </h2>
            <p style={{ fontSize: "18px", color: "#94a3b8", maxWidth: "600px", margin: "0 auto" }}>
              Everything you need to plan, budget, and execute your renovation—all in one intelligent platform.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { icon: <MessageSquare size={32} color="#a78bfa" />, title: "AI Advisor Chat", desc: "Get personalized renovation advice from our AI assistant. Ask questions, get recommendations, and plan with confidence.", color: "#8b5cf6" },
              { icon: <Calculator size={32} color="#60a5fa" />, title: "Smart Cost Estimation", desc: "Accurate cost estimates based on your location, project scope, and current market rates. No more budget surprises.", color: "#3b82f6" },
              { icon: <FileText size={32} color="#4ade80" />, title: "Quote Analysis", desc: "Upload contractor quotes and let our AI identify fair pricing, hidden costs, and potential red flags.", color: "#22c55e" },
              { icon: <Upload size={32} color="#fbbf24" />, title: "Document Management", desc: "Store and organize all your renovation documents, contracts, and receipts in one secure place.", color: "#f59e0b" },
              { icon: <Users size={32} color="#f472b6" />, title: "Contractor Matching", desc: "Get matched with verified contractors in your area based on your project needs and budget.", color: "#ec4899" },
              { icon: <Shield size={32} color="#2dd4bf" />, title: "Decision Memory", desc: "Our AI remembers every decision you make, creating a knowledge base for your project.", color: "#14b8a6" },
            ].map((feature, i) => (
              <div key={i} style={{ padding: "24px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.borderColor = feature.color; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                <div style={{ width: "56px", height: "56px", background: `linear-gradient(135deg, ${feature.color}33, ${feature.color}11)`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>{feature.title}</h3>
                <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center", padding: "48px", background: "rgba(139,92,246,0.1)", borderRadius: "20px", border: "1px solid rgba(139,92,246,0.3)" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "bold", marginBottom: "16px" }}>
            Ready to Transform Your Renovation?
          </h2>
          <p style={{ fontSize: "18px", color: "#94a3b8", marginBottom: "32px" }}>
            Join 1,000+ homeowners who've saved time, money, and stress with our AI platform.
          </p>
          <Link
            href={status === "authenticated" ? "/dashboard" : "/auth/signup"}
            style={{ padding: "16px 32px", background: "linear-gradient(135deg, #8b5cf6, #a855f7)", color: "white", borderRadius: "10px", textDecoration: "none", fontWeight: "600", fontSize: "18px", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Sparkles size={20} />
            Start Free Project
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #8b5cf6, #a855f7)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Home size={20} color="white" />
            </div>
            <span style={{ fontSize: "20px", fontWeight: "bold" }}>Renovation Advisor AI</span>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            <Link href="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy</Link>
            <Link href="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms</Link>
            <Link href="/contact" style={{ color: "#94a3b8", textDecoration: "none" }}>Contact</Link>
          </div>
          <div style={{ color: "#64748b", fontSize: "14px" }}>
            © 2026 Renovation Advisor AI
          </div>
        </div>
      </footer>
    </div>
  );
}
