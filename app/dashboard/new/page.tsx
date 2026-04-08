"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Home, Building, Palette, DollarSign, FileText, Ruler,
  CheckCircle, ArrowLeft, Plus, AlertCircle, Loader2, Calendar
} from "lucide-react";

// Simple auth check
function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return document.cookie.includes('auth-token=');
}

export default function SimpleNewProjectPage() {
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
    // Simple check for auth cookie
    const hasAuthCookie = document.cookie.includes('auth-token=');
    if (!hasAuthCookie) {
      console.warn("No auth cookie found, redirecting to signin");
      router.push("/auth/signin");
      return;
    }
    
    setAuthChecked(true);
    setLoading(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
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

      // Redirect to the new project
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
      <div className="min-h-screen bg-gradient-to-b from-background to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-400 mx-auto mb-4" />
          <p className="text-body text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-950">
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="btn-secondary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
            <div>
              <h1 className="text-h1 font-bold">Create New Project</h1>
              <p className="text-body text-text-secondary mt-1">Plan your renovation with AI guidance</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="alert-error mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{errors.submit}</span>
            </div>
            {(errors.submit.includes("Authentication") || errors.submit.includes("session") || errors.submit.includes("sign in")) && (
              <div className="text-small mt-2">
                <Link href="/auth/cleanup" className="text-error-300 hover:text-error-200 underline">
                  Clear invalid cookies and try again
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Main Form */}
        <main id="main-content">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Basics */}
            <div className="card p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-xl bg-info-500/10 border border-info-400/20 flex items-center justify-center">
                  <Home className="h-6 w-6 text-info-300" />
                </div>
                <h2 className="text-h2 font-bold">Project Basics</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Project Name */}
                <div>
                  <label htmlFor="name" className="input-label">
                    Project Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className={`input ${errors.name ? 'input-error' : ''}`}
                    placeholder="Kitchen Renovation 2024"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    aria-describedby={errors.name ? "name-error" : "name-description"}
                  />
                  {errors.name ? (
                    <p id="name-error" className="text-small text-error-500 mt-2">{errors.name}</p>
                  ) : (
                    <p id="name-description" className="text-small text-text-tertiary mt-2">
                      Give your project a descriptive name
                    </p>
                  )}
                </div>
                
                {/* Property Type */}
                <div>
                  <label htmlFor="propertyType" className="input-label">
                    Property Type
                  </label>
                  <select
                    id="propertyType"
                    name="propertyType"
                    className="select"
                    value={formData.propertyType}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="HDB BTO">HDB BTO</option>
                    <option value="HDB Resale">HDB Resale</option>
                    <option value="Condo">Condo</option>
                    <option value="Landed">Landed</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                  <p className="text-small text-text-tertiary mt-2">
                    Select your property type for accurate estimates
                  </p>
                </div>
                
                {/* Property Size */}
                <div>
                  <label htmlFor="propertySize" className="input-label">
                    Property Size (sq ft) *
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                    <input
                      id="propertySize"
                      type="number"
                      name="propertySize"
                      className={`input pl-12 ${errors.propertySize ? 'input-error' : ''}`}
                      placeholder="850"
                      value={formData.propertySize}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      aria-describedby={errors.propertySize ? "propertySize-error" : "propertySize-description"}
                    />
                  </div>
                  {errors.propertySize ? (
                    <p id="propertySize-error" className="text-small text-error-500 mt-2">{errors.propertySize}</p>
                  ) : (
                    <p id="propertySize-description" className="text-small text-text-tertiary mt-2">
                      Total area in square feet
                    </p>
                  )}
                </div>
                
                {/* Number of Rooms */}
                <div>
                  <label htmlFor="rooms" className="input-label">
                    Number of Rooms
                  </label>
                  <select
                    id="rooms"
                    name="rooms"
                    className="select"
                    value={formData.rooms}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="1">1 Room</option>
                    <option value="2">2 Rooms</option>
                    <option value="3">3 Rooms</option>
                    <option value="4">4 Rooms</option>
                    <option value="5">5+ Rooms</option>
                  </select>
                  <p className="text-small text-text-tertiary mt-2">
                    Number of rooms being renovated
                  </p>
                </div>
              </div>
            </div>

            {/* Budget & Style */}
            <div className="card p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-xl bg-success-500/10 border border-success-400/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-success-300" />
                </div>
                <h2 className="text-h2 font-bold">Budget & Style</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Budget */}
                <div>
                  <label htmlFor="budget" className="input-label">
                    Budget (SGD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                    <input
                      id="budget"
                      type="number"
                      name="budget"
                      className={`input pl-12 ${errors.budget ? 'input-error' : ''}`}
                      placeholder="50000"
                      value={formData.budget}
                      onChange={handleChange}
                      disabled={submitting}
                      aria-describedby={errors.budget ? "budget-error" : "budget-description"}
                    />
                  </div>
                  {errors.budget ? (
                    <p id="budget-error" className="text-small text-error-500 mt-2">{errors.budget}</p>
                  ) : (
                    <p id="budget-description" className="text-small text-text-tertiary mt-2">
                      Leave empty for AI recommendation
                    </p>
                  )}
                </div>
                
                {/* Style Preference */}
                <div>
                  <label htmlFor="stylePreference" className="input-label">
                    Style Preference
                  </label>
                  <div className="relative">
                    <Palette className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                    <select
                      id="stylePreference"
                      name="stylePreference"
                      className="select pl-12"
                      value={formData.stylePreference}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="modern">Modern</option>
                      <option value="minimalist">Minimalist</option>
                      <option value="scandinavian">Scandinavian</option>
                      <option value="industrial">Industrial</option>
                      <option value="traditional">Traditional</option>
                    </select>
                  </div>
                  <p className="text-small text-text-tertiary mt-2">
                    Your preferred design style
                  </p>
                </div>
                
                {/* Timeline */}
                <div>
                  <label htmlFor="timeline" className="input-label">
                    Timeline (months)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-tertiary" />
                    <select
                      id="timeline"
                      name="timeline"
                      className="select pl-12"
                      value={formData.timeline}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="1">1 month</option>
                      <option value="2">2 months</option>
                      <option value="3">3 months</option>
                      <option value="6">6 months</option>
                      <option value="12">12+ months</option>
                    </select>
                  </div>
                  <p className="text-small text-text-tertiary mt-2">
                    Expected renovation timeline
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="card p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-xl bg-primary-500/10 border border-primary-400/20 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary-300" />
                </div>
                <h2 className="text-h2 font-bold">Additional Notes</h2>
              </div>
              
              <div>
                <label htmlFor="notes" className="input-label">
                  Project Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  className="textarea"
                  placeholder="Describe your renovation goals, specific requirements, or any special considerations..."
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={submitting}
                  aria-describedby="notes-description"
                />
                <p id="notes-description" className="text-small text-text-tertiary mt-2">
                  Optional: Add any details that will help with AI recommendations
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-white/10">
              <Link
                href="/dashboard"
                className="btn-secondary"
                disabled={submitting}
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                className="btn-primary px-8 py-4 text-lg"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}