import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="h-20 w-20 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
          <Search className="h-10 w-10 text-violet-400" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold mb-3">Page not found</h2>
        
        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
        
        <div className="mt-8 text-sm text-slate-500">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
}