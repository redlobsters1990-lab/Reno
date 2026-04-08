"use client";

import { useState, useCallback } from "react";
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
    priceAssessment: string;
    redFlags: string[];
    recommendations: string[];
    marketComparison: {
      yourQuote: number;
      marketLow: number;
      marketAverage: number;
      marketHigh: number;
    };
  };
}

export function QuoteUpload({ projectId, onUploadComplete }: QuoteUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    contractorName: "",
    companyName: "",
    amount: "",
  });

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
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    if (!formData.contractorName || !formData.amount) {
      setError("Please enter contractor name and quote amount first");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      formDataObj.append("contractorName", formData.contractorName);
      formDataObj.append("companyName", formData.companyName);
      formDataObj.append("amount", formData.amount);
      formDataObj.append("projectId", projectId);

      const response = await fetch(`/api/projects/${projectId}/quotes`, {
        method: "POST",
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error occurred" }));
        throw new Error(errorData.error || `Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      setQuotes(prev => [{
        id: data.quote.id,
        contractorName: formData.contractorName,
        companyName: formData.companyName,
        amount: parseFloat(formData.amount),
        fileName: file.name,
        fileUrl: data.quote.fileUrl,
        uploadedAt: new Date().toISOString(),
        status: "analyzing",
      }, ...prev]);

      // Reset form
      setFormData({ contractorName: "", companyName: "", amount: "" });
      
      // Start AI analysis
      analyzeQuote(data.quote.id);
      
      onUploadComplete?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload quote";
      console.error("Upload error:", err);
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const analyzeQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/quotes/${quoteId}/analyze`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to analyze quote");
      }

      const data = await response.json();

      setQuotes(prev => prev.map(quote => 
        quote.id === quoteId 
          ? { ...quote, status: "analyzed", analysis: data.analysis }
          : quote
      ));
    } catch (err) {
      setQuotes(prev => prev.map(quote => 
        quote.id === quoteId 
          ? { ...quote, status: "error" }
          : quote
      ));
    }
  };

  const deleteQuote = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/quotes/${quoteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete quote");
      }

      setQuotes(prev => prev.filter(q => q.id !== quoteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete quote");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Upload Form */}
      <div style={{ padding: "24px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Upload Contractor Quote</h3>
        
        {error && (
          <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <AlertCircle size={20} color="#ef4444" />
              <span style={{ color: "#ef4444", fontSize: "16px", fontWeight: 600 }}>Upload Failed</span>
            </div>
            <p style={{ color: "#fca5a5", fontSize: "14px", marginLeft: "28px" }}>{error}</p>
            <p style={{ color: "#64748b", fontSize: "12px", marginLeft: "28px", marginTop: "8px" }}>
              Please check your connection and try again. If the problem persists, contact support.
            </p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
              Contractor Name *
            </label>
            <div style={{ position: "relative" }}>
              <User style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={16} />
              <input
                type="text"
                placeholder="John Doe"
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
              Company Name
            </label>
            <div style={{ position: "relative" }}>
              <Building style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={16} />
              <input
                type="text"
                placeholder="ABC Renovations"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
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
              Quote Amount (SGD) *
            </label>
            <div style={{ position: "relative" }}>
              <DollarSign style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={16} />
              <input
                type="number"
                placeholder="50000"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
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
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            padding: "32px",
            borderRadius: "12px",
            border: isDragging ? "2px dashed #8b5cf6" : "2px dashed rgba(255,255,255,0.2)",
            background: isDragging ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id="quote-file-input"
          />
          <label htmlFor="quote-file-input" style={{ cursor: "pointer" }}>
            {uploading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Loader2 size={32} color="#a78bfa" style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ color: "#94a3b8" }}>Uploading and analyzing...</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <Upload size={32} color="#a78bfa" />
                <div>
                  <p style={{ color: "white", fontWeight: 500, marginBottom: "4px" }}>
                    Drop quote file here or click to browse
                  </p>
                  <p style={{ color: "#64748b", fontSize: "14px" }}>
                    Supports PDF, JPG, PNG (max 10MB)
                  </p>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Quotes List */}
      {quotes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600 }}>Uploaded Quotes ({quotes.length})</h3>
          
          {quotes.map((quote) => (
            <div
              key={quote.id}
              style={{
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: 600 }}>{quote.contractorName}</h4>
                    {quote.status === "analyzing" && (
                      <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", background: "rgba(59,130,246,0.2)", color: "#60a5fa", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                        Analyzing
                      </span>
                    )}
                    {quote.status === "analyzed" && quote.analysis?.isFair && (
                      <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", background: "rgba(34,197,94,0.2)", color: "#4ade80" }}>
                        Fair Price
                      </span>
                    )}
                    {quote.status === "analyzed" && !quote.analysis?.isFair && (
                      <span style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px", background: "rgba(239,68,68,0.2)", color: "#ef4444" }}>
                        Review Needed
                      </span>
                    )}
                  </div>
                  {quote.companyName && (
                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>{quote.companyName}</p>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "20px", fontWeight: "bold", color: "#4ade80" }}>
                    ${quote.amount.toLocaleString()}
                  </p>
                  <button
                    onClick={() => deleteQuote(quote.id)}
                    style={{
                      padding: "4px",
                      background: "transparent",
                      border: "none",
                      color: "#64748b",
                      cursor: "pointer",
                      marginTop: "8px",
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* File Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", marginBottom: "16px" }}>
                <FileText size={16} color="#94a3b8" />
                <span style={{ fontSize: "14px", color: "#94a3b8", flex: 1 }}>{quote.fileName}</span>
                <a
                  href={quote.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "14px", color: "#a78bfa", textDecoration: "none" }}
                >
                  View
                </a>
              </div>

              {/* AI Analysis */}
              {quote.analysis && (
                <div style={{ padding: "16px", borderRadius: "8px", background: quote.analysis.isFair ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)", border: `1px solid ${quote.analysis.isFair ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    {quote.analysis.isFair ? (
                      <CheckCircle size={20} color="#4ade80" />
                    ) : (
                      <AlertCircle size={20} color="#ef4444" />
                    )}
                    <span style={{ fontWeight: 600, color: quote.analysis.isFair ? "#4ade80" : "#ef4444" }}>
                      {quote.analysis.priceAssessment}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      ({Math.round(quote.analysis.confidence * 100)}% confidence)
                    </span>
                  </div>

                  {/* Market Comparison */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "12px", padding: "12px", borderRadius: "6px", background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Your Quote</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>${quote.analysis.marketComparison.yourQuote.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Market Low</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#4ade80" }}>${quote.analysis.marketComparison.marketLow.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Average</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#a78bfa" }}>${quote.analysis.marketComparison.marketAverage.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>Market High</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#fbbf24" }}>${quote.analysis.marketComparison.marketHigh.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Red Flags */}
                  {quote.analysis.redFlags.length > 0 && (
                    <div style={{ marginBottom: "12px" }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#ef4444", marginBottom: "8px" }}>Red Flags:</p>
                      <ul style={{ margin: 0, paddingLeft: "16px", color: "#94a3b8", fontSize: "14px" }}>
                        {quote.analysis.redFlags.map((flag, i) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {quote.analysis.recommendations.length > 0 && (
                    <div>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#4ade80", marginBottom: "8px" }}>Recommendations:</p>
                      <ul style={{ margin: 0, paddingLeft: "16px", color: "#94a3b8", fontSize: "14px" }}>
                        {quote.analysis.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
