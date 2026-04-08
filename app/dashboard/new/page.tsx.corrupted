"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  ArrowLeft, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Target,
  DollarSign,
  Palette,
  FileText,
  Zap,
  Lightbulb,
  Shield
} from "lucide-react";
import { propertyTypes, stylePreferences } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { projectSchema, validateForm, validateField } from "@/lib/validation";
import { LoadingSpinner, ErrorState } from "@/components/loading-states";

type ProjectFormData = {
  title: string;
  propertyType: string;
  roomCount: string;
  budget: string;
  stylePreference: string;
  notes: string;
};

type FormErrors = Record<string, string>;

export default function NewProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    propertyType: "",
    roomCount: "",
    budget: "",
    stylePreference: "",
    notes: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const validateFieldValue = (name: string, value: string): string => {
    return validateField(projectSchema, name, value);
  };

  const validateFormData = (): boolean => {
    const result = validateForm(projectSchema, formData);
    setErrors(result.errors);
    return result.isValid;
  };

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Validate field if it's been touched
    if (touched[field]) {
      const error = validateFieldValue(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof ProjectFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateFieldValue(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSuccess(false);

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate form
    if (!validateFormData()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors).find(key => errors[key]);
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const data = await response.json();
      setSuccess(true);
      
      // Redirect to the new project after a short delay
      setTimeout(() => {
        router.push(`/dashboard/projects/${data.project.id}`);
      }, 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error creating project:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFieldStatus = (field: keyof ProjectFormData) => {
    if (!touched[field]) return "untouched";
    if (errors[field]) return "error";
    if (formData[field]) return "success";
    return "untouched";
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-400/30 flex items-center justify-center">
              <Plus className="h-5 w-5 text-violet-300" />
            </div>
            <h1 className="text-2xl font-bold">Create New Project</h1>
          </div>
          <p className="text-slate-400">
            Start planning your renovation with AI-powered guidance and tools
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-300 mb-1">Project Created Successfully!</h3>
                <p className="text-emerald-400/80">
                  Redirecting to your new project...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mb-8">
            <ErrorState 
              title="Failed to Create Project"
              message={submitError}
              variant="inline"
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Basics Card */}
          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Project Basics</h2>
                <p className="text-sm text-slate-400">Essential information about your renovation</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Project Title *
                </label>
                <div className="relative">
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    onBlur={() => handleBlur("title")}
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border bg-white/5 placeholder-slate-500 focus:outline-none focus:ring-2 transition",
                      getFieldStatus("title") === "error"
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                        : getFieldStatus("title") === "success"
                        ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20"
                        : "border-white/10 focus:border-violet-500 focus:ring-violet-500/20"
                    )}
                    placeholder="e.g., HDB Kitchen & Bathroom Renovation"
                    disabled={loading || success}
                  />
                  {getFieldStatus("title") === "success" && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400" />
                  )}
                </div>
                {errors.title && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.title}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Give your project a descriptive name
                </p>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Property Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {propertyTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange("propertyType", type.value)}
                      onBlur={() => handleBlur("propertyType")}
                      className={cn(
                        "p-4 rounded-xl border text-left transition",
                        formData.propertyType === type.value
                          ? "bg-violet-500/10 border-violet-500/30 text-violet-300"
                          : "border-white/10 hover:border-white/20 text-slate-400 hover:text-white",
                        errors.propertyType && !formData.propertyType
                          ? "border-red-500/50"
                          : ""
                      )}
                      disabled={loading || success}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          formData.propertyType === type.value
                            ? "bg-violet-500/20"
                            : "bg-white/5"
                        )}>
                          <type.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-slate-500">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.propertyType && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.propertyType}
                  </p>
                )}
              </div>

              {/* Room Count & Budget */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="roomCount" className="block text-sm font-medium mb-2">
                    Number of Rooms (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="roomCount"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.roomCount}
                      onChange={(e) => handleChange("roomCount", e.target.value)}
                      onBlur={() => handleBlur("roomCount")}
                      className={cn(
                        "w-full px-4 py-3 rounded-xl border bg-white/5 placeholder-slate-500 focus:outline-none focus:ring-2 transition",
                        getFieldStatus("roomCount") === "error"
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                          : getFieldStatus("roomCount") === "success"
                          ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20"
                          : "border-white/10 focus:border-violet-500 focus:ring-violet-500/20"
                      )}
                      placeholder="e.g., 4"
                      disabled={loading || success}
                    />
                    {getFieldStatus("roomCount") === "success" && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400" />
                    )}
                  </div>
                  {errors.roomCount && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.roomCount}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-medium mb-2">
                    Budget (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                      SGD
                    </span>
                    <input
                      id="budget"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.budget}
                      onChange={(e) => handleChange("budget", e.target.value)}
                      onBlur={() => handleBlur("budget")}
                      className={cn(
                        "w-full pl-12 pr-10 py-3 rounded-xl border bg-white/5 placeholder-slate-500 focus:outline-none focus:ring-2 transition",
                        getFieldStatus("budget") === "error"
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                          : getFieldStatus("budget") === "success"
                          ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20"
                          : "border-white/10 focus:border-violet-500 focus:ring-violet-500/20"
                      )}
                      placeholder="e.g., 50000"
                      disabled={loading || success}
                    />
                    {getFieldStatus("budget") === "success" && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400" />
                    )}
                  </div>
                  {errors.budget && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.budget}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    Leave blank for AI estimation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Design Preferences Card */}
          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-400/20 flex items-center justify-center">
                <Palette className="h-5 w-5 text-pink-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Design Preferences</h2>
                <p className="text-sm text-slate-400">Help us understand your style</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Style Preference */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Style Preference (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {stylePreferences.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => handleChange("stylePreference", style.value)}
                      onBlur={() => handleBlur("stylePreference")}
                      className={cn(
                        "p-4 rounded-xl border text-left transition",
                        formData.stylePreference === style.value
                          ? "bg-pink-500/10 border-pink-500/30 text-pink-300"
                          : "border-white/10 hover:border-white/20 text-slate-400 hover:text-white"
                      )}
                      disabled={loading || success}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          formData.stylePreference === style.value
                            ? "bg-pink-500/20"
                            : "bg-white/5"
                        )}>
                          <style.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{style.label}</div>
                          <div className="text-xs text-slate-500">{style.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.stylePreference && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-