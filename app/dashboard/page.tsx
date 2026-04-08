"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Plus, LogOut, Loader2, FolderOpen, ChevronRight, Calendar } from "lucide-react";

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
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-400/30 flex items-center justify-center">
              <Home className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              {userEmail && <p className="text-sm text-slate-400">{userEmail}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/new"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition flex items-center gap-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition flex items-center gap-2 text-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Projects</h2>
            <span className="text-sm text-slate-400">{!loading && `${projects.length} project${projects.length !== 1 ? "s" : ""}`}</span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-violet-400 mr-3" />
              <span className="text-slate-400">Loading your projects…</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && projects.length === 0 && (
            <div className="p-10 rounded-2xl border border-dashed border-white/10 text-center">
              <div className="h-14 w-14 rounded-full bg-violet-500/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="h-7 w-7 text-violet-300" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                Create your first renovation project to get AI-powered cost estimates, quote analysis, and planning guidance.
              </p>
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition font-medium"
              >
                <Plus className="h-4 w-4" />
                Create Your First Project
              </Link>
            </div>
          )}

          {/* Projects list */}
          {!loading && !error && projects.length > 0 && (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="flex items-center justify-between p-5 rounded-2xl border border-white/10 hover:border-violet-400/30 bg-gradient-to-b from-white/2.5 to-transparent transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center flex-shrink-0">
                      <Home className="h-5 w-5 text-violet-300" />
                    </div>
                    <div>
                      <div className="font-medium group-hover:text-violet-300 transition">{project.title}</div>
                      <div className="flex items-center gap-3 text-sm text-slate-400 mt-0.5">
                        <span>{project.propertyType}</span>
                        <span>·</span>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-violet-400 transition" />
                </Link>
              ))}
              <div className="pt-2 text-center">
                <Link
                  href="/dashboard/new"
                  className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition"
                >
                  <Plus className="h-3 w-3" />
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
