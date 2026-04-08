"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Home, ArrowLeft, Building, Ruler, Palette, Clock,
  Upload, MessageSquare, Loader2, AlertCircle, Calendar,
  CheckCircle, Circle, FileText, DollarSign
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  propertyType: string;
  roomCount: number | null;
  budget: number | null;
  stylePreference: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return document.cookie.includes("auth-token=");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-SG", {
    day: "numeric", month: "long", year: "numeric",
  });
}

// Rough estimate based on property type and size parsed from notes
function generateEstimate(project: Project): { low: string; typical: string; high: string } | null {
  // Parse property size from notes if stored there
  const sizeMatch = project.notes?.match(/Property size: (\d+)/);
  const sqft = sizeMatch ? parseInt(sizeMatch[1]) : null;

  if (!sqft) return null;

  const baseRates: Record<string, [number, number, number]> = {
    "HDB Resale": [40, 60, 90],
    "HDB BTO": [35, 50, 75],
    "Condo": [60, 90, 130],
    "Landed": [80, 120, 180],
  };

  const rates = baseRates[project.propertyType] || [50, 75, 110];
  return {
    low: `$${(sqft * rates[0]).toLocaleString()}`,
    typical: `$${(sqft * rates[1]).toLocaleString()}`,
    high: `$${(sqft * rates[2]).toLocaleString()}`,
  };
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth/signin");
      return;
    }
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.status === 401) {
        router.push("/auth/signin");
        return;
      }
      if (response.status === 404) {
        setError("This project doesn't exist or you don't have permission to view it.");
        setLoading(false);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setProject(data.project);
      } else {
        setError(data.error || "Failed to load project.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading your project…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
        <div className="max-w-3xl mx-auto pt-20 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-slate-400 mb-6">{error || "Something went wrong loading this project."}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const estimate = generateEstimate(project);

  // Parse property size and rooms from notes
  const sizeMatch = project.notes?.match(/Property size: (\d+)/);
  const propertySize = sizeMatch ? `${sizeMatch[1]} sqft` : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="h-10 w-10 rounded-xl border border-white/10 hover:border-white/20 transition flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5" />
                Created {formatDate(project.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Project Summary */}
        <div className="mb-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
          <h2 className="text-lg font-semibold mb-5">Project Summary</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Building className="h-4 w-4 text-blue-300" />
                <span className="text-xs text-slate-400">Property Type</span>
              </div>
              <div className="font-medium">{project.propertyType}</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Ruler className="h-4 w-4 text-emerald-300" />
                <span className="text-xs text-slate-400">Size</span>
              </div>
              <div className="font-medium">{propertySize || "Not specified"}</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Home className="h-4 w-4 text-amber-300" />
                <span className="text-xs text-slate-400">Rooms</span>
              </div>
              <div className="font-medium">{project.roomCount ? `${project.roomCount} rooms` : "Not specified"}</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Palette className="h-4 w-4 text-violet-300" />
                <span className="text-xs text-slate-400">Style</span>
              </div>
              <div className="font-medium">{project.stylePreference || "Not specified"}</div>
            </div>
          </div>

          {project.notes && (
            <div className="pt-5 border-t border-white/10">
              <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Project Notes
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {/* Strip internal metadata prefix from notes */}
                {project.notes.replace(/^Property size: \d+ sqft, Rooms: [^.]+\.\s*/, "") || "No additional notes."}
              </p>
            </div>
          )}
        </div>

        {/* Estimated Budget */}
        <div className="mb-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
          <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            Estimated Renovation Cost
          </h2>

          {estimate ? (
            <>
              <div className="grid sm:grid-cols-3 gap-4 mb-5">
                <div className="p-5 rounded-xl border border-white/10 text-center">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">{estimate.low}</div>
                  <div className="text-sm text-slate-400">Low Range</div>
                  <div className="text-xs text-slate-500 mt-1.5">Basic materials, standard fixtures</div>
                </div>
                <div className="p-5 rounded-xl border border-violet-500/30 bg-gradient-to-b from-violet-500/5 to-transparent text-center ring-1 ring-violet-500/20">
                  <div className="text-3xl font-bold text-white mb-1">{estimate.typical}</div>
                  <div className="text-sm text-violet-300 font-medium">Typical Range</div>
                  <div className="text-xs text-slate-400 mt-1.5">Recommended for most renovations</div>
                </div>
                <div className="p-5 rounded-xl border border-white/10 text-center">
                  <div className="text-2xl font-bold text-amber-400 mb-1">{estimate.high}</div>
                  <div className="text-sm text-slate-400">High Range</div>
                  <div className="text-xs text-slate-500 mt-1.5">Premium materials, custom features</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                * AI-generated estimate based on property type and size. Upload contractor quotes for a precise figure.
              </p>
            </>
          ) : (
            <div className="p-5 rounded-xl bg-slate-900/50 border border-white/10 text-center">
              <DollarSign className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm mb-1">No estimate available yet.</p>
              <p className="text-slate-500 text-xs">Upload contractor quotes or add more project details to generate a cost estimate.</p>
            </div>
          )}
        </div>

        {/* Next Actions */}
        <div className="mb-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
          <h2 className="text-lg font-semibold mb-5">Next Steps</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-white/10 hover:border-violet-400/30 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-violet-300" />
                </div>
                <div>
                  <div className="font-medium">Upload Contractor Quotes</div>
                  <div className="text-xs text-slate-400">Analyze pricing, compare contractors</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Upload PDF or image quotes from contractors to get an AI-powered fairness assessment.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-slate-400">
                <Clock className="h-3 w-3" /> Coming soon
              </div>
            </div>

            <div className="p-5 rounded-xl border border-white/10 hover:border-blue-400/30 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <div className="font-medium">Chat with AI Advisor</div>
                  <div className="text-xs text-slate-400">Get personalised recommendations</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Ask the AI advisor about design choices, materials, timelines, and more for your project.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-slate-400">
                <Clock className="h-3 w-3" /> Coming soon
              </div>
            </div>
          </div>
        </div>

        {/* Project Status */}
        <div className="p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Project Status</h2>
          <div className="space-y-3">
            {[
              { label: "Project created", done: true },
              { label: "Add contractor quotes for analysis", done: false },
              { label: "Finalise design and materials", done: false },
              { label: "Select contractor", done: false },
              { label: "Begin renovation", done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {step.done ? (
                  <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-slate-600 flex-shrink-0" />
                )}
                <span className={step.done ? "text-slate-300" : "text-slate-500"}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
