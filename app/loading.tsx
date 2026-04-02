import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin mx-auto mb-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
        </div>
        
        <h2 className="text-xl font-semibold mb-2">Loading</h2>
        
        <p className="text-slate-400">
          Please wait while we prepare your experience...
        </p>
        
        <div className="mt-8">
          <div className="h-1 w-48 bg-slate-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full w-1/3 bg-gradient-to-r from-violet-500 to-purple-500 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}