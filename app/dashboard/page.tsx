"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Plus, LogOut, Loader2, FolderOpen, ChevronRight, Calendar, AlertCircle } from "lucide-react";

interface Project {
  id: string;
  title: string;
  propertyType: string;
  createdAt: string;
  updatedAt: string;
}

function getUserEmail(): string {
  if (typeof window === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; user-email=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || "");
  return "";
}

function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return document.cookie.includes("auth-token=");
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/signin");
      return;
    }
    setUserEmail(getUserEmail());
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.status === 401) {
        // Session invalid — redirect to signin
        router.push("/auth/signin");
        return;
      }
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      } else {
        setError("Could not load your projects. Please refresh the page.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    // Clear all auth cookies
    ["auth-token", "user-email", "next-auth.session-token", "next-auth.callback-url", "next-auth.csrf-token"].forEach(name => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    router.push("/auth/signin");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-SG", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-500/30 border border-violet-400/40 flex items-center justify-center shadow-glow">
              <Home className="h-6 w-6 text-violet-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              {userEmail && (
                <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-slow"></span>
                  {userEmail}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/new"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all duration-500 hover:shadow-glow hover:-translate-y-1 flex items-center gap-3 font-medium"
            >
              <Plus className="h-5 w-5" />
              New Project
            </Link>
            <button
              onClick={handleSignOut}
              className="px-5 py-2.5 rounded-2xl border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center gap-2.5 text-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Your Projects</h2>
            <span className="text-sm font-medium px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300">
              {!loading && `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-400/30 flex items-center justify-center mb-6 animate-pulse-slow">
                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
              </div>
              <span className="text-slate-400 text-lg">Loading your projects…</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && projects.length === 0 && (
            <div className="p-12 rounded-3xl border-2 border-dashed border-white/20 bg-gradient-to-b from-white/5 to-transparent text-center">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-violet-400/30 flex items-center justify-center mx-auto mb-6 animate-float">
                <FolderOpen className="h-10 w-10 text-violet-300" />
              </div>
              <h3 className="text-2xl font-bold mb-4">No projects yet</h3>
              <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                Create your first renovation project to get AI-powered cost estimates, quote analysis, and planning guidance.
              </p>
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-lg transition-all duration-500 hover:shadow-glow hover:-translate-y-1"
              >
                <Plus className="h-5 w-5" />
                Create Your First Project
              </Link>
            </div>
          )}

          {/* Projects list */}
          {!loading && !error && projects.length > 0 && (
            <div className="space-y-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between p-6 rounded-3xl border border-white/20 hover:border-violet-400/40 bg-gradient-to-b from-white/5 to-transparent hover:shadow-glow transition-all duration-500 group hover:-translate-y-1"
                >
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-400/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                      <Home className="h-6 w-6 text-violet-300" />
                    </div>
                    <div>
                      <div className="text-xl font-bold group-hover:text-violet-300 transition-colors">{project.title}</div>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mt-1.5">
                        <span className="px-3 py-1 rounded-full bg-slate-800/50 border border-white/10 text-slate-300">{project.propertyType}</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(project.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              ))}
              <div className="pt-6 text-center">
                <Link
                  href="/dashboard/new"
                  className="inline-flex items-center gap-3 text-violet-400 hover:text-violet-300 font-medium transition-colors group"
                >
                  <div className="h-8 w-8 rounded-full bg-violet-500/10 border border-violet-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="h-4 w-4" />
                  </div>
                  Add another project
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
