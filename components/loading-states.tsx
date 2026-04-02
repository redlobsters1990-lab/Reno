"use client";

import { Loader2, RefreshCw, AlertCircle, FileText, Brain, Calculator, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <Loader2 className={cn("animate-spin text-violet-400", sizeClasses[size], className)} />
  );
}

interface LoadingOverlayProps {
  message?: string;
  transparent?: boolean;
}

export function LoadingOverlay({ message = "Loading...", transparent = false }: LoadingOverlayProps) {
  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-center z-50",
      transparent ? "bg-black/20" : "bg-slate-900/80 backdrop-blur-sm"
    )}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
        <div className="text-sm text-slate-300 font-medium">{message}</div>
      </div>
    </div>
  );
}

interface SkeletonLoaderProps {
  type?: "card" | "list" | "text" | "image";
  count?: number;
  className?: string;
}

export function SkeletonLoader({ type = "card", count = 1, className }: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count });

  if (type === "card") {
    return (
      <div className={cn("space-y-4", className)}>
        {skeletons.map((_, i) => (
          <div key={i} className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent animate-pulse">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-700/50"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
                <div className="h-3 bg-slate-700/50 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className={cn("space-y-3", className)}>
        {skeletons.map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 animate-pulse">
            <div className="h-10 w-10 rounded-lg bg-slate-700/50"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-700/50 rounded w-2/3"></div>
              <div className="h-2 bg-slate-700/50 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {skeletons.map((_, i) => (
          <div key={i} className="h-4 bg-slate-700/50 rounded animate-pulse" style={{ width: `${80 - i * 10}%` }}></div>
        ))}
      </div>
    );
  }

  return null;
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  variant?: "default" | "minimal" | "card";
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  variant = "default" 
}: EmptyStateProps) {
  const defaultIcons = {
    projects: <FileText className="h-12 w-12 text-violet-300" />,
    memories: <Brain className="h-12 w-12 text-violet-300" />,
    estimates: <Calculator className="h-12 w-12 text-violet-300" />,
    quotes: <Upload className="h-12 w-12 text-violet-300" />,
  };

  const IconComponent = icon || defaultIcons.projects;

  if (variant === "minimal") {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
          {IconComponent}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-slate-400 mb-4">{description}</p>
        {action}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent text-center">
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
          {IconComponent}
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">{description}</p>
        {action}
      </div>
    );
  }

  return (
    <div className="p-12 rounded-3xl border-2 border-dashed border-white/10 bg-gradient-to-b from-white/2.5 to-transparent text-center">
      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-6 animate-float">
        {IconComponent}
      </div>
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <p className="text-slate-300 mb-8 max-w-md mx-auto leading-relaxed">{description}</p>
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: "default" | "inline";
}

export function ErrorState({ 
  title = "Something went wrong", 
  message, 
  onRetry,
  variant = "default" 
}: ErrorStateProps) {
  if (variant === "inline") {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-300 mb-1">{title}</h3>
            <p className="text-sm text-red-400/80">{message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-sm font-medium transition flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent text-center">
      <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-xl font-semibold text-red-300 mb-2">{title}</h3>
      <p className="text-red-400/80 mb-6 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-medium transition flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

// Specialized empty states for different sections
export function ProjectsEmptyState() {
  return (
    <EmptyState
      icon={<FileText className="h-12 w-12 text-violet-300" />}
      title="No Projects Yet"
      description="Create your first renovation project to get started with personalized AI guidance, cost estimates, and quote management."
      action={
        <a
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium transition"
        >
          Create First Project
        </a>
      }
    />
  );
}

export function MemoriesEmptyState() {
  return (
    <EmptyState
      icon={<Brain className="h-12 w-12 text-violet-300" />}
      title="No Memories Yet"
      description="As you chat with the AI advisor, important preferences, decisions, and assumptions will be automatically remembered here."
      variant="card"
    />
  );
}

export function EstimatesEmptyState() {
  return (
    <EmptyState
      icon={<Calculator className="h-12 w-12 text-violet-300" />}
      title="No Estimates Yet"
      description="Generate your first cost estimate to get realistic budget ranges for your renovation project."
      variant="card"
    />
  );
}

export function QuotesEmptyState() {
  return (
    <EmptyState
      icon={<Upload className="h-12 w-12 text-violet-300" />}
      title="No Quotes Yet"
      description="Upload contractor quotes to compare prices, track negotiations, and make informed decisions."
      variant="card"
    />
  );
}

export function ChatEmptyState() {
  return (
    <EmptyState
      icon={<Brain className="h-12 w-12 text-violet-300" />}
      title="Start a Conversation"
      description="Ask the AI advisor about design ideas, budget planning, material choices, or any renovation questions you have."
      variant="minimal"
    />
  );
}
