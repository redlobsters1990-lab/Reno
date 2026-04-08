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
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #0b1020, #0f172a)", color: "white" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(168,85,247,0.3))", border: "1px solid rgba(139,92,246,0.4)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Home size={24} color="#a78bfa" />
            </div>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "white" }}>Dashboard</h1>
              {userEmail && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <div style={{ width: "8px", height: "8px", background: "#22c55e", borderRadius: "50%" }} />
                  <span style={{ fontSize: "14px", color: "#94a3b8" }}>{userEmail}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              href="/dashboard/new"
              style={{ padding: "12px 24px", background: "linear-gradient(135deg, #8b5cf6, #a855f7)", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Plus size={20} />
              New Project
            </Link>
            <button
              onClick={handleSignOut}
              style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: "8px", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Your Projects</h2>
            <span style={{ padding: "6px 12px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "20px", fontSize: "14px", color: "#a78bfa" }}>
              {!loading && `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
              <div style={{ width: "64px", height: "64px", background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Loader2 size={32} color="#a78bfa" style={{ animation: "spin 1s linear infinite" }} />
              </div>
              <span style={{ color: "#94a3b8" }}>Loading your projects...</span>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div style={{ padding: "16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
              <AlertCircle size={20} color="#ef4444" />
              <span style={{ color: "#ef4444" }}>{error}</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && projects.length === 0 && (
            <div style={{ padding: "48px", background: "rgba(255,255,255,0.05)", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ width: "80px", height: "80px", background: "rgba(139,92,246,0.2)", border: "2px solid rgba(139,92,246,0.3)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <FolderOpen size={40} color="#a78bfa" />
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>No projects yet</h3>
              <p style={{ color: "#94a3b8", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
                Create your first renovation project to get AI-powered cost estimates, quote analysis, and planning guidance.
              </p>
              <Link
                href="/dashboard/new"
                style={{ padding: "16px 32px", background: "linear-gradient(135deg, #8b5cf6, #a855f7)", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <Plus size={20} />
                Create Your First Project
              </Link>
            </div>
          )}

          {/* Projects List */}
          {!loading && !error && projects.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  style={{ padding: "24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", textDecoration: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.3s" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Home size={24} color="#a78bfa" />
                    </div>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 600, color: "white" }}>{project.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                        <span style={{ padding: "4px 8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", fontSize: "12px", color: "#94a3b8" }}>{project.propertyType}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#64748b" }}>
                          <Calendar size={14} />
                          {formatDate(project.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={24} color="#64748b" />
                </Link>
              ))}
              
              {/* Add Another Project */}
              <div style={{ paddingTop: "24px", textAlign: "center" }}>
                <Link
                  href="/dashboard/new"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#94a3b8", textDecoration: "none" }}
                >
                  <div style={{ width: "32px", height: "32px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus size={16} color="#a78bfa" />
                  </div>
                  Add another project
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {!loading && projects.length > 0 && (
          <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "24px" }}>Project Overview</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#a78bfa" }}>{projects.length}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Total Projects</div>
              </div>
              <div style={{ padding: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#60a5fa" }}>
                  {new Set(projects.map(p => p.propertyType)).size}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Property Types</div>
              </div>
              <div style={{ padding: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#22c55e" }}>
                  {projects.filter(p => new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>This Week</div>
              </div>
              <div style={{ padding: "16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#f59e0b" }}>
                  {projects.length > 0 ? formatDate(projects[0].createdAt).split(' ')[2] : '—'}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>First Project Year</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
