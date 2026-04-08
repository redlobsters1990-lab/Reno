"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  DollarSign, 
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Download,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Filter,
  SortAsc,
  SortDesc,
  Search,
  Plus,
  Shield,
  Clock
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Quote {
  id: string;
  contractorName: string;
  totalAmount: number | null;
  status: "pending" | "accepted" | "rejected" | "negotiating";
  notes: string | null;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface QuoteManagerProps {
  quotes: Quote[];
  projectId: string;
  onUpload?: (file: File, data: Partial<Quote>) => Promise<void>;
  onDelete?: (quoteId: string) => Promise<void>;
  onUpdate?: (quoteId: string, data: Partial<Quote>) => Promise<void>;
}

export function QuoteManager({ quotes, projectId, onUpload, onDelete, onUpdate }: QuoteManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "name">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newQuote, setNewQuote] = useState({
    contractorName: "",
    totalAmount: "",
    notes: "",
    status: "pending" as const,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate quote statistics
  const stats = {
    total: quotes.length,
    accepted: quotes.filter(q => q.status === "accepted").length,
    pending: quotes.filter(q => q.status === "pending").length,
    negotiating: quotes.filter(q => q.status === "negotiating").length,
    totalValue: quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0),
    averageValue: quotes.length > 0 
      ? quotes.reduce((sum, q) => sum + (q.totalAmount || 0), 0) / quotes.length 
      : 0,
    minValue: quotes.length > 0 
      ? Math.min(...quotes.map(q => q.totalAmount || Infinity))
      : 0,
    maxValue: quotes.length > 0 
      ? Math.max(...quotes.map(q => q.totalAmount || 0))
      : 0,
  };

  // Filter and sort quotes
  const filteredQuotes = quotes
    .filter(quote => {
      if (statusFilter !== "all" && quote.status !== statusFilter) return false;
      if (searchTerm && !quote.contractorName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let aValue: string | number | Date = a.createdAt;
      let bValue: string | number | Date = b.createdAt;
      
      if (sortBy === "amount") {
        aValue = a.totalAmount || 0;
        bValue = b.totalAmount || 0;
      } else if (sortBy === "name") {
        aValue = a.contractorName.toLowerCase();
        bValue = b.contractorName.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!onUpload) return;
    
    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);
    
    try {
      await onUpload(file, {
        contractorName: newQuote.contractorName || "Unknown Contractor",
        totalAmount: newQuote.totalAmount ? parseFloat(newQuote.totalAmount) : null,
        notes: newQuote.notes || null,
        status: newQuote.status,
      });
      
      setUploadSuccess(true);
      setNewQuote({
        contractorName: "",
        totalAmount: "",
        notes: "",
        status: "pending",
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload quote");
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuote.contractorName.trim()) {
      setUploadError("Contractor name is required");
      return;
    }
    
    if (onUpload) {
      setUploading(true);
      setUploadError("");
      
      try {
        await onUpload(new File([], "manual-quote.txt"), {
          contractorName: newQuote.contractorName,
          totalAmount: newQuote.totalAmount ? parseFloat(newQuote.totalAmount) : null,
          notes: newQuote.notes || null,
          status: newQuote.status,
        });
        
        setUploadSuccess(true);
        setNewQuote({
          contractorName: "",
          totalAmount: "",
          notes: "",
          status: "pending",
        });
        
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Failed to add quote");
      } finally {
        setUploading(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "pending": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "negotiating": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "rejected": return "bg-red-500/10 text-red-400 border-red-500/30";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "negotiating": return <TrendingUp className="h-4 w-4" />;
      case "rejected": return <X className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (quotes.length === 0) {
    return (
      <div className="space-y-6">
        {/* Upload Area */}
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-4 animate-float">
              <Upload className="h-10 w-10 text-violet-300" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No Quotes Yet</h3>
            <p className="text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">
              Upload contractor quotes to compare prices, track negotiations, and make informed decisions.
            </p>
          </div>

          {/* Upload Form */}
          <div className="max-w-2xl mx-auto">
            <div
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 text-center transition-all",
                dragActive 
                  ? "border-violet-500 bg-violet-500/5" 
                  : "border-white/10 hover:border-violet-400/30 hover:bg-white/5"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-violet-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Upload Quote</h4>
              <p className="text-slate-400 mb-6">
                Drag & drop a PDF, image, or document, or click to browse
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium transition"
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Browse Files"}
              </button>
              
              <div className="mt-4 text-sm text-slate-500">
                Supports PDF, JPG, PNG, DOC (Max 10MB)
              </div>
            </div>

            {/* Manual Entry */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-px bg-white/20"></div>
                <div className="text-sm text-slate-400">Or enter manually</div>
                <div className="h-6 w-px bg-white/20"></div>
              </div>
              
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Contractor Name *
                    </label>
                    <input
                      type="text"
                      value={newQuote.contractorName}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, contractorName: e.target.value }))}
                      className="input"
                      placeholder="e.g., ABC Renovation Pte Ltd"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Total Amount (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        SGD
                      </span>
                      <input
                        type="number"
                        value={newQuote.totalAmount}
                        onChange={(e) => setNewQuote(prev => ({ ...prev, totalAmount: e.target.value }))}
                        className="input pl-12"
                        placeholder="e.g., 50000"
                        min="0"
                        step="1000"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newQuote.notes}
                    onChange={(e) => setNewQuote(prev => ({ ...prev, notes: e.target.value }))}
                    className="textarea"
                    placeholder="Any notes about this quote..."
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      value={newQuote.status}
                      onChange={(e) => setNewQuote(prev => ({ ...prev, status: e.target.value as any }))}
                      className="input"
                    >
                      <option value="pending">Pending Review</option>
                      <option value="negotiating">Negotiating</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={uploading || !newQuote.contractorName.trim()}
                    className="px-6 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Adding..." : "Add Quote"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {uploadError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-300 mb-1">Upload Failed</h3>
                <p className="text-sm text-red-400/80">{uploadError}</p>
              </div>
            </div>
          </div>
        )}

        {uploadSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-emerald-300 mb-1">Quote Added Successfully!</h3>
                <p className="text-sm text-emerald-400/80">
                  Your quote has been added and is ready for comparison.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
          <div className="text-2xl font-bold mb-1">{stats.total}</div>
          <div className="text-sm text-slate-400">Total Quotes</div>
        </div>
        
        <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
          <div className="text-2xl font-bold mb-1">{stats.accepted}</div>
          <div className="text-sm text-slate-400">Accepted</div>
        </div>
        
        <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
          <div className="text-2xl font-bold mb-1">{stats.pending}</div>
          <div className="text-sm text-slate-400">Pending</div>
        </div>
        
        <div className="p-4 rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
          <div className="text-2xl font-bold mb-1">{formatCurrency(stats.totalValue)}</div>
          <div className="text-sm text-slate-400">Total Value</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
              placeholder="Search quotes..."
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input text-sm py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="negotiating">Negotiating</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSort