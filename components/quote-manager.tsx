"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Search, Filter, Download, Trash2, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { Quote } from "@/lib/schemas";
import { formatCurrency } from "@/lib/utils";

interface QuoteManagerProps {
  projectId: string;
  initialQuotes?: Quote[];
  onQuotesChange?: (quotes: Quote[]) => void;
}

export default function QuoteManager({ projectId, initialQuotes = [], onQuotesChange }: QuoteManagerProps) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [dragActive, setDragActive] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    contractor: "",
    amount: "",
    description: "",
    status: "pending" as const,
  });

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(`/api/uploads/${projectId}`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // In a real app, you would parse the uploaded files for quote data
        // For now, we'll create placeholder quotes
        const newQuotes: Quote[] = Array.from(files).map((file, index) => ({
          id: `temp-${Date.now()}-${index}`,
          projectId,
          contractor: `Contractor ${index + 1}`,
          amount: Math.floor(Math.random() * 50000) + 10000,
          description: `Quote from ${file.name}`,
          status: "pending",
          fileUrl: data.files?.[index]?.url || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        const updatedQuotes = [...quotes, ...newQuotes];
        setQuotes(updatedQuotes);
        onQuotesChange?.(updatedQuotes);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }, [projectId, quotes, onQuotesChange]);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  // Handle manual entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEntry.contractor || !manualEntry.amount) return;

    const newQuote: Quote = {
      id: `manual-${Date.now()}`,
      projectId,
      contractor: manualEntry.contractor,
      amount: parseFloat(manualEntry.amount),
      description: manualEntry.description,
      status: manualEntry.status,
      fileUrl: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedQuotes = [...quotes, newQuote];
    setQuotes(updatedQuotes);
    onQuotesChange?.(updatedQuotes);
    
    // Reset form
    setManualEntry({
      contractor: "",
      amount: "",
      description: "",
      status: "pending",
    });
  };

  // Update quote status
  const updateQuoteStatus = (quoteId: string, status: Quote["status"]) => {
    const updatedQuotes = quotes.map(quote =>
      quote.id === quoteId ? { ...quote, status, updatedAt: new Date() } : quote
    );
    setQuotes(updatedQuotes);
    onQuotesChange?.(updatedQuotes);
  };

  // Delete quote
  const deleteQuote = (quoteId: string) => {
    const updatedQuotes = quotes.filter(quote => quote.id !== quoteId);
    setQuotes(updatedQuotes);
    onQuotesChange?.(updatedQuotes);
  };

  // Filter and sort quotes
  const filteredQuotes = quotes
    .filter(quote => {
      const matchesSearch = 
        quote.contractor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === "pending").length,
    accepted: quotes.filter(q => q.status === "accepted").length,
    negotiating: quotes.filter(q => q.status === "negotiating").length,
    rejected: quotes.filter(q => q.status === "rejected").length,
    totalValue: quotes.reduce((sum, q) => sum + q.amount, 0),
    averageValue: quotes.length > 0 ? quotes.reduce((sum, q) => sum + q.amount, 0) / quotes.length : 0,
  };

  // Get status icon and color
  const getStatusInfo = (status: Quote["status"]) => {
    switch (status) {
      case "accepted":
        return { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" };
      case "rejected":
        return { icon: XCircle, color: "text-rose-400", bg: "bg-rose-400/10" };
      case "negotiating":
        return { icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" };
      default:
        return { icon: Clock, color: "text-slate-400", bg: "bg-slate-400/10" };
    }
  };

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-400/20 flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-violet-300" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No quotes yet</h3>
        <p className="text-slate-400 mb-6">Upload contractor quotes or add them manually to get started.</p>
        
        {/* Upload area */}
        <div
          className={`max-w-md mx-auto p-8 rounded-2xl border-2 border-dashed transition-colors ${
            dragActive 
              ? "border-violet-500 bg-violet-500/5" 
              : "border-white/10 hover:border-violet-400/30"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-violet-300" />
            </div>
            <p className="text-sm text-slate-300 mb-2">
              <span className="text-violet-300 font-medium">Drag & drop</span> quote files here
            </p>
            <p className="text-sm text-slate-400 mb-4">or</p>
            <label className="btn-primary cursor-pointer inline-block">
              Browse files
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </label>
            <p className="text-xs text-slate-500 mt-4">PDF, Word, Excel, Images up to 10MB each</p>
          </div>
        </div>

        {/* Manual entry form */}
        <div className="max-w-md mx-auto mt-8 p-6 rounded-xl border border-white/10">
          <h4 className="font-medium mb-4">Or add quote manually</h4>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Contractor Name</label>
              <input
                type="text"
                value={manualEntry.contractor}
                onChange={(e) => setManualEntry({ ...manualEntry, contractor: e.target.value })}
                className="input"
                placeholder="e.g., ABC Construction"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Amount ($)</label>
              <input
                type="number"
                value={manualEntry.amount}
                onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
                className="input"
                placeholder="e.g., 25000"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <textarea
                value={manualEntry.description}
                onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Brief description of the quote..."
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Status</label>
              <select
                value={manualEntry.status}
                onChange={(e) => setManualEntry({ ...manualEntry, status: e.target.value as Quote["status"] })}
                className="input"
              >
                <option value="pending">Pending</option>
                <option value="negotiating">Negotiating</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button type="submit" className="w-full btn-primary">
              Add Quote
            </button>
          </form>
        </div>
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
            onChange={(e) => setSortBy(e.target.value)}
            className="input text-sm py-2"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
          
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) handleFileUpload(files);
              };
              input.click();
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-sm font-medium text-slate-400">Contractor</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Amount</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Description</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Date</th>
              <th className="text-left p-4 text-sm font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map((quote) => {
              const StatusIcon = getStatusInfo(quote.status).icon;
              const statusColor = getStatusInfo(quote.status).color;
              const statusBg = getStatusInfo(quote.status).bg;
              
              return (
                <tr key={quote.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="font-medium">{quote.contractor}</div>
                    {quote.fileUrl && (
                      <a
                        href={quote.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-1"
                      >
                        <FileText className="h-3 w-3" />
                        View document
                      </a>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{formatCurrency(quote.amount)}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-300">{quote.description}</div>
                  </td>
                  <td className="p-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusBg}`}>
                      <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                      <span className={statusColor}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-400">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={quote.status}
                        onChange={(e) => updateQuoteStatus(quote.id, e.target.value as Quote["status"])}
                        className="text-xs bg-transparent border border-white/10 rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="negotiating">Negotiating</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button
                        onClick={() => deleteQuote(quote.id)}
                        className="p-1.5 rounded hover:bg-rose-500/10 text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state for filtered results */}
      {filteredQuotes.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No matching quotes</h3>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Manual entry form */}
      <div className="p-6 rounded-xl border border-white/10">
        <h4 className="font-medium mb-4">Add New Quote</h4>
        <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Contractor Name</label>
            <input
              type="text"
              value={manualEntry.contractor}
              onChange={(e) => setManualEntry({ ...manualEntry, contractor: e.target.value })}
              className="input"
              placeholder="e.g., ABC Construction"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Amount ($)</label>
            <input
              type="number"
              value={manualEntry.amount}
              onChange={(e) => setManualEntry({ ...manualEntry, amount: e.target.value })}
              className="input"
              placeholder="e.g., 25000"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={manualEntry.description}
              onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
              className="input min-h-[80px]"
              placeholder="Brief description of the quote..."
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Status</label>
            <select
              value={manualEntry.status}
              onChange={(e) => setManualEntry({ ...manualEntry, status: e.target.value as Quote["status"] })}
              className="input"
            >
              <option value="pending">Pending</option>
              <option value="negotiating">Negotiating</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full btn-primary">
              Add Quote
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
