"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthTestPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("realuser@example.com");
  const [password, setPassword] = useState("Password123!");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      setResult(res);
      console.log("SignIn result:", res);
    } catch (error: any) {
      setResult({ error: error.message });
      console.error("SignIn error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-slate-800 rounded-lg">
            <h2 className="font-semibold mb-2">Session Status</h2>
            <div className="text-sm">
              Status: <span className={status === "loading" ? "text-yellow-400" : status === "authenticated" ? "text-green-400" : "text-red-400"}>{status}</span>
            </div>
            {session?.user && (
              <div className="mt-2">
                <div>User: {session.user.email}</div>
                <div className="text-xs opacity-70">ID: {session.user.id}</div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-800 rounded-lg">
            <h2 className="font-semibold mb-2">Test Credentials</h2>
            <div className="space-y-2">
              <input
                type="email"
                className="w-full p-2 bg-slate-700 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              <input
                type="password"
                className="w-full p-2 bg-slate-700 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full p-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
              {status === "authenticated" && (
                <button
                  onClick={handleSignOut}
                  className="w-full p-2 bg-red-600 hover:bg-red-700 rounded"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-800 rounded-lg">
          <h2 className="font-semibold mb-2">Result</h2>
          <pre className="text-xs overflow-auto h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-800 rounded-lg">
        <h2 className="font-semibold mb-2">Debug Info</h2>
        <div className="text-sm space-y-1">
          <div>Session: {session ? "Exists" : "Null"}</div>
          <div>Status: {status}</div>
        </div>
      </div>
    </div>
  );
}