"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Plus, LogOut, Loader2, FolderOpen, ChevronRight, Calendar, AlertCircle, User } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-950">
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500/30 to-secondary-500/30 border border-primary-400/40 flex items-center justify-center shadow-glow-sm">
              <Home className="h-6 w-6 text-primary-300" />
            </div>
            <div>
              <h1 className="text-h1 font-bold">Dashboard</h1>
              {userEmail && (
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-3 w-3 rounded-full bg-success-400 animate-pulse-slow" />
                  <span className="text-small text-text-secondary">{userEmail}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/new"
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Link>
            <button
              onClick={handleSignOut}
              className="btn-secondary"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main id="main-content">
          {/* Projects Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h2 font-bold">Your Projects</h2>
              <span className="badge-primary">
                {!loading && `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
              </span>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-400/30 flex items-center justify-center mb-6 animate-pulse-slow">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
                </div>
                <span className="text-body text-text-secondary">Loading your projects…</span>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="alert-error mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && projects.length === 0 && (
              <div className="card p-12 text-center border-2 border-dashed">
                <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-2 border-primary-400/30 flex items-center justify-center mx-auto mb-6 animate-float">
                  <FolderOpen className="h-10 w-10 text-primary-300" />
                </div>
                <h3 className="text-h2 font-bold mb-4">No projects yet</h3>
                <p className="text-body text-text-secondary mb-8 max-w-md mx-auto">
                  Create your first renovation project to get AI-powered cost estimates, quote analysis, and planning guidance.
                </p>
                <Link
                  href="/dashboard/new"
                  className="btn-primary px-8 py-4 text-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Project
                </Link>
              </div>
            )}

            {/* Projects List */}
            {!loading && !error && projects.length > 0 && (
              <div className="space-y-4">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="card-hover p-6 focus-ring h-full block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-400/30 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                          <Home className="h-6 w-6 text-primary-300" />
                        </div>
                        <div>
                          <div className="text-h3 font-bold group-hover:text-primary-300 transition-colors">
                            {project.title}
                          </div>
                          <div className="flex items-center gap-4 text-small text-text-secondary mt-1.5">
                            <span className="badge-neutral">{project.propertyType}</span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(project.createdAt)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-text-tertiary group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </Link>
                ))}
                
                {/* Add Another Project */}
                <div className="pt-6 text-center">
                  <Link
                    href="/dashboard/new"
                    className="btn-ghost inline-flex items-center gap-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-500/10 border border-primary-400/30 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Plus className="h-4 w-4" />
                    </div>
                    Add another project
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {!loading && projects.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-h3 font-bold mb-6">Project Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4 text-center">
                  <div className="text-h1 font-bold text-primary-300 mb-1">{projects.length}</div>
                  <div className="text-caption text-text-tertiary">Total Projects</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-h1 font-bold text-info-300 mb-1">
                    {new Set(projects.map(p => p.propertyType)).size}
                  </div>
                  <div className="text-caption text-text-tertiary">Property Types</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-h1 font-bold text-success-300 mb-1">
                    {projects.filter(p => new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                  </div>
                  <div className="text-caption text-text-tertiary">This Week</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-h1 font-bold text-warning-300 mb-1">
                    {projects.length > 0 ? formatDate(projects[0].createdAt).split(' ')[2] : '—'}
                  </div>
                  <div className="text-caption text-text-tertiary">First Project Year</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}