"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="h-20 w-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
        
        <p className="text-slate-400 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        
        {error.digest && (
          <div className="mb-6 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
            <code className="text-xs text-slate-400">Error ID: {error.digest}</code>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 transition flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-slate-500">
          <p>If the problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  );
}