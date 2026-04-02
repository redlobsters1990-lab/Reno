"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Plus, 
  Folder, 
  MessageSquare, 
  FileText, 
  Upload,
  Calendar,
  LogOut,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
  BarChart3,
  Zap,
  Target,
  CheckCircle,
  Calculator,
  Users,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { 
  LoadingSpinner, 
  LoadingOverlay, 
  SkeletonLoader, 
  EmptyState, 
  ErrorState,
  ProjectsEmptyState
} from "@/components/loading-states";

interface Project {
  id: string;
  title: string;
  propertyType: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    uploadedFiles: number;
    contractorQuotes: number;
    chatMessages: number;
  };
  estimates: Array<{
    id: string;
    realisticMin: number;
    realisticMax: number;
    createdAt: string;
  }>;
}

interface DashboardStats {
  totalProjects: number;
  totalMessages: number;
  totalFiles: number;
  totalQuotes: number;
  recentActivity: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalMessages: 0,
    totalFiles: 0,
    totalQuotes: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectsRes, statsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/projects/stats"),
      ]);

      if (!projectsRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const projectsData = await projectsRes.json();
      const statsData = await statsRes.json();

      setProjects(projectsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { signOut } = useSession();
    await signOut({ callbackUrl: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-800 animate-pulse"></div>
              <div className="h-6 w-48 bg-slate-800 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-slate-800 rounded animate-pulse"></div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <div className="h-4 w-24 bg-slate-800 rounded mb-2 animate-pulse"></div>
                <div className="h-8 w-16 bg-slate-800 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Projects Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-800 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-slate-800 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 w-24 bg-slate-800 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-800 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-3/4 bg-slate-800 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorState 
            message={error}
            onRetry={fetchDashboardData}
          />
        </div>
      </div>
    );
  }

  const { signOut } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-400/30 flex items-center justify-center">
              <Home className="h-5 w-5 text-violet-300" />
            </div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/new"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
            
            <button
              onClick={() => signOut()}
              className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-8 p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-400/30 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-violet-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-1">
                Welcome back, {session?.user?.name || "Renovation Planner"}!
              </h2>
              <p className="text-slate-400">
                Ready to continue planning your dream renovation?
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 flex items-center justify-center">
                <Folder className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <div className="text-sm text-slate-400">Total Projects</div>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">Active renovation plans</div>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-400/30 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-sm text-slate-400">AI Conversations</div>
                <div className="text-2xl font-bold">{stats.totalMessages}</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">Chats with advisor</div>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-400/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <div className="text-sm text-slate-400">Files Uploaded</div>
                <div className="text-2xl font-bold">{stats.totalFiles}</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">Plans & documents</div>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-400/30 flex items-center justify-center">
                <Upload className="h-5 w-5 text-violet-300" />
              </div>
              <div>
                <div className="text-sm text-slate-400">Quotes Analyzed</div>
                <div className="text-2xl font-bold">{stats.totalQuotes}</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">Contractor quotes</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/new"
              className="p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent hover:border-violet-400/30 hover:bg-white/5 transition group"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-400/30 flex items-center justify-center mb-3">
                <Plus className="h-5 w-5 text-violet-300" />
              </div>
              <h3 className="font-medium mb-1 group-hover:text-violet-300 transition">New Project</h3>
              <p className="text-sm text-slate-400">Start a renovation plan</p>
            </Link>

            <Link
              href="#"
              className="p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent hover:border-blue-400/30 hover:bg-white/5 transition group"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 flex items-center justify-center mb-3">
                <Calculator className="h-5 w-5 text-blue-300" />
              </div>
              <h3 className="font-medium mb-1 group-hover:text-blue-300 transition">Estimate Cost</h3>
              <p className="text-sm text-slate-400">Get budget ranges</p>
            </Link>

            <Link
              href="#"
              className="p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent hover:border-emerald-400/30 hover:bg-white/5 transition group"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-400/30 flex items-center justify-center mb-3">
                <MessageSquare className="h-5 w-5 text-emerald-300" />
              </div>
              <h3 className="font-medium mb-1 group-hover:text-emerald-300 transition">Chat with AI</h3>
              <p className="text-sm text-slate-400">Get expert advice</p>
            </Link>

            <Link
              href="#"
              className="p-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent hover:border-amber-400/30 hover:bg-white/5 transition group"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-400/30 flex items-center justify-center mb-3">
                <Upload className="h-5 w-5 text-amber-300" />
              </div>
              <h3 className="font-medium mb-1 group-hover:text-amber-300 transition">Upload Files</h3>
              <p className="text-sm text-slate-400">Plans & quotes</p>
            </Link>
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            <Link
              href="/dashboard/projects"
              className="text-sm text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <ProjectsEmptyState />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const latestEstimate = project.estimates && project.estimates.length > 0 
                  ? project.estimates[0] 
                  : null;
                
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="group block p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent hover:border-violet-400/30 hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-400/20 flex items-center justify-center">
                            <Home className="h-5 w-5 text-violet-300" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-violet-300 transition">
                              {project.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                              <span className="capitalize">{project.propertyType}</span>
                              <span>•</span>
                              <span>Updated {formatDate(project.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-slate-500" />
                            <span>{project._count.chatMessages} messages</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-500" />
                            <span>{project._count.uploadedFiles} files</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4 text-slate-500" />
                            <span>{project._count.contractorQuotes} quotes</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {latestEstimate && (
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(latestEstimate.realisticMin)} - {formatCurrency(latestEstimate.realisticMax)}
                            </div>
                            <div className="text-xs text-slate-400">Estimated range</div>
                          </div>
                        )}
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-violet-300 transition" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
            <div className="flex items-center justify-center gap-3 text-slate-400">
              <Clock className="h-5 w-5" />
              <p>Activity tracking coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}