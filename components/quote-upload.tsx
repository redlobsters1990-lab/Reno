"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, DollarSign, Building, User } from "lucide-react";

interface QuoteUploadProps {
  projectId: string;
  onUploadComplete?: () => void;
}

interface QuoteData {
  id: string;
  contractorName: string;
  companyName: string;
  amount: number;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: "pending" | "analyzing" | "analyzed" | "error";
  analysis?: {
    isFair: boolean;
    confidence: number;
    confidenceBreakdown?: {
      base: number;
      signals: Array<{ label: string; weight: number; met: boolean }>;
      score: number;
    };
    priceAssessment: string;
    strengths?: string[];
    redFlags: string[];
    recommendations: string[];
    decision?: {
      recommendation: string;
      riskLevel: "low" | "medium" | "high";
      reasons: string[];
      mustClarify: string[];
      negotiationPoints: string[];
      exclusionGuide?: Array<{
        exclusion: string;
        riskLevel: "low" | "medium" | "high";
        whyItMatters: string;
        askContractor: string;
        recommendedAction: string;
      }>;
    };
    documentInsights?: {
      lineItemCount: number;
      exclusionsCount: number;
      paymentTermsCount: number;
      warrantyTermsCount: number;
      materialsMentionsCount: number;
      timelineMentionsCount: number;
    };
    marketComparison: {
      yourQuote: number;
      marketLow: number;
      marketAverage: number;
      marketHigh: number;
    };
  };
}

function mapQuote(raw: any): QuoteData {
  let meta: any = {};
  try { meta = raw.parsingSummary ? JSON.parse(raw.parsingSummary) : {}; } catch {}
  const analysis = raw.analysis || meta.analysis;
  return {
    id: raw.id,
    contractorName: raw.contractorName,
    companyName: raw.companyName || meta.companyName || "",
    amount: raw.totalAmount ?? raw.amount ?? 0,
    fileName: raw.fileName || meta.fileName || "Uploaded quote",
    fileUrl: raw.fileUrl || meta.fileUrl || "#",
    uploadedAt: raw.createdAt,
    status: analysis ? "analyzed" : raw.status === "draft" ? "pending" : raw.status === "parsed" ? "analyzed" : raw.status === "reviewed" ? "analyzed" : raw.status === "error" ? "error" : "pending",
    analysis,
  };
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: "8px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", textAlign: "center" }}>
      <div style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>{value}</div>
      <div style={{ fontSize: "11px", color: "#64748b" }}>{label}</div>
    </div>
  );
}

interface ComparisonData {
  quoteCount: number;
  lowestQuote: { id: string; contractorName: string; companyName: string; amount: number; riskLevel: string; isFair: boolean };
  highestQuote: { id: string; contractorName: string; companyName: string; amount: number; riskLevel: string; isFair: boolean };
  averageAmount: number;
  spreadPercent: number | null;
  rankedByAmount: Array<{ id: string; contractorName: string; companyName: string; amount: number; riskLevel: string; isFair: boolean; priceAssessment: string }>;
  fairQuotes: number;
  lowRiskQuotes: number;
  recommendation: string;
}

