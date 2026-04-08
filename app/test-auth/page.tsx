"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-slate-800 rounded-lg">
          <h2 className="font-semibold mb-2">Session Status</h2>
          <div className="text-sm font-mono">
            Status: <span className={status === "loading" ? "text-yellow-400" : status === "authenticated" ? "text-green-400" : "text-red-400"}>{status}</span>
          </div>
          {session?.user && (
            <div className="mt-2 text-sm">
              User: {session.user.email} ({session.user.id})
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-800 rounded-lg">
          <h2 className="font-semibold mb-2">Actions</h2>
          <div className="space-x-4">
            {status === "authenticated" ? (
              <button
                onClick={() => signOut({ callbackUrl: "/test-auth", redirect: true })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => signIn(undefined, { callbackUrl: "/test-auth" })}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-800 rounded-lg">
          <h2 className="font-semibold mb-2">Debug Info</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({ session, status }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
