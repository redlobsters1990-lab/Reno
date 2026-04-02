"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Info,
  BarChart3,
  Target,
  Zap,
  Shield,
  Calculator
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface EstimateDisplayProps {
  estimate: {
    leanMin: number;
    leanMax: number;
    realisticMin: number;
    realisticMax: number;
    stretchMin: number;
    stretchMax: number;
    confidence: "low" | "medium" | "high";
    assumptions: string;
    costDrivers: string;
    createdAt: string;
  };
  showDetails?: boolean;
  compact?: boolean;
}

export function EstimateDisplay({ estimate, showDetails = true, compact = false }: EstimateDisplayProps) {
  const [showAssumptions, setShowAssumptions] = useState(false);
  
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "medium": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "low": return "text-red-400 bg-red-500/10 border-red-500/30";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };
  
  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case "high": return <CheckCircle className="h-4 w-4" />;
      case "medium": return <Info className="h-4 w-4" />;
      case "low": return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };
  
  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case "high": return "High Confidence";
      case "medium": return "Medium Confidence";
      case "low": return "Low Confidence";
      default: return "Unknown Confidence";
    }
  };

  if (compact) {
    return (
      <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-violet-300" />
            <span className="text-sm font-medium">Cost Estimate</span>
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getConfidenceColor(estimate.confidence)}`}>
            {getConfidenceIcon(estimate.confidence)}
            <span>{getConfidenceText(estimate.confidence)}</span>
          </div>
        </div>
        
        <div className="text-center mb-3">
          <div className="text-2xl font-bold">
            {formatCurrency(estimate.realisticMin)} - {formatCurrency(estimate.realisticMax)}
          </div>
          <div className="text-sm text-slate-400">Realistic Range</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center p-2 rounded-lg bg-slate-800/50">
            <div className="font-medium">{formatCurrency(estimate.leanMin)}</div>
            <div className="text-xs text-slate-400">Lean Min</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/50">
            <div className="font-medium">{formatCurrency(estimate.stretchMax)}</div>
            <div className="text-xs text-slate-400">Stretch Max</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confidence Banner */}
      <div className={`p-4 rounded-xl border ${getConfidenceColor(estimate.confidence)}`}>
        <div className="flex items-center gap-3">
          {getConfidenceIcon(estimate.confidence)}
          <div className="flex-1">
            <div className="font-medium">{getConfidenceText(estimate.confidence)}</div>
            <div className="text-sm opacity-80">
              {estimate.confidence === "high" && "Based on clear inputs and typical market rates"}
              {estimate.confidence === "medium" && "Based on reasonable assumptions with some uncertainty"}
              {estimate.confidence === "low" && "Based on limited information - consider getting quotes"}
            </div>
          </div>
        </div>
      </div>

      {/* Price Ranges */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-violet-300" />
          <h3 className="text-lg font-semibold">Estimated Cost Ranges</h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Lean Range */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-emerald-300" />
              <div className="font-medium text-emerald-300">Lean Budget</div>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(estimate.leanMin)} - {formatCurrency(estimate.leanMax)}
            </div>
            <div className="text-sm text-emerald-400/80">
              Basic scope, standard materials, minimal contingencies
            </div>
          </div>
          
          {/* Realistic Range */}
          <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/10 relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-medium">
                Recommended
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-violet-300" />
              <div className="font-medium text-violet-300">Realistic Range</div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(estimate.realisticMin)} - {formatCurrency(estimate.realisticMax)}
            </div>
            <div className="text-sm text-violet-400/80">
              Good quality, reasonable contingencies, typical market rates
            </div>
          </div>
          
          {/* Stretch Range */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-amber-300" />
              <div className="font-medium text-amber-300">Stretch Budget</div>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(estimate.stretchMin)} - {formatCurrency(estimate.stretchMax)}
            </div>
            <div className="text-sm text-amber-400/80">
              Premium materials, generous contingencies, higher-end finishes
            </div>
          </div>
        </div>
      </div>

      {/* Cost Drivers */}
      {estimate.costDrivers && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-violet-300" />
            <h3 className="text-lg font-semibold">Key Cost Drivers</h3>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm whitespace-pre-wrap">{estimate.costDrivers}</div>
          </div>
        </div>
      )}

      {/* Assumptions */}
      {showDetails && estimate.assumptions && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-violet-300" />
              <h3 className="text-lg font-semibold">Assumptions & Notes</h3>
            </div>
            <button
              onClick={() => setShowAssumptions(!showAssumptions)}
              className="text-sm text-violet-300 hover:text-violet-200 transition"
            >
              {showAssumptions ? "Hide Details" : "Show Details"}
            </button>
          </div>
          
          {showAssumptions && (
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-sm whitespace-pre-wrap">{estimate.assumptions}</div>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-xl border border-slate-500/20 bg-slate-500/5">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-slate-400 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-300 mb-1">Important Disclaimer</div>
            <div className="text-sm text-slate-400">
              This is an AI-generated estimate based on typical market rates and assumptions. Actual costs may vary based on specific requirements, contractor rates, material choices, and unforeseen circumstances. Always get multiple quotes from licensed contractors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for displaying estimate comparison
interface EstimateComparisonProps {
  estimates: Array<{
    id: string;
    realisticMin: number;
    realisticMax: number;
    confidence: string;
    createdAt: string;
    assumptions?: string;
  }>;
}

export function EstimateComparison({ estimates }: EstimateComparisonProps) {
  if (estimates.length === 0) return null;
  
  const sortedEstimates = [...estimates].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const latest = sortedEstimates[0];
  const previous = sortedEstimates[1];
  
  const getChange = () => {
    if (!previous) return null;
    
    const latestMid = (latest.realisticMin + latest.realisticMax) / 2;
    const previousMid = (previous.realisticMin + previous.realisticMax) / 2;
    const change = ((latestMid - previousMid) / previousMid) * 100;
    
    return {
      value: change,
      isPositive: change > 0,
      text: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
    };
  };
  
  const change = getChange();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Estimate History</h3>
        {change && (
          <div className={cn(
            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm",
            change.isPositive 
              ? "text-red-400 bg-red-500/10 border border-red-500/30"
              : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
          )}>
            {change.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{change.text} from previous</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {sortedEstimates.map((estimate, index) => (
          <div key={estimate.id} className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-400/20 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-violet-300" />
                </div>
                <div>
                  <div className="font-medium">
                    {formatCurrency(estimate.realisticMin)} - {formatCurrency(estimate.realisticMax)}
                  </div>
                  <div className="text-sm text-slate-400">
                    {new Date(estimate.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                estimate.confidence === "high" 
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
                  : estimate.confidence === "medium"
                  ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                  : "text-red-400 bg-red-500/10 border border-red-500/30"
              )}>
                {estimate.confidence === "high" && <CheckCircle className="h-3 w-3" />}
                {estimate.confidence === "medium" && <Info className="h-3 w-3" />}
                {estimate.confidence === "low" && <AlertCircle className="h-3 w-3" />}
                <span className="capitalize">{estimate.confidence} confidence</span>
              </div>
            </div>
            
            {index === 0 && (
              <div className="mt-2 text-sm text-violet-300 font-medium">
                Latest Estimate
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
