"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  ArrowLeft, 
  MessageSquare, 
  FileText, 
  Upload,
  Calculator,
  Folder,
  Calendar,
  Edit,
  Trash2
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  propertyType: string;
  roomCount: number | null;
  budget: number | null;
  stylePreference: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  uploadedFiles: Array<{
    id: string;
    fileType: string;
    originalName: string;
    createdAt: string;
  }>;
  contractorQuotes: Array<{
    id: string;
    contractorName: string;
    totalAmount: number | null;
    status: string;
    createdAt: string;
  }>;
  estimates: Array<{
    id: string;
    realisticMin: number;
    realisticMax: number;
    confidence: string;
    createdAt: string;
  }>;
  projectMemories: Array<{
    id: string;
    memoryType: string;
    note: string;
    createdAt: string;
  }>;
  _count: {
    chatMessages: number;
  };
}

export default function ProjectDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [chatMessage, setChatMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProject();
    }
  }, [status, projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (response.ok) {
        setProject(data.project);
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim() || sendingChat) return;
    
    setSendingChat(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          message: chatMessage,
        }),
      });
      
      if (response.ok) {
        setChatMessage("");
        fetchProject(); // Refresh to get new messages
      }
    } catch (error) {
      console.error("Failed to send chat:", error);
    } finally {
      setSendingChat(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!session || !project) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
            >
              <Home className="h-5 w-5 text-white" />
            </Link>
            <span className="text-xl font-bold">Renovation Advisor AI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="container py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 text-sm">
                  {project.propertyType}
                </div>
                {project.roomCount && (
                  <div className="text-slate-400 text-sm">
                    {project.roomCount} room{project.roomCount !== 1 ? 's' : ''}
                  </div>
                )}
                {project.budget && (
                  <div className="text-slate-400 text-sm">
                    Budget hint: {formatCurrency(project.budget)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button className="px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Archive
              </button>
            </div>
          </div>
          
          <div className="text-sm text-slate-400">
            Created {formatDate(project.createdAt)} • Last updated {formatDate(project.updatedAt)}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 mb-8">
          <div className="flex gap-6">
            {["overview", "chat", "files", "estimates", "quotes", "memories"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-1 capitalize font-medium transition ${
                  activeTab === tab
                    ? "text-violet-400 border-b-2 border-violet-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Overview & Chat */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Project Summary */}
                <div className="card p-6">
                  <h2 className="text-xl font-semibold mb-4">Project Summary</h2>
                  <div className="space-y-4">
                    {project.stylePreference && (
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Style Preference</div>
                        <div className="font-medium">{project.stylePreference}</div>
                      </div>
                    )}
                    {project.notes && (
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Notes</div>
                        <div className="text-slate-300 whitespace-pre-wrap">{project.notes}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="card p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-violet-300" />
                      <div className="text-2xl font-bold">{project._count.chatMessages}</div>
                    </div>
                    <div className="text-sm text-slate-400">Chat Messages</div>
                  </div>
                  <div className="card p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Upload className="h-5 w-5 text-violet-300" />
                      <div className="text-2xl font-bold">{project.uploadedFiles.length}</div>
                    </div>
                    <div className="text-sm text-slate-400">Files</div>
                  </div>
                  <div className="card p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-violet-300" />
                      <div className="text-2xl font-bold">{project.contractorQuotes.length}</div>
                    </div>
                    <div className="text-sm text-slate-400">Quotes</div>
                  </div>
                  <div className="card p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calculator className="h-5 w-5 text-violet-300" />
                      <div className="text-2xl font-bold">{project.estimates.length}</div>
                    </div>
                    <div className="text-sm text-slate-400">Estimates</div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Chat with AI Advisor</h2>
                
                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto mb-4 p-4 rounded-lg bg-slate-900/50">
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-xl rounded-tl-none bg-slate-800 p-4">
                        <div className="text-sm text-slate-400 mb-1">AI Advisor</div>
                        <div>Hello! I'm your renovation advisor. I can help you plan your project, estimate costs, and answer questions about the renovation process. What would you like to discuss today?</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                    placeholder="Type your message..."
                    className="input flex-1"
                    disabled={sendingChat}
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={sendingChat || !chatMessage.trim()}
                    className="btn-primary px-6"
                  >
                    {sendingChat ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            )}

            {/* Other tabs would go here */}
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Get Cost Estimate
                </button>
                <button className="w-full btn-secondary py-3 flex items-center justify-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload File
                </button>
                <button className="w-full btn-secondary py-3 flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  Add Quote
                </button>
              </div>
            </div>

            {/* Latest Estimate */}
            {project.estimates.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Latest Estimate</h3>
                <div className="space-y-3">
                  <div className="text-2xl font-bold">
                    {formatCurrency(project.estimates[0].realisticMin)} - {formatCurrency(project.estimates[0].realisticMax)}
                  </div>
                  <div className="text-sm text-slate-400">
                    Confidence: <span className="capitalize">{project.estimates[0].confidence}</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    Created {formatDate(project.estimates[0].createdAt)}
                  </div>
                  <button className="w-full btn-secondary py-2 text-sm">
                    View All Estimates
                  </button>
                </div>
              </div>
            )}

            {/* Recent Memories */}
            {project.projectMemories.length > 0 && (
              <div className="card p-6">
                <h3 className="font-semibold mb-4">Recent Memories</h3>
                <div className="space-y-3">
                  {project.projectMemories.slice(0, 3).map((memory) => (
                    <div key={memory.id} className="p-3 rounded-lg bg-slate-800/50">
                      <div className="text-xs text-slate-400 mb-1 capitalize">
                        {memory.memoryType.replace(/_/g, ' ')}
                      </div>
                      <div className="text-sm line-clamp-2">{memory.note}</div>
                    </div>
                  ))}
                  <button className="w-full btn-secondary py-2 text-sm">
                    View All Memories
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
