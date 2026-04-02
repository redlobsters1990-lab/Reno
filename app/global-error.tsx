"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full text-center">
            <div className="h-20 w-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold mb-3">Critical Error</h1>
            
            <p className="text-slate-400 mb-6">
              A critical error has occurred. The application cannot continue.
            </p>
            
            <div className="mb-6 p-4 rounded-lg bg-slate-900/50 border border-slate-700">
              <code className="text-sm text-slate-300 break-all">
                {error.message || "Unknown error"}
              </code>
            </div>
            
            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition"
            >
              Reload Application
            </button>
            
            <div className="mt-8 text-sm text-slate-500">
              <p>Please refresh the page or try again later.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}