export function QuoteUpload({ projectId, onUploadComplete }: QuoteUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastEvent, setLastEvent] = useState("");
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [formData, setFormData] = useState({ contractorName: "", companyName: "", amount: "" });

  const loadQuotes = useCallback(async () => {
    try {
      setLoadingQuotes(true);
      const response = await fetch(`/api/projects/${projectId}/quotes`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load quotes");
      setQuotes((data.quotes || []).map(mapQuote));
      setComparison(data.comparison || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuotes(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) loadQuotes();
  }, [projectId, loadQuotes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) await uploadFile(files[0]);
  }, [formData, projectId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = "";
  };

  const uploadFile = async (file: File) => {
    // Company name is required — block upload before touching the network
    if (!formData.companyName.trim()) {
      setError("Company name is required. Please enter the company name before uploading.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setLastEvent(`Starting upload for ${file.name}...`);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("contractorName", formData.contractorName.trim());
      fd.append("companyName", formData.companyName.trim());
      fd.append("amount", formData.amount);

      const response = await fetch(`/api/projects/${projectId}/quotes`, { method: "POST", body: fd });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Upload failed: ${response.status}`);

      const optimisticQuote = mapQuote({
        ...data.quote,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      setQuotes(prev => [{ ...optimisticQuote, status: "analyzing" }, ...prev]);
      setFormData({ contractorName: "", companyName: "", amount: "" });
      setSuccess("Quote uploaded. Running AI analysis...");
      setLastEvent(`Upload complete for ${file.name}. Starting AI analysis...`);

      await analyzeQuote(data.quote.id);
      await loadQuotes();
      setSuccess("Quote uploaded and analyzed successfully.");
      setLastEvent(`Analysis finished for ${file.name}. Results are shown below.`);
      onUploadComplete?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload quote";
      console.error("Upload error:", err);
      setError(errorMessage);
      setLastEvent(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const analyzeQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/quotes/${quoteId}/analyze`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to analyze quote");
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: "analyzed", analysis: data.analysis } : q));
      setLastEvent("AI analysis completed successfully.");
    } catch (err) {
      console.error("Analyze error:", err);
      const message = err instanceof Error ? err.message : "Quote uploaded but analysis failed";
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: "error" } : q));
      setError(message);
      setLastEvent(`Analysis failed: ${message}`);
      setSuccess("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>Upload Contractor Quote</h3>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "16px" }}>Upload the contractor PDF or image quote. The system will extract the contractor, amount, and line items automatically.</p>
        {error && (
          <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <AlertCircle size={20} color="#ef4444" />
              <span style={{ color: "#ef4444", fontSize: "16px", fontWeight: 600 }}>Quote workflow failed</span>
            </div>
            <p style={{ color: "#fca5a5", fontSize: "14px", marginLeft: "28px" }}>{error}</p>
          </div>
        )}
        {success && (
          <div style={{ padding: "14px 16px", borderRadius: "8px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle size={18} color="#4ade80" />
            <span style={{ color: "#86efac", fontSize: "14px", fontWeight: 500 }}>{success}</span>
          </div>
        )}
        {lastEvent && (
          <div style={{ padding: "12px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "16px" }}>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Latest quote workflow event</div>
            <div style={{ fontSize: "14px", color: "#cbd5e1", fontWeight: 500 }}>{lastEvent}</div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
              Contractor Name <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ position: "relative" }}>
              <User style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={16} />
              <input
                type="text"
                placeholder="e.g. John Tan"
                value={formData.contractorName}
                onChange={(e) => setFormData(prev => ({ ...prev, contractorName: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
              Company Name <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <Building style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: formData.companyName.trim() ? "#a78bfa" : "#64748b" }} size={16} />
              <input
                type="text"
                placeholder="e.g. ABC Renovations Pte Ltd (required)"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${formData.companyName.trim() ? "rgba(139,92,246,0.4)" : "rgba(239,68,68,0.4)"}`,
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
            {!formData.companyName.trim() && (
              <p style={{ fontSize: "12px", color: "#f87171", marginTop: "4px" }}>Required before uploading</p>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>Quote Amount (optional override)</label>
            <div style={{ position: "relative" }}>
              <DollarSign style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={16} />
              <input type="number" placeholder="50000" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} style={{ width: "100%", padding: "10px 12px 10px 40px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", fontSize: "14px", outline: "none" }} />
            </div>
          </div>
        </div>

        {/* Upload drop zone — locked until company name is filled */}
        <div
          onDragOver={formData.companyName.trim() ? handleDragOver : undefined}
          onDragLeave={formData.companyName.trim() ? handleDragLeave : undefined}
          onDrop={formData.companyName.trim() ? handleDrop : undefined}
          style={{
            padding: "32px",
            borderRadius: "12px",
            border: !formData.companyName.trim()
              ? "2px dashed rgba(239,68,68,0.25)"
              : isDragging
              ? "2px dashed #8b5cf6"
              : "2px dashed rgba(255,255,255,0.2)",
            background: !formData.companyName.trim()
              ? "rgba(239,68,68,0.03)"
              : isDragging
              ? "rgba(139,92,246,0.1)"
              : "rgba(255,255,255,0.02)",
            textAlign: "center",
            cursor: formData.companyName.trim() ? "pointer" : "not-allowed",
            transition: "all 0.3s",
            opacity: formData.companyName.trim() ? 1 : 0.5,
          }}
        >
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} style={{ display: "none" }} id="quote-file-input" disabled={!formData.companyName.trim()} />
          <label htmlFor="quote-file-input" style={{ cursor: formData.companyName.trim() ? "pointer" : "not-allowed" }}>
            {uploading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}><Loader2 size={32} color="#a78bfa" style={{ animation: "spin 1s linear infinite" }} /><span style={{ color: "#94a3b8" }}>Uploading and analyzing...</span></div>
            ) : formData.companyName.trim() ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Upload size={32} color="#a78bfa" />
                <div>
                  <p style={{ color: "white", fontWeight: 500, marginBottom: "4px" }}>Drop quote file here or click to browse</p>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>Supports PDF, JPG, PNG (max 10MB)</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <Building size={28} color="#ef4444" style={{ opacity: 0.5 }} />
                <p style={{ color: "#f87171", fontWeight: 500, fontSize: "14px" }}>Enter company name above to unlock upload</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 600 }}>Uploaded Quotes</h3>
        {loadingQuotes && <span style={{ color: "#64748b", fontSize: "14px" }}>Refreshing…</span>}
      </div>

      {comparison && (
        <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.05)" }}>
          <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px", color: "#a78bfa" }}>Quote Comparison</h4>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>{comparison.quoteCount} quotes analysed</p>

          <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", marginBottom: "16px", fontSize: "14px", color: "#cbd5e1" }}>
            💡 {comparison.recommendation}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "16px" }}>
            <div style={{ textAlign: "center", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Lowest</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#4ade80" }}>${comparison.lowestQuote.amount.toLocaleString()}</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{comparison.lowestQuote.companyName || comparison.lowestQuote.contractorName}</div>
            </div>
            <div style={{ textAlign: "center", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Average</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#a78bfa" }}>${comparison.averageAmount.toLocaleString()}</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>across all quotes</div>
            </div>
            <div style={{ textAlign: "center", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Highest</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#fbbf24" }}>${comparison.highestQuote.amount.toLocaleString()}</div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{comparison.highestQuote.companyName || comparison.highestQuote.contractorName}</div>
            </div>
            {comparison.spreadPercent !== null && (
              <div style={{ textAlign: "center", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.2)" }}>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Price Spread</div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: comparison.spreadPercent > 50 ? "#ef4444" : "#f97316" }}>{comparison.spreadPercent}%</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>low to high</div>
              </div>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  {["Rank", "Contractor", "Amount", "vs Average", "Risk", "Assessment"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px", color: "#64748b", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rankedByAmount.map((q, i) => {
                  const diff = q.amount - comparison.averageAmount;
                  const pct = comparison.averageAmount > 0 ? Math.round((diff / comparison.averageAmount) * 100) : 0;
                  const riskColor = q.riskLevel === "low" ? "#4ade80" : q.riskLevel === "medium" ? "#fbbf24" : "#f87171";
                  return (
                    <tr key={q.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: i === 0 ? "rgba(34,197,94,0.04)" : "transparent" }}>
                      <td style={{ padding: "10px 8px", color: i === 0 ? "#4ade80" : "#64748b", fontWeight: i === 0 ? 700 : 400 }}>#{i + 1}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ fontWeight: 500, color: "white" }}>{q.companyName || q.contractorName}</div>
                        {q.companyName && q.contractorName && <div style={{ fontSize: "11px", color: "#64748b" }}>{q.contractorName}</div>}
                      </td>
                      <td style={{ padding: "10px 8px", fontWeight: 700, color: "white" }}>${q.amount.toLocaleString()}</td>
                      <td style={{ padding: "10px 8px", color: diff <= 0 ? "#4ade80" : "#f87171", fontWeight: 600 }}>{diff <= 0 ? "" : "+"}{pct}%</td>
                      <td style={{ padding: "10px 8px" }}>
                        <span style={{ padding: "3px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: `${riskColor}22`, color: riskColor }}>{q.riskLevel.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: "10px 8px", color: "#94a3b8", maxWidth: "180px" }}>{q.priceAssessment}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {quotes.length === 0 && !loadingQuotes ? (
        <div style={{ padding: "20px", borderRadius: "12px", border: "1px dashed rgba(255,255,255,0.15)", color: "#94a3b8", textAlign: "center" }}>No contractor quotes uploaded yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {quotes.map((quote) => (
            <div key={quote.id} style={{ padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 600 }}>{quote.companyName || quote.contractorName}</h4>
                    {quote.status === "analyzing" && <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", background: "rgba(59,130,246,0.2)", color: "#60a5fa", display: "flex", alignItems: "center", gap: "4px" }}><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />Analyzing</span>}
                    {quote.status === "analyzed" && quote.analysis?.isFair && <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", background: "rgba(34,197,94,0.2)", color: "#4ade80" }}>Fair Price</span>}
                    {quote.status === "analyzed" && !quote.analysis?.isFair && <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", background: "rgba(239,68,68,0.2)", color: "#ef4444" }}>Review Needed</span>}
                    {quote.status === "error" && <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", background: "rgba(239,68,68,0.2)", color: "#ef4444" }}>Analysis Failed</span>}
                  </div>
                  {quote.companyName && <p style={{ color: "#94a3b8", fontSize: "14px" }}>{quote.companyName}</p>}
                </div>
                <div style={{ textAlign: "right" }}><p style={{ fontSize: "20px", fontWeight: "bold", color: "#4ade80" }}>${quote.amount.toLocaleString()}</p></div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", marginBottom: "16px" }}>
                <FileText size={16} color="#94a3b8" />
                <span style={{ fontSize: "14px", color: "#94a3b8", flex: 1 }}>{quote.fileName}</span>
                {quote.fileUrl !== "#" && <a href={quote.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#a78bfa", textDecoration: "none" }}>View</a>}
              </div>

              {quote.analysis && (
                <div style={{ padding: "16px", borderRadius: "8px", background: quote.analysis.isFair ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)", border: `1px solid ${quote.analysis.isFair ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    {quote.analysis.isFair ? <CheckCircle size={20} color="#4ade80" /> : <AlertCircle size={20} color="#ef4444" />}
                    <span style={{ fontWeight: 600, color: quote.analysis.isFair ? "#4ade80" : "#ef4444" }}>{quote.analysis.priceAssessment}</span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>({Math.round(quote.analysis.confidence * 100)}% confidence)</span>
                  </div>

                  {/* Confidence breakdown — shows user exactly how the score was earned */}
                  {quote.analysis.confidenceBreakdown && (
                    <details style={{ marginBottom: "12px" }}>
                      <summary style={{ fontSize: "12px", color: "#64748b", cursor: "pointer", userSelect: "none", marginBottom: "8px" }}>
                        How is the {Math.round(quote.analysis.confidence * 100)}% confidence calculated?
                      </summary>
                      <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", fontSize: "12px" }}>
                        <div style={{ color: "#64748b", marginBottom: "8px" }}>
                          Base score: {Math.round(quote.analysis.confidenceBreakdown.base * 100)}% — raised by signals found in your document:
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {quote.analysis.confidenceBreakdown.signals.map((s, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: s.met ? "rgba(34,197,94,0.2)" : "rgba(100,116,139,0.2)", border: `1px solid ${s.met ? "#4ade80" : "#475569"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: s.met ? "#4ade80" : "#475569", flexShrink: 0 }}>
                                {s.met ? "✓" : "×"}
                              </span>
                              <span style={{ flex: 1, color: s.met ? "#cbd5e1" : "#475569" }}>{s.label}</span>
                              <span style={{ color: s.met ? "#4ade80" : "#475569", fontWeight: 600 }}>{s.met ? `+${Math.round(s.weight * 100)}%` : `+0%`}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
                          Total: {Math.round(quote.analysis.confidenceBreakdown.base * 100)}% base + {Math.round((quote.analysis.confidence - quote.analysis.confidenceBreakdown.base) * 100)}% from signals = <strong style={{ color: "white" }}>{Math.round(quote.analysis.confidence * 100)}%</strong>
                        </div>
                      </div>
                    </details>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "12px", padding: "12px", borderRadius: "6px", background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: "12px", color: "#64748b" }}>Your Quote</div><div style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>${quote.analysis.marketComparison.yourQuote.toLocaleString()}</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: "12px", color: "#64748b" }}>Market Low</div><div style={{ fontSize: "14px", fontWeight: 600, color: "#4ade80" }}>${quote.analysis.marketComparison.marketLow.toLocaleString()}</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: "12px", color: "#64748b" }}>Average</div><div style={{ fontSize: "14px", fontWeight: 600, color: "#a78bfa" }}>${quote.analysis.marketComparison.marketAverage.toLocaleString()}</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: "12px", color: "#64748b" }}>Market High</div><div style={{ fontSize: "14px", fontWeight: 600, color: "#fbbf24" }}>${quote.analysis.marketComparison.marketHigh.toLocaleString()}</div></div>
                  </div>
                  {quote.analysis.decision && (
                    <div style={{ marginBottom: "12px", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Decision guidance</div>
                          <div style={{ fontSize: "18px", fontWeight: 700, color: "white" }}>{quote.analysis.decision.recommendation}</div>
                        </div>
                        <div style={{ padding: "6px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, background: quote.analysis.decision.riskLevel === "low" ? "rgba(34,197,94,0.15)" : quote.analysis.decision.riskLevel === "medium" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", color: quote.analysis.decision.riskLevel === "low" ? "#4ade80" : quote.analysis.decision.riskLevel === "medium" ? "#fbbf24" : "#f87171" }}>
                          {quote.analysis.decision.riskLevel.toUpperCase()} RISK
                        </div>
                      </div>
                      {quote.analysis.decision.reasons?.length > 0 && <div style={{ marginBottom: "10px" }}><p style={{ fontSize: "12px", fontWeight: 600, color: "#cbd5e1", marginBottom: "6px" }}>Why</p><ul style={{ margin: 0, paddingLeft: "16px", color: "#94a3b8", fontSize: "14px" }}>{quote.analysis.decision.reasons.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
                      {quote.analysis.decision.mustClarify?.length > 0 && <div style={{ marginBottom: "10px" }}><p style={{ fontSize: "12px", fontWeight: 600, color: "#fbbf24", marginBottom: "6px" }}>Must clarify before signing</p><ul style={{ margin: 0, paddingLeft: "16px", color: "#94a3b8", fontSize: "14px" }}>{quote.analysis.decision.mustClarify.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
                      {quote.analysis.decision.negotiationPoints?.length > 0 && <div style={{ marginBottom: "10px" }}><p style={{ fontSize: "12px", fontWeight: 600, color: "#a78bfa", marginBottom: "6px" }}>Negotiation points</p><ul style={{ margin: 0, paddingLeft: "16px", color: "#94a3b8", fontSize: "14px" }}>{quote.analysis.decision.negotiationPoints.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
                      {quote.analysis.decision.exclusionGuide && quote.analysis.decision.exclusionGuide.length > 0 && (
                        <div>
                          <p style={{ fontSize: "12px", fontWeight: 600, color: "#f97316", marginBottom: "8px" }}>Exclusions to discuss with contractor</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {quote.analysis.decision.exclusionGuide.map((item, i) => (
                              <div key={i} style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                                  <div style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>{item.exclusion}</div>
                                  <div style={{ padding: "4px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, background: item.riskLevel === "high" ? "rgba(239,68,68,0.15)" : item.riskLevel === "medium" ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)", color: item.riskLevel === "high" ? "#f87171" : item.riskLevel === "medium" ? "#fbbf24" : "#4ade80" }}>{item.riskLevel.toUpperCase()} RISK</div>
                                </div>
                                <div style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "6px" }}><strong>Why it matters:</strong> {item.whyItMatters}</div>
                                <div style={{ fontSize: "13px", color: "#cbd5e1", marginBottom: "6px" }}><strong>Ask contractor:</strong> {item.askContractor}</div>
                                <div style={{ fontSize: "13px", color: "#cbd5e1" }}><strong>Recommended action:</strong> {item.recommendedAction}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {quote.analysis.documentInsights && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
                      <Metric label="Line items" value={quote.analysis.documentInsights.lineItemCount} />
                      <Metric label="Exclusions" value={quote.analysis.documentInsights.exclusionsCount} />
                      <Metric label="Payment terms" value={quote.analysis.documentInsights.paymentTermsCount} />
                      <Metric label="Warranty terms" value={quote.analysis.documentInsights.warrantyTermsCount} />
                      <Metric label="Materials" value={quote.analysis.documentInsights.materialsMentionsCount} />
                      <Metric label="Timeline refs" value={quote.analysis.documentInsights.timelineMentionsCount} />
                    </div>
                  )}
                  {(quote.analysis.strengths ?? []).length > 0 && <div style={{ marginBottom: "12px" }}><p style={{ fontSize: "12px", fontWeight: 600, color: "#4ade80", marginBottom: "8px" }}>Strengths:</p><ul style={{ margin: 0, paddingLeft: "16px", color: "#94a3b8", fontSize: "14px" }}>{(quote.analysis.strengths ?? []).map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
                  {quote.analysis.redFlags?.length > 0 && <div style={{ marginBottom: "12px" }}><p style={{ fontSize: "12px", fontWeight: 600, color: "#ef4444", marginBottom: "8px" }}>Red Flags:</p><ul style={{ margin: 0, paddingLeft: "16px", color: "#94a3b8", fontSize: "14px" }}>{quote.analysis.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}</ul></div>}
                  {quote.analysis.recommendations?.length > 0 && <div><p style={{ fontSize: "12px", fontWeight: 600, color: "#4ade80", marginBottom: "8px" }}>Recommendations:</p><ul style={{ margin: 0, paddingLeft: "16px", color: "#94a3b8", fontSize: "14px" }}>{quote.analysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
