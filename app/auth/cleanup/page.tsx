"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, CheckCircle, AlertCircle, Home, LogIn } from "lucide-react";

export default function CookieCleanupPage() {
  const router = useRouter();
  const [cookies, setCookies] = useState<{name: string, value: string}[]>([]);
  const [cleaned, setCleaned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cookieList = document.cookie.split(';').map(cookie => {
      const [name, ...valueParts] = cookie.trim().split('=');
      return {
        name: name.trim(),
        value: valueParts.join('=').trim()
      };
    }).filter(cookie => cookie.name);
    
    setCookies(cookieList);
  }, []);

  const clearAllCookies = () => {
    setLoading(true);
    
    const domain = window.location.hostname;
    const path = "/";
    
    const cookieNamesToClear = [
      "auth-token",
      "user-email",
      "next-auth.session-token",
      "next-auth.callback-url",
      "next-auth.csrf-token",
      "session",
      "sessionid",
      "token",
      "access_token",
      "refresh_token",
      "__next_hmr_refresh_hash__",
      "__next_dev_",
      "NEXT_LOCALE",
      "NEXT_THEME",
      "_ga",
      "_gid",
      "_gat",
    ];
    
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
      if (domain !== 'localhost') {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
      }
    });
    
    cookieNamesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
      if (domain !== 'localhost') {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
      }
    });
    
    localStorage.clear();
    sessionStorage.clear();
    
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
    
    setTimeout(() => {
      setCleaned(true);
      setLoading(false);
      setCookies([]);
    }, 500);
  };

  const hasAuthCookies = cookies.some(cookie => 
    cookie.name.includes('auth') || 
    cookie.name.includes('next-auth') ||
    cookie.name.includes('session')
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #0b1020, #0f172a)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "600px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>Cookie Cleanup</h1>
          <p style={{ color: "#94a3b8" }}>Clear invalid authentication cookies that may be causing issues</p>
        </div>

        {/* Current Cookies */}
        <div style={{ marginBottom: "32px", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={20} />
            Current Cookies
          </h2>
          
          {cookies.length === 0 ? (
            <div style={{ padding: "16px", borderRadius: "10px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4ade80" }}>
                <CheckCircle size={20} />
                <span>No cookies found</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {cookies.map((cookie, index) => (
                <div key={index} style={{ padding: "16px", borderRadius: "10px", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "monospace", fontSize: "14px", color: "white" }}>{cookie.name}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {cookie.value.length > 50 ? `${cookie.value.substring(0, 50)}...` : cookie.value}
                      </div>
                    </div>
                    <div style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", marginLeft: "8px", background: cookie.name.includes('auth') ? "rgba(245,158,11,0.2)" : "rgba(15,23,42,0.5)", color: cookie.name.includes('auth') ? "#fbbf24" : "#94a3b8" }}>
                      {cookie.name.includes('auth') ? 'Auth' : 'Other'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {hasAuthCookies && (
            <div style={{ marginTop: "16px", padding: "16px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fbbf24" }}>
                <AlertCircle size={20} />
                <span>Authentication cookies detected. These may be causing project creation issues.</span>
              </div>
            </div>
          )}
        </div>

        {/* Cleanup Action */}
        <div style={{ marginBottom: "32px", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>Cleanup Action</h2>
          
          {cleaned ? (
            <div style={{ padding: "24px", borderRadius: "10px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", textAlign: "center" }}>
              <CheckCircle size={48} color="#4ade80" style={{ margin: "0 auto 16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "white", marginBottom: "8px" }}>Cookies Cleared!</h3>
              <p style={{ color: "#cbd5e1", marginBottom: "24px" }}>
                All cookies have been cleared. You can now sign in again.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center" }}>
                <Link
                  href="/auth/signin"
                  style={{ padding: "12px 24px", background: "linear-gradient(135deg, #8b5cf6, #a855f7)", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <LogIn size={16} />
                  Sign In Again
                </Link>
                <Link
                  href="/"
                  style={{ padding: "12px 24px", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <Home size={16} />
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#cbd5e1", marginBottom: "24px" }}>
                Clearing cookies can fix authentication issues when creating projects.
                You will need to sign in again after cleanup.
              </p>
              <button
                onClick={clearAllCookies}
                disabled={loading || cookies.length === 0}
                style={{
                  padding: "14px 32px",
                  background: loading || cookies.length === 0 ? "rgba(239,68,68,0.5)" : "linear-gradient(135deg, #ef4444, #f97316)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: loading || cookies.length === 0 ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <Trash2 size={16} />
                {loading ? "Clearing..." : "Clear All Cookies"}
              </button>
              <p style={{ fontSize: "14px", color: "#64748b", marginTop: "16px" }}>
                This will sign you out of all services on this site.
              </p>
            </div>
          )}
        </div>

        {/* Troubleshooting Info */}
        <div style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>Why Clear Cookies?</h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", color: "#cbd5e1", listStyle: "none", padding: 0 }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }} />
              </div>
              <span><strong>Invalid authentication:</strong> Cookies may reference deleted or non-existent user accounts</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fbbf24" }} />
              </div>
              <span><strong>Expired sessions:</strong> Authentication tokens can expire, causing "Failed to create project" errors</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa" }} />
              </div>
              <span><strong>Database changes:</strong> If the database was reset, old cookies won't match new user IDs</span>
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80" }} />
              </div>
              <span><strong>Solution:</strong> Clear cookies → Sign in again → Project creation should work</span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center" }}>
          <Link
            href="/"
            style={{ padding: "12px 24px", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
