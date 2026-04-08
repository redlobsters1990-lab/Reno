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
      <section className="container py-24 md:py-32 text-center relative">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 mb-8 animate-pulse-slow">
            <Sparkles className="h-4 w-4 text-violet-300 animate-spin-slow" />
            <span className="text-sm text-violet-300 font-medium">AI-Powered Renovation Planning</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            Plan Your Dream Renovation
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 animate-gradient mt-4">
              With AI Guidance
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
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
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent text-center hover:border-white/30 hover:shadow-glow transition-all duration-500 group"
            >
              <div className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-violet-300 group-hover:to-purple-300 transition-all duration-500">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400 font-medium tracking-wide uppercase group-hover:text-slate-300 transition-colors">
                {stat.label}
              </div>
              <div className="mt-4 h-0.5 w-12 mx-auto bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:via-violet-400 transition-all duration-500" />
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
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent hover:border-white/30 hover:shadow-glow transition-all duration-500 group hover:-translate-y-2"
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors">{feature.title}</h3>
              <p className="text-slate-400 mb-8 leading-relaxed group-hover:text-slate-300 transition-colors">{feature.description}</p>
              
              <div className={cn(
                "h-1.5 w-16 rounded-full bg-gradient-to-r transition-all duration-500",
                feature.color,
                hoveredFeature === index ? "w-32 opacity-100" : "w-16 opacity-80"
              )} />
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-24">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold mb-6 tracking-tight">How It Works</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            A simple three-step process that transforms your renovation vision into reality
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />
          
          <div className="text-center p-10 rounded-3xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent hover:border-blue-400/30 hover:shadow-glow transition-all duration-500 group relative">
            <div className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
              <div className="text-3xl font-bold text-blue-300">1</div>
            </div>
            <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-300 transition-colors">Create Your Project</h3>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              Tell us about your property, rooms, budget, and style preferences in our intuitive project setup.
            </p>
          </div>
          
          <div className="text-center p-10 rounded-3xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent hover:border-violet-400/30 hover:shadow-glow transition-all duration-500 group relative">
            <div className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-400/30 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
              <div className="text-3xl font-bold text-violet-300">2</div>
            </div>
            <h3 className="text-2xl font-bold mb-4 group-hover:text-violet-300 transition-colors">Get AI Guidance</h3>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              Chat with our AI advisor for personalized recommendations, accurate cost estimates, and design insights.
            </p>
          </div>
          
          <div className="text-center p-10 rounded-3xl border border-white/10 bg-gradient-to-b from-white/2.5 to-transparent hover:border-emerald-400/30 hover:shadow-glow transition-all duration-500 group relative">
            <div className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-400/30 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
              <div className="text-3xl font-bold text-emerald-300">3</div>
            </div>
            <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-300 transition-colors">Manage & Execute</h3>
            <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              Compare contractor quotes, track decisions in our memory system, and bring your renovation to life.
            </p>
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="container py-28">
        <div className="max-w-4xl mx-auto text-center p-16 rounded-4xl border-2 border-dashed border-white/20 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-violet-400/30 flex items-center justify-center mx-auto mb-8 animate-float">
            <Star className="h-12 w-12 text-violet-300" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Join the Future of Renovation Planning</h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Be among the first to experience AI-powered renovation guidance. 
            Early access includes premium features at no cost for our founding members.
          </p>
          
          <form onSubmit={handleWaitlistSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-2xl border border-white/20 bg-white/10 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 text-lg backdrop-blur-sm"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-lg transition-all duration-500 hover:shadow-glow hover:-translate-y-1"
              >
                Join Waitlist
              </button>
            </div>
            
            {submitted && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm animate-fade-in">
                <div className="flex items-center gap-3 justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">You're on the list! We'll be in touch soon.</span>
                </div>
              </div>
            )}
          </form>
          
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center justify-center gap-3 text-slate-400 hover:text-slate-300 transition-colors">
                <Shield className="h-5 w-5 text-violet-400" />
                <span className="font-medium">No spam, ever</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-slate-400 hover:text-slate-300 transition-colors">
                <Clock className="h-5 w-5 text-violet-400" />
                <span className="font-medium">Early access in weeks</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-slate-400 hover:text-slate-300 transition-colors">
                <TrendingUp className="h-5 w-5 text-violet-400" />
                <span className="font-medium">Free premium features</span>
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