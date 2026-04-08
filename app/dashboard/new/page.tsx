"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Building, Palette, DollarSign, FileText, Ruler, CheckCircle, ArrowLeft, Plus, AlertCircle, Loader2, Calendar } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    propertyType: "HDB Resale",
    propertySize: "",
    budget: "",
    stylePreference: "modern",
    rooms: "3",
    timeline: "3",
    notes: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const hasAuthCookie = document.cookie.includes('auth-token=');
    if (!hasAuthCookie) {
      router.push("/auth/signin");
      return;
    }
    
    setAuthChecked(true);
    setLoading(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    }
    
    if (!formData.propertySize.trim()) {
      newErrors.propertySize = "Property size is required";
    } else if (isNaN(Number(formData.propertySize)) || Number(formData.propertySize) <= 0) {
      newErrors.propertySize = "Please enter a valid size in square feet";
    }
    
    if (formData.budget && (isNaN(Number(formData.budget)) || Number(formData.budget) < 0)) {
      newErrors.budget = "Please enter a valid budget";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      router.push(data.redirect);
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create project";
      setErrors({ submit: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #0b1020, #0f172a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 size={32} color="#a78bfa" style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#94a3b8" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom, #0b1020, #0f172a)", color: "white" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <Link
            href="/dashboard"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#94a3b8", textDecoration: "none", marginBottom: "16px" }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>Create New Project</h1>
          <p style={{ fontSize: "16px", color: "#94a3b8" }}>Plan your renovation with AI guidance</p>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div style={{ padding: "16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertCircle size={20} color="#ef4444" />
            <span style={{ color: "#ef4444" }}>{errors.submit}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Project Basics */}
          <div style={{ padding: "32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Home size={24} color="#60a5fa" />
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Project Basics</h2>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {/* Project Name */}
              <div>
                <label htmlFor="name" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
                  Project Name *
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Kitchen Renovation 2024"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: errors.name ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
                    border: errors.name ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
                {errors.name ? (
                  <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>{errors.name}</p>
                ) : (
                  <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Give your project a descriptive name</p>
                )}
              </div>
              
              {/* Property Type */}
              <div>
                <label htmlFor="propertyType" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
                  Property Type
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="HDB BTO" style={{ background: "#0b1020" }}>HDB BTO</option>
                  <option value="HDB Resale" style={{ background: "#0b1020" }}>HDB Resale</option>
                  <option value="Condo" style={{ background: "#0b1020" }}>Condo</option>
                  <option value="Landed" style={{ background: "#0b1020" }}>Landed</option>
                  <option value="Commercial" style={{ background: "#0b1020" }}>Commercial</option>
                </select>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Select your property type for accurate estimates</p>
              </div>
              
              {/* Property Size */}
              <div>
                <label htmlFor="propertySize" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
                  Property Size (sq ft) *
                </label>
                <div style={{ position: "relative" }}>
                  <Ruler style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={20} />
                  <input
                    id="propertySize"
                    type="number"
                    name="propertySize"
                    placeholder="850"
                    value={formData.propertySize}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 48px",
                      background: errors.propertySize ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
                      border: errors.propertySize ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "16px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                {errors.propertySize ? (
                  <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>{errors.propertySize}</p>
                ) : (
                  <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Total area in square feet</p>
                )}
              </div>
              
              {/* Number of Rooms */}
              <div>
                <label htmlFor="rooms" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
                  Number of Rooms
                </label>
                <select
                  id="rooms"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="1" style={{ background: "#0b1020" }}>1 Room</option>
                  <option value="2" style={{ background: "#0b1020" }}>2 Rooms</option>
                  <option value="3" style={{ background: "#0b1020" }}>3 Rooms</option>
                  <option value="4" style={{ background: "#0b1020" }}>4 Rooms</option>
                  <option value="5" style={{ background: "#0b1020" }}>5+ Rooms</option>
                </select>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Number of rooms being renovated</p>
              </div>
            </div>
          </div>

          {/* Budget & Style */}
          <div style={{ padding: "32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DollarSign size={24} color="#4ade80" />
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Budget & Style</h2>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {/* Budget */}
              <div>
                <label htmlFor="budget" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
                  Budget (SGD)
                </label>
                <div style={{ position: "relative" }}>
                  <DollarSign style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={20} />
                  <input
                    id="budget"
                    type="number"
                    name="budget"
                    placeholder="50000"
                    value={formData.budget}
                    onChange={handleChange}
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 48px",
                      background: errors.budget ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
                      border: errors.budget ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "16px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                {errors.budget ? (
                  <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>{errors.budget}</p>
                ) : (
                  <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Leave empty for AI recommendation</p>
                )}
              </div>
              
              {/* Style Preference */}
              <div>
                <label htmlFor="stylePreference" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
                  Style Preference
                </label>
                <div style={{ position: "relative" }}>
                  <Palette style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={20} />
                  <select
                    id="stylePreference"
                    name="stylePreference"
                    value={formData.stylePreference}
                    onChange={handleChange}
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 48px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "16px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="modern" style={{ background: "#0b1020" }}>Modern</option>
                    <option value="minimalist" style={{ background: "#0b1020" }}>Minimalist</option>
                    <option value="scandinavian" style={{ background: "#0b1020" }}>Scandinavian</option>
                    <option value="industrial" style={{ background: "#0b1020" }}>Industrial</option>
                    <option value="traditional" style={{ background: "#0b1020" }}>Traditional</option>
                  </select>
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Your preferred design style</p>
              </div>
              
              {/* Timeline */}
              <div>
                <label htmlFor="timeline" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
                  Timeline (months)
                </label>
                <div style={{ position: "relative" }}>
                  <Calendar style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={20} />
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 48px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "white",
                      fontSize: "16px",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="1" style={{ background: "#0b1020" }}>1 month</option>
                    <option value="2" style={{ background: "#0b1020" }}>2 months</option>
                    <option value="3" style={{ background: "#0b1020" }}>3 months</option>
                    <option value="6" style={{ background: "#0b1020" }}>6 months</option>
                    <option value="12" style={{ background: "#0b1020" }}>12+ months</option>
                  </select>
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Expected renovation timeline</p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div style={{ padding: "32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={24} color="#a78bfa" />
              </div>
              <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Additional Notes</h2>
            </div>
            
            <div>
              <label htmlFor="notes" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "white", marginBottom: "8px" }}>
                Project Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Describe your renovation goals, specific requirements, or any special considerations..."
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                  minHeight: "100px"
                }}
              />
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Optional: Add any details that will help with AI recommendations</p>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <Link
              href="/dashboard"
              style={{ padding: "12px 24px", color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "14px 32px",
                background: submitting ? "rgba(139,92,246,0.5)" : "linear-gradient(135deg, #8b5cf6, #a855f7)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                  Creating Project...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
