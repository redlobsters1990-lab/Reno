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
    // Read current cookies
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
    
    // Clear all cookies for this domain - MORE AGGRESSIVE VERSION
    const domain = window.location.hostname;
    const path = "/";
    
    // List of all possible cookie names to clear
    const cookieNamesToClear = [
      // Auth cookies
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
      // Next.js development cookies
      "__next_hmr_refresh_hash__",
      "__next_dev_",
      // Other common cookies
      "NEXT_LOCALE",
      "NEXT_THEME",
      "_ga",
      "_gid",
      "_gat",
    ];
    
    // First, clear all cookies we can find
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      // Clear cookie by setting expiration in the past
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
      if (domain !== 'localhost') {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
      }
    });
    
    // Second, explicitly clear known cookie names (in case they're not in document.cookie)
    cookieNamesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
      if (domain !== 'localhost') {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
      }
    });
    
    // Also clear localStorage items that might be related
    localStorage.clear();
    sessionStorage.clear();
    
    // Try to clear service worker cache if available
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
      // Refresh cookie list
      setCookies([]);
    }, 500);
  };

  const hasAuthCookies = cookies.some(cookie => 
    cookie.name.includes('auth') || 
    cookie.name.includes('next-auth') ||
    cookie.name.includes('session')
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Cookie Cleanup</h1>
          <p className="text-slate-400">Clear invalid authentication cookies that may be causing issues</p>
        </div>

        {/* Current Cookies */}
        <div className="mb-8 p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Current Cookies
          </h2>
          
          {cookies.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                <span>No cookies found</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cookies.map((cookie, index) => (
                <div key={index} className="p-4 rounded-xl bg-slate-900/50 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-sm">{cookie.name}</div>
                      <div className="text-xs text-slate-400 mt-1 truncate">
                        {cookie.value.length > 50 ? `${cookie.value.substring(0, 50)}...` : cookie.value}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${cookie.name.includes('auth') ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                      {cookie.name.includes('auth') ? 'Auth' : 'Other'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {hasAuthCookies && (
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="h-5 w-5" />
                <span>Authentication cookies detected. These may be causing project creation issues.</span>
              </div>
            </div>
          )}
        </div>

        {/* Cleanup Action */}
        <div className="mb-8 p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Cleanup Action</h2>
          
          {cleaned ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cookies Cleared!</h3>
              <p className="text-slate-300 mb-6">
                All cookies have been cleared. You can now sign in again.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signin"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In Again
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 transition flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-slate-300 mb-6">
                Clearing cookies can fix authentication issues when creating projects.
                You will need to sign in again after cleanup.
              </p>
              <button
                onClick={clearAllCookies}
                disabled={loading || cookies.length === 0}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                <Trash2 className="h-4 w-4" />
                {loading ? "Clearing..." : "Clear All Cookies"}
              </button>
              <p className="text-sm text-slate-400 mt-4">
                This will sign you out of all services on this site.
              </p>
            </div>
          )}
        </div>

        {/* Troubleshooting Info */}
        <div className="p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Why Clear Cookies?</h2>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-red-400"></div>
              </div>
              <span><strong>Invalid authentication:</strong> Cookies may reference deleted or non-existent user accounts</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-amber-400"></div>
              </div>
              <span><strong>Expired sessions:</strong> Authentication tokens can expire, causing "Failed to create project" errors</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              </div>
              <span><strong>Database changes:</strong> If the database was reset, old cookies won't match new user IDs</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              </div>
              <span><strong>Solution:</strong> Clear cookies → Sign in again → Project creation should work</span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 transition flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/test-project-create.html"
            className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 transition flex items-center justify-center gap-2"
          >
            Test Project Creation
          </Link>
        </div>
      </div>
    </div>
  );
}