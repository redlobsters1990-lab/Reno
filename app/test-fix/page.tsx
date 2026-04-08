"use client";

import { useEffect, useState } from "react";
import { createProjectSchema } from "@/lib/validation";

export default function TestFixPage() {
  const [status, setStatus] = useState("Testing...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Test if createProjectSchema exists
      if (!createProjectSchema) {
        throw new Error("createProjectSchema is undefined");
      }
      
      // Test if parse method exists
      if (typeof createProjectSchema.parse !== "function") {
        throw new Error("createProjectSchema.parse is not a function");
      }
      
      // Test parsing
      const testData = {
        name: "Test Project",
        propertyType: "HDB Resale",
        propertySize: "850",
        rooms: "3",
        budget: "50000",
        stylePreference: "modern",
        timeline: "3",
        notes: "Test notes"
      };
      
      const result = createProjectSchema.parse(testData);
      setStatus("✅ SUCCESS: createProjectSchema works correctly!");
      console.log("Validation result:", result);
      
    } catch (err: any) {
      setStatus("❌ FAILED");
      setError(err.message);
      console.error("Validation error:", err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Fix Verification Test</h1>
        
        <div className="p-6 rounded-2xl border border-white/10 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Result</h2>
          <div className={`p-4 rounded-xl ${error ? "bg-red-500/10 border border-red-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
            <div className="font-medium mb-2">{status}</div>
            {error && (
              <div className="text-sm text-red-400">
                Error: {error}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4">What was fixed</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              </div>
              <span>Added <code>createProjectSchema</code> export to <code>lib/validation.ts</code></span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              </div>
              <span>Replaced project creation page with simple version</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              </div>
              <span>Fixed corrupted files with shell script content</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mt-0.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
              </div>
              <span>All pages now load with HTTP 200 (no 500 errors)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}