"use client";

import { useState } from "react";
import { 
  Brain, 
  Clock, 
  Star, 
  Target, 
  Lightbulb, 
  AlertCircle,
  CheckCircle,
  MessageSquare,
  FileText,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  Calendar
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MemoryItem {
  id: string;
  memoryType: string;
  note: string;
  createdAt: string;
  confidence?: number;
  source?: string;
}

interface MemorySummaryProps {
  memories: MemoryItem[];
  title?: string;
  showFilters?: boolean;
  maxItems?: number;
}

export function MemorySummary({ memories, title = "Project Memories", showFilters = true, maxItems = 10 }: MemorySummaryProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);

  const getMemoryIcon = (type: string) => {
    switch (type) {
      case "design_assumption":
        return <Lightbulb className="h-4 w-4 text-blue-400" />;
      case "unresolved_decision":
        return <AlertCircle className="h-4 w-4 text-amber-400" />;
      case "quote_issue":
        return <FileText className="h-4 w-4 text-red-400" />;
      case "room_priority":
        return <Target className="h-4 w-4 text-emerald-400" />;
      case "general_note":
        return <MessageSquare className="h-4 w-4 text-slate-400" />;
      case "inferred_assumption":
        return <Brain className="h-4 w-4 text-violet-400" />;
      case "style_preference":
        return <Star className="h-4 w-4 text-pink-400" />;
      case "budget_posture":
        return <TrendingUp className="h-4 w-4 text-cyan-400" />;
      case "family_constraints":
        return <Users className="h-4 w-4 text-orange-400" />;
      case "safety_preferences":
        return <Shield className="h-4 w-4 text-green-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-slate-400" />;
    }
  };

  const getMemoryTypeLabel = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getMemoryColor = (type: string) => {
    switch (type) {
      case "design_assumption":
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case "unresolved_decision":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "quote_issue":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      case "room_priority":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "style_preference":
        return "bg-pink-500/10 border-pink-500/30 text-pink-400";
      case "budget_posture":
        return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-400";
    }
  };

  const filteredMemories = memories.filter(memory => {
    if (filter === "all") return true;
    if (filter === "assumptions") return memory.memoryType.includes("assumption");
    if (filter === "decisions") return memory.memoryType.includes("decision");
    if (filter === "preferences") return memory.memoryType.includes("preference") || memory.memoryType.includes("posture");
    if (filter === "issues") return memory.memoryType.includes("issue");
    return true;
  });

  const displayedMemories = showAll ? filteredMemories : filteredMemories.slice(0, maxItems);
  const hasMore = filteredMemories.length > maxItems && !showAll;

  const memoryStats = {
    total: memories.length,
    assumptions: memories.filter(m => m.memoryType.includes("assumption")).length,
    decisions: memories.filter(m => m.memoryType.includes("decision")).length,
    preferences: memories.filter(m => m.memoryType.includes("preference") || m.memoryType.includes("posture")).length,
    issues: memories.filter(m => m.memoryType.includes("issue")).length,
  };

  if (memories.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent text-center">
        <div className="h-16 w-16 rounded-full bg-violet-500/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-4">
          <Brain className="h-8 w-8 text-violet-300" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Memories Yet</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          As you chat with the AI advisor, important preferences, decisions, and assumptions will be automatically remembered here.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm">
          <Zap className="h-4 w-4" />
          <span>Start a conversation to build memories</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-400/30 flex items-center justify-center">
            <Brain className="h-5 w-5 text-violet-300" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-slate-400">
              {memories.length} memory{memories.length !== 1 ? 'ies' : ''} captured from conversations
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          {memoryStats.assumptions > 0 && (
            <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm">
              {memoryStats.assumptions} Assumptions
            </div>
          )}
          {memoryStats.decisions > 0 && (
            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
              {memoryStats.decisions} Decisions
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-2 rounded-xl border text-sm transition",
              filter === "all"
                ? "bg-violet-500/10 border-violet-500/30 text-violet-300"
                : "border-white/10 hover:border-white/20 text-slate-400 hover:text-white"
            )}
          >
            All ({memoryStats.total})
          </button>
          {memoryStats.assumptions > 0 && (
            <button
              onClick={() => setFilter("assumptions")}
              className={cn(
                "px-4 py-2 rounded-xl border text-sm transition",
                filter === "assumptions"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                  : "border-white/10 hover:border-white/20 text-slate-400 hover:text-white"
              )}
            >
              Assumptions ({memoryStats.assumptions})
            </button>
          )}
          {memoryStats.decisions > 0 && (
            <button
              onClick={() => setFilter("decisions")}
              className={cn(
                "px-4 py-2 rounded-xl border text-sm transition",
                filter === "decisions"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "border-white/10 hover:border-white/20 text-slate-400 hover:text-white"
              )}
            >
              Decisions ({memoryStats.decisions})
            </button>
          )}
          {memoryStats.preferences > 0 && (
            <button
              onClick={() => setFilter("preferences")}
              className={cn(
                "px-4 py-2 rounded-xl border text-sm transition",
                filter === "preferences"
                  ? "bg-pink-500/10 border-pink-500/30 text-pink-300"
                  : "border-white/10 hover:border-white/20 text-slate-400 hover:text-white"
              )}
            >
              Preferences ({memoryStats.preferences})
            </button>
          )}
          {memoryStats.issues > 0 && (
            <button
              onClick={() => setFilter("issues")}
              className={cn(
                "px-4 py-2 rounded-xl border text-sm transition",
                filter === "issues"
                  ? "bg-red-500/10 border-red-500/30 text-red-300"
                  : "border-white/10 hover:border-white/20 text-slate-400 hover:text-white"
              )}
            >
              Issues ({memoryStats.issues})
            </button>
          )}
        </div>
      )}

      {/* Memories List */}
      <div className="space-y-3">
        {displayedMemories.map((memory) => (
          <div
            key={memory.id}
            className="group relative p-4 rounded-xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent hover:border-white/20 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "h-10 w-10 rounded-lg border flex items-center justify-center flex-shrink-0",
                getMemoryColor(memory.memoryType)
              )}>
                {getMemoryIcon(memory.memoryType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      getMemoryColor(memory.memoryType)
                    )}>
                      {getMemoryTypeLabel(memory.memoryType)}
                    </div>
                    {memory.confidence && memory.confidence > 0.8 && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                        <CheckCircle className="h-3 w-3" />
                        <span>High Confidence</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(memory.createdAt)}</span>
                  </div>
                </div>
                
                <div className="text-sm text-slate-300 mb-2">
                  {expanded === memory.id ? memory.note : `${memory.note.substring(0, 150)}${memory.note.length > 150 ? '...' : ''}`}
                </div>
                
                {memory.note.length > 150 && (
                  <button
                    onClick={() => setExpanded(expanded === memory.id ? null : memory.id)}
                    className="text-sm text-violet-300 hover:text-violet-200 transition flex items-center gap-1"
                  >
                    {expanded === memory.id ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Read More
                      </>
                    )}
                  </button>
                )}
                
                {memory.source && (
                  <div className="mt-2 text-xs text-slate-500">
                    Source: {memory.source}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More / Less */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-3 rounded-xl border border-white/10 hover:border-violet-400/30 hover:bg-white/5 transition flex items-center gap-2 mx-auto"
          >
            <ChevronDown className="h-4 w-4" />
            <span>Show {filteredMemories.length - maxItems} More Memories</span>
          </button>
        </div>
      )}

      {showAll && filteredMemories.length > maxItems && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(false)}
            className="px-6 py-3 rounded-xl border border-white/10 hover:border-violet-400/30 hover:bg-white/5 transition flex items-center gap-2 mx-auto"
          >
            <ChevronUp className="h-4 w-4" />
            <span>Show Less</span>
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3">
            <div className="text-2xl font-bold text-violet-300 mb-1">{memoryStats.total}</div>
            <div className="text-sm text-slate-400">Total Memories</div>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl font-bold text-blue-300 mb-1">{memoryStats.assumptions}</div>
            <div className="text-sm text-slate-400">Assumptions</div>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl font-bold text-amber-300 mb-1">{memoryStats.decisions}</div>
            <div className="text-sm text-slate-400">Decisions</div>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl font-bold text-pink-300 mb-1">{memoryStats.preferences}</div>
            <div className="text-sm text-slate-400">Preferences</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Shield className="h-4 w-4" />
            <span>Memories help personalize future advice and maintain project context</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for displaying memory insights
interface MemoryInsightsProps {
  memories: MemoryItem[];
}

export function MemoryInsights({ memories }: MemoryInsightsProps) {
  if (memories.length === 0) return null;

  const recentMemories = [...memories]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const getInsightType = (memory: MemoryItem) => {
    if (memory.memoryType.includes("preference")) return "preference";
    if (memory.memoryType.includes("assumption")) return "assumption";
    if (memory.memoryType.includes("decision")) return "decision";
    if (memory.memoryType.includes("issue")) return "issue";
    return "note";
  };

  const insights = recentMemories.map(memory => ({
    type: getInsightType(memory),
    text: memory.note,
    date: memory.createdAt,
    icon: getMemoryIcon(memory.memoryType)
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-violet-300" />
        Recent Insights
      </h3>
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-400/20 flex items-center justify-center flex-shrink-0">
                {insight.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-300 mb-1">{insight.text}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(insight.date)}</span>
                  <span className