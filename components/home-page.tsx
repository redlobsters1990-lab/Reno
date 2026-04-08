"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { 
  Home, 
  MessageSquare, 
  Calculator, 
  FileText, 
  Upload, 
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Users,
  Clock,
  TrendingUp,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HomePage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In a real app, you would send this to your backend
      console.log("Waitlist submission:", email);
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: "AI Renovation Advisor",
      description: "Chat with an expert AI that understands renovation planning, materials, and design.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Calculator,
      title: "Smart Cost Estimation",
      description: "Get realistic budget ranges with confidence scoring based on your specific project.",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: FileText,
      title: "Quote Analysis",
      description: "Upload contractor quotes and get side-by-side comparisons with missing items highlighted.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Upload,
      title: "File Management",
      description: "Store floor plans, inspiration images, and documents all in one organized place.",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: Shield,
      title: "Memory System",
      description: "The AI remembers your preferences, decisions, and assumptions across conversations.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Users,
      title: "Future Contractor Matching",
      description: "Coming soon: Get matched with vetted contractors based on your project needs.",
      color: "from-indigo-500 to-blue-500",
    },
  ];

  const stats = [
    { value: "50+", label: "Project Types" },
    { value: "95%", label: "Estimate Accuracy" },
    { value: "24/7", label: "AI Availability" },
    { value: "1000+", label: "Materials Database" },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="container py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Renovation Advisor AI</span>
        </div>
        
        <div className="flex items-center gap-4">
          {status === "authenticated" ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 mb-6">
            <Sparkles className="h-4 w-4 text-violet-300" />
            <span className="text-sm text-violet-300">AI-Powered Renovation Planning</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Plan Your Dream Renovation
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
              With AI Guidance
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get personalized advice, accurate cost estimates, and organized planning 
            for your home renovation projects—all powered by artificial intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={status === "authenticated" ? "/dashboard" : "/auth/signup"}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-lg transition-all flex items-center justify-center gap-2 group"
            >
              Start Planning Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="#features"
              className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent text-center"
            >
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need for Renovation Success</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From initial planning to contractor selection, our AI-powered platform guides you every step of the way.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent hover:border-white/20 transition-all group"
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-slate-400 mb-6">{feature.description}</p>
              
              <div className={cn(
                "h-1 w-12 rounded-full bg-gradient-to-r transition-all duration-300",
                feature.color,
                hoveredFeature === index ? "w-24" : "w-12"
              )} />
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Simple three-step process from planning to execution
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <div className="text-2xl font-bold text-blue-300">1</div>
            </div>
            <h3 className="text-xl font-semibold mb-3">Create Your Project</h3>
            <p className="text-slate-400">
              Tell us about your property, rooms, budget, and style preferences.
            </p>
          </div>
          
          <div className="text-center p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
              <div className="text-2xl font-bold text-violet-300">2</div>
            </div>
            <h3 className="text-xl font-semibold mb-3">Get AI Guidance</h3>
            <p className="text-slate-400">
              Chat with our AI advisor for personalized recommendations and cost estimates.
            </p>
          </div>
          
          <div className="text-center p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <div className="text-2xl font-bold text-emerald-300">3</div>
            </div>
            <h3 className="text-xl font-semibold mb-3">Manage & Execute</h3>
            <p className="text-slate-400">
              Compare quotes, track decisions, and bring your renovation to life.
            </p>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="container py-20">
        <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl border-2 border-dashed border-white/10 bg-gradient-to-b from-white/2.5 to-transparent">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-6 animate-float">
            <Star className="h-10 w-10 text-violet-300" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Join the Future of Renovation Planning</h2>
          <p className="text-slate-300 mb-8">
            Be among the first to experience AI-powered renovation guidance. 
            Early access includes premium features at no cost.
          </p>
          
          <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition"
              >
                Join Waitlist
              </button>
            </div>
            
            {submitted && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">You're on the list! We'll be in touch soon.</span>
                </div>
              </div>
            )}
          </form>
          
          <div className="mt-8 text-sm text-slate-500">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Early access in weeks</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Free premium features</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600"></div>
            <span className="font-medium">Renovation Advisor AI</span>
          </div>
          
          <div className="text-sm text-slate-400">
            © {new Date().getFullYear()} Renovation Advisor AI. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="#" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition">
              Terms
            </Link>
            <Link href="#" className="hover:text-white transition">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}