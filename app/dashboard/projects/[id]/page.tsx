"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Home, ArrowLeft, Building, Ruler, Palette, Clock,
  Upload, MessageSquare, Loader2, AlertCircle, Calendar,
  CheckCircle, Circle, FileText, DollarSign, Sparkles
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

function capitalise(s: string | null | undefined): string {
  if (!s) return "Not specified";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Pull property size in sqft from the stored notes prefix */
function parsePropertySize(notes: string | null): number | null {
  const m = notes?.match(/Property size: (\d+)/);
  return m ? parseInt(m[1]) : null;
}

/** Strip internal metadata prefix from user-visible notes */
function stripInternalPrefix(notes: string | null): string {
  if (!notes) return "";
  // Remove "Property size: NNN sqft, Rooms: NN." prefix
  return notes.replace(/^Property size: \d+ sqft, Rooms: [^.]*\.\s*/, "").trim();
}

/** AI cost estimate based on property type × sqft */
function generateEstimate(project: Project): { low: string; typical: string; high: string } | null {
  const sqft = parsePropertySize(project.notes);
  if (!sqft) return null;

  const rates: Record<string, [number, number, number]> = {
    "HDB Resale": [40, 60, 90],
    "HDB BTO":    [35, 50, 75],
    "Condo":      [60, 90, 130],
    "Landed":     [80, 120, 180],
  };
  const r = rates[project.propertyType] ?? [50, 75, 110];
  const fmt = (n: number) => `$${(sqft * n).toLocaleString("en-SG")}`;
  return { low: fmt(r[0]), typical: fmt(r[1]), high: fmt(r[2]) };
}

export default function ProjectDetailPage() {
  const router  = useRouter();
  const params  = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/auth/signin"); return; }
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.status === 401) { router.push("/auth/signin"); return; }
      if (res.status === 404) {
        setError("This project doesn't exist or you don't have access to it.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) setProject(data.project);
      else setError(data.error || "Failed to load project. Please try again.");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Loading ────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400 mr-3" />
        <span className="text-slate-400">Loading project…</span>
      </div>
    );
  }

  /* ─── Error ──────────────────────────────────────────────── */
  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
        <div className="max-w-xl mx-auto pt-24 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-slate-400 mb-6">{error || "Something went wrong."}</p>
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const estimate     = generateEstimate(project);
  const sqft         = parsePropertySize(project.notes);
  const userNotes    = stripInternalPrefix(project.notes);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard"
            className="h-10 w-10 rounded-xl border border-white/10 hover:border-white/20 transition flex items-center justify-center flex-shrink-0">
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

        {/* ── Project Summary ── */}
        <div className="mb-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
          <h2 className="text-lg font-semibold mb-5">Project Summary</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

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
                <span className="text-xs text-slate-400">Property Size</span>
              </div>
              <div className="font-medium">{sqft ? `${sqft.toLocaleString()} sqft` : "Not specified"}</div>
            </div>

            <div className="p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Home className="h-4 w-4 text-amber-300" />
                <span className="text-xs text-slate-400">Rooms</span>
              </div>
              <div className="font-medium">
                {project.roomCount ? `${project.roomCount} room${project.roomCount !== 1 ? "s" : ""}` : "Not specified"}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Palette className="h-4 w-4 text-violet-300" />
                <span className="text-xs text-slate-400">Style</span>
              </div>
              <div className="font-medium">{capitalise(project.stylePreference)}</div>
            </div>

          </div>

          {project.budget && (
            <div className="mt-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <span className="text-xs text-slate-400">Your Budget: </span>
              <span className="font-semibold text-emerald-400">
                ${project.budget.toLocaleString("en-SG")} SGD
              </span>
            </div>
          )}

          {userNotes && (
            <div className="mt-5 pt-5 border-t border-white/10">
              <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Your Notes
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{userNotes}</p>
            </div>
          )}
        </div>

        {/* ── Estimated Budget ── */}
        <div className="mb-6 p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            Estimated Renovation Cost
          </h2>
          <p className="text-xs text-slate-500 mb-5">AI estimate based on property type and size</p>

          {estimate ? (
            <>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="p-5 rounded-xl border border-white/10 text-center">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">{estimate.low}</div>
                  <div className="text-sm text-slate-400">Low Range</div>
                  <div className="text-xs text-slate-500 mt-1">Basic finishes, standard fixtures</div>
                </div>
                <div className="p-5 rounded-xl border border-violet-500/30 bg-violet-500/5 text-center ring-1 ring-violet-500/20">
                  <div className="text-3xl font-bold text-white mb-1">{estimate.typical}</div>
                  <div className="text-sm text-violet-300 font-medium">Typical Range</div>
                  <div className="text-xs text-slate-400 mt-1">Recommended for most renovations</div>
                </div>
                <div className="p-5 rounded-xl border border-white/10 text-center">
                  <div className="text-2xl font-bold text-amber-400 mb-1">{estimate.high}</div>
                  <div className="text-sm text-slate-400">High Range</div>
                  <div className="text-xs text-slate-500 mt-1">Premium materials, custom features</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Ranges based on {sqft?.toLocaleString()} sqft {project.propertyType}. Upload contractor quotes for a precise figure.
              </p>
            </>
          ) : (
            <div className="p-6 rounded-xl bg-slate-900/50 border border-white/10 text-center">
              <Sparkles className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-300 font-medium mb-1">No estimate available yet</p>
              <p className="text-slate-500 text-sm">
                Add your property size when creating a project, or upload contractor quotes to get a cost estimate.
              </p>
            </div>
          )}
        </div>

        {/* ── Next Steps ── */}
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
                  <div className="text-xs text-slate-400">Analyse pricing, compare contractors</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Upload PDF or image quotes to get an AI-powered fairness assessment and side-by-side comparison.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-slate-400">
                <Clock className="h-3 w-3" /> Coming soon
              </span>
            </div>

            <div className="p-5 rounded-xl border border-white/10 hover:border-blue-400/30 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <div className="font-medium">Chat with AI Advisor</div>
                  <div className="text-xs text-slate-400">Personalised renovation guidance</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Ask about design choices, materials, timelines, and contractor selection for your specific project.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-slate-400">
                <Clock className="h-3 w-3" /> Coming soon
              </span>
            </div>

          </div>
        </div>

        {/* ── Project Status ── */}
        <div className="p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Project Progress</h2>
          <div className="space-y-3">
            {[
              { label: "Project created",                done: true  },
              { label: "Add property size & style",      done: !!sqft },
              { label: "Upload contractor quotes",       done: false },
              { label: "Review AI quote analysis",       done: false },
              { label: "Select contractor & finalise",   done: false },
              { label: "Begin renovation",               done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {step.done
                  ? <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  : <Circle      className="h-5 w-5 text-slate-600  flex-shrink-0" />}
                <span className={step.done ? "text-slate-300" : "text-slate-500"}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
