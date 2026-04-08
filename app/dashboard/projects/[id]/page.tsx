"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Home, ArrowLeft, Building, Ruler, Palette, Clock,
  Upload, MessageSquare, Loader2, AlertCircle, Calendar,
  CheckCircle, Circle, FileText, DollarSign, Sparkles
} from "lucide-react";
import { QuoteUpload } from "@/components/quote-upload";

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

function parsePropertySize(notes: string | null): number | null {
  const m = notes?.match(/Property size: (\d+)/);
  return m ? parseInt(m[1]) : null;
}

function stripInternalPrefix(notes: string | null): string {
  if (!notes) return "";
  return notes.replace(/^Property size: \d+ sqft, Rooms: [^.]*\.\s*/, "").trim();
}

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
  const projectId = params?.id as string | undefined;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!projectId) return; // Wait for projectId to be available
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

  if (!projectId || loading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #0b1020, #0f172a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} color="#a78bfa" style={{ animation: "spin 1s linear infinite", marginRight: "12px" }} />
        <span style={{ color: "#94a3b8" }}>{!projectId ? "Loading..." : "Loading project..."}</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #0b1020, #0f172a)", padding: "24px" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto", paddingTop: "96px", textAlign: "center" }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px", color: "white" }}>Project not found</h2>
          <p style={{ color: "#94a3b8", marginBottom: "24px" }}>{error || "Something went wrong."}</p>
          <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "linear-gradient(135deg, #8b5cf6, #a855f7)", color: "white", borderRadius: "8px", textDecoration: "none" }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const estimate     = generateEstimate(project);
  const sqft         = parsePropertySize(project.notes);
  const userNotes    = stripInternalPrefix(project.notes);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #0b1020, #0f172a)", color: "white", padding: "24px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <Link href="/dashboard" style={{ width: "40px", height: "40px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", textDecoration: "none" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}>{project.title}</h1>
            <p style={{ fontSize: "14px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
              <Calendar size={14} />
              Created {formatDate(project.createdAt)}
            </p>
          </div>
        </div>

        {/* Project Summary */}
        <div style={{ marginBottom: "24px", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px" }}>Project Summary</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>

            <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <Building size={16} color="#60a5fa" />
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Property Type</span>
              </div>
              <div style={{ fontWeight: 500 }}>{project.propertyType}</div>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <Ruler size={16} color="#4ade80" />
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Property Size</span>
              </div>
              <div style={{ fontWeight: 500 }}>{sqft ? `${sqft.toLocaleString()} sqft` : "Not specified"}</div>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <Home size={16} color="#fbbf24" />
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Rooms</span>
              </div>
              <div style={{ fontWeight: 500 }}>
                {project.roomCount ? `${project.roomCount} room${project.roomCount !== 1 ? "s" : ""}` : "Not specified"}
              </div>
            </div>

            <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <Palette size={16} color="#a78bfa" />
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Style</span>
              </div>
              <div style={{ fontWeight: 500 }}>{capitalise(project.stylePreference)}</div>
            </div>

          </div>

          {project.budget && (
            <div style={{ marginTop: "16px", padding: "12px", borderRadius: "10px", border: "1px solid rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.05)" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>Your Budget: </span>
              <span style={{ fontWeight: 600, color: "#4ade80" }}>
                ${project.budget.toLocaleString("en-SG")} SGD
              </span>
            </div>
          )}

          {userNotes && (
            <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#cbd5e1", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={16} /> Your Notes
              </h3>
              <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>{userNotes}</p>
            </div>
          )}
        </div>

        {/* Estimated Budget */}
        <div style={{ marginBottom: "24px", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
            <DollarSign size={20} color="#4ade80" />
            Estimated Renovation Cost
          </h2>
          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>AI estimate based on property type and size</p>

          {estimate ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                <div style={{ padding: "20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#4ade80", marginBottom: "4px" }}>{estimate.low}</div>
                  <div style={{ fontSize: "14px", color: "#94a3b8" }}>Low Range</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Basic finishes, standard fixtures</div>
                </div>
                <div style={{ padding: "20px", borderRadius: "10px", border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.05)", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "white", marginBottom: "4px" }}>{estimate.typical}</div>
                  <div style={{ fontSize: "14px", color: "#a78bfa", fontWeight: 500 }}>Typical Range</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>Recommended for most renovations</div>
                </div>
                <div style={{ padding: "20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#fbbf24", marginBottom: "4px" }}>{estimate.high}</div>
                  <div style={{ fontSize: "14px", color: "#94a3b8" }}>High Range</div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Premium materials, custom features</div>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", textAlign: "center" }}>
                Ranges based on {sqft?.toLocaleString()} sqft {project.propertyType}. Upload contractor quotes for a precise figure.
              </p>
            </>
          ) : (
            <div style={{ padding: "24px", borderRadius: "10px", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
              <Sparkles size={32} color="#64748b" style={{ margin: "0 auto 8px" }} />
              <p style={{ color: "#cbd5e1", fontWeight: 500, marginBottom: "4px" }}>No estimate available yet</p>
              <p style={{ color: "#64748b", fontSize: "14px" }}>
                Add your property size when creating a project, or upload contractor quotes to get a cost estimate.
              </p>
            </div>
          )}
        </div>

        {/* Quote Upload Section */}
        {projectId && (
          <div style={{ marginBottom: "24px" }}>
            <QuoteUpload projectId={projectId} onUploadComplete={() => window.location.reload()} />
          </div>
        )}

        {/* Next Steps */}
        <div style={{ marginBottom: "24px", padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px" }}>Next Steps</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>

            <div style={{ padding: "20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", opacity: 0.6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "40px", height: "40px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload size={20} color="#a78bfa" />
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>Quote Analysis Complete</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>AI-powered analysis available above</div>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b" }}>
                Upload quotes above to get instant AI analysis and market comparison.
              </p>
            </div>

            <div style={{ padding: "20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "40px", height: "40px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MessageSquare size={20} color="#60a5fa" />
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>Chat with AI Advisor</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Personalised renovation guidance</div>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "12px" }}>
                Ask about design choices, materials, timelines, and contractor selection for your specific project.
              </p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 12px", borderRadius: "6px", background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                <Clock size={12} /> Coming soon
              </span>
            </div>

          </div>
        </div>

        {/* Project Status */}
        <div style={{ padding: "24px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Project Progress</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Project created",                done: true  },
              { label: "Add property size & style",      done: !!sqft },
              { label: "Upload contractor quotes",       done: false },
              { label: "Review AI quote analysis",       done: false },
              { label: "Select contractor & finalise",   done: false },
              { label: "Begin renovation",               done: false },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {step.done
                  ? <CheckCircle size={20} color="#4ade80" />
                  : <Circle size={20} color="#475569" />}
                <span style={{ color: step.done ? "#cbd5e1" : "#64748b" }}>
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
