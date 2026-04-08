"use client";

import { useState, useEffect } from "react";
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
  Star,
  Building,
  Palette,
  Ruler
} from "lucide-react";

export function HomePage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide loading state after session check
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

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
      color: "from-info-500 to-blue-500",
      iconColor: "text-info-300",
    },
    {
      icon: Calculator,
      title: "Smart Cost Estimation",
      description: "Get realistic budget ranges with confidence scoring based on your specific project.",
      color: "from-success-500 to-emerald-500",
      iconColor: "text-success-300",
    },
    {
      icon: FileText,
      title: "Quote Analysis",
      description: "Upload contractor quotes and get side-by-side comparisons with missing items highlighted.",
      color: "from-warning-500 to-amber-500",
      iconColor: "text-warning-300",
    },
    {
      icon: Upload,
      title: "File Management",
      description: "Store floor plans, inspiration images, and documents all in one organized place.",
      color: "from-primary-500 to-secondary-500",
      iconColor: "text-primary-300",
    },
    {
      icon: Shield,
      title: "Memory System",
      description: "The AI remembers your preferences, decisions, and assumptions across conversations.",
      color: "from-pink-500 to-rose-500",
      iconColor: "text-pink-300",
    },
    {
      icon: Users,
      title: "Contractor Matching",
      description: "Get matched with vetted contractors based on your project needs and budget.",
      color: "from-indigo-500 to-blue-600",
      iconColor: "text-indigo-300",
    },
  ];

  const stats = [
    { value: "50+", label: "Project Types", icon: Building },
    { value: "95%", label: "Estimate Accuracy", icon: Calculator },
    { value: "24/7", label: "AI Availability", icon: Clock },
    { value: "1000+", label: "Materials Database", icon: Palette },
  ];

  const steps = [
    {
      number: 1,
      title: "Create Your Project",
      description: "Tell us about your property, rooms, budget, and style preferences in our intuitive project setup.",
      color: "from-info-500 to-blue-500",
    },
    {
      number: 2,
      title: "Get AI Guidance",
      description: "Chat with our AI advisor for personalized recommendations, accurate cost estimates, and design insights.",
      color: "from-primary-500 to-secondary-500",
    },
    {
      number: 3,
      title: "Manage & Execute",
      description: "Compare contractor quotes, track decisions in our memory system, and bring your renovation to life.",
      color: "from-success-500 to-emerald-500",
    },
  ];

  // Show minimal loading state for auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-slate-950">
        <nav className="container py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-h3 font-bold">Renovation Advisor AI</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-20 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-primary-500/20 rounded-lg animate-pulse" />
          </div>
        </nav>
        
        <div className="container py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-8 w-48 bg-white/10 rounded-full mx-auto mb-8 animate-pulse" />
            <div className="h-16 w-full max-w-2xl bg-white/10 rounded-lg mx-auto mb-6 animate-pulse" />
            <div className="h-12 w-3/4 max-w-xl bg-white/10 rounded-lg mx-auto mb-12 animate-pulse" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="h-12 w-48 bg-primary-500/20 rounded-xl animate-pulse" />
              <div className="h-12 w-40 bg-white/10 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Skip to content for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Navigation */}
      <nav className="container py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center flex-shrink-0">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-h3 font-bold whitespace-nowrap">Renovation Advisor AI</span>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          {status === "authenticated" ? (
            <>
              <Link
                href="/dashboard"
                className="btn-secondary whitespace-nowrap"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                className="btn-ghost whitespace-nowrap"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="btn-secondary whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary whitespace-nowrap"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="main-content" className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8 animate-pulse-slow">
              <Sparkles className="h-4 w-4 text-primary-300 animate-spin-slow" />
              <span className="text-caption font-medium text-primary-300">AI-Powered Renovation Planning</span>
            </div>
            
            {/* Heading */}
            <h1 className="text-display font-bold mb-6">
              Plan Your Dream Renovation
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 animate-gradient mt-4">
                With AI Guidance
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-h3 text-text-secondary mb-12 max-w-3xl mx-auto font-light">
              Get personalized advice, accurate cost estimates, and organized planning 
              for your home renovation projects—all powered by artificial intelligence.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={status === "authenticated" ? "/dashboard" : "/auth/signup"}
                className="btn-primary px-8 py-4 text-lg"
              >
                Start Planning Free
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="#features"
                className="btn-secondary px-8 py-4 text-lg"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index}
                  className="card-hover p-6 text-center h-full"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary-300" />
                  </div>
                  <div className="text-h1 font-bold mb-2 bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-caption text-text-tertiary">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-h1 font-bold mb-4">Everything You Need for Renovation Success</h2>
            <p className="text-h3 text-text-secondary max-w-3xl mx-auto">
              From initial planning to contractor selection, our AI-powered platform guides you every step of the way.
            </p>
          </div>
          
          <div className="grid-cols-auto-fit gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card-hover p-6 h-full flex flex-col"
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 transition-transform duration-300 ${hoveredFeature === index ? 'scale-110' : ''}`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <h3 className="text-h3 font-semibold mb-4">{feature.title}</h3>
                  <p className="text-body text-text-secondary mb-6 flex-grow">{feature.description}</p>
                  
                  <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${feature.color} transition-all duration-300 ${hoveredFeature === index ? 'w-24' : 'w-16'}`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-h1 font-bold mb-4">How It Works</h2>
            <p className="text-h3 text-text-secondary max-w-3xl mx-auto font-light">
              A simple three-step process that transforms your renovation vision into reality
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/4 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />
            
            {steps.map((step) => (
              <div key={step.number} className="card-hover p-6 text-center relative h-full flex flex-col">
                {/* Number badge */}
                <div className={`absolute -top-4 -right-4 h-10 w-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-sm font-bold`}>
                  {step.number}
                </div>
                
                {/* Icon circle */}
                <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${step.color.replace('from-', 'from-').replace('to-', 'to-')}/20 border ${step.color.includes('primary') ? 'border-primary-400/30' : step.color.includes('info') ? 'border-info-400/30' : 'border-success-400/30'} flex items-center justify-center mx-auto mb-8 transition-transform duration-500 hover:scale-110`}>
                  <div className="text-h1 font-bold">
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-h2 font-semibold mb-4">{step.title}</h3>
                <p className="text-body text-text-secondary leading-relaxed flex-grow">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center p-8 rounded-3xl border-2 border-dashed border-white/20 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl animate-pulse-slow" />
              <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-secondary-500/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
            </div>
            
            {/* Icon */}
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-2 border-primary-400/30 flex items-center justify-center mx-auto mb-8 animate-float">
              <Star className="h-12 w-12 text-primary-300" />
            </div>
            
            {/* Heading */}
            <h2 className="text-h1 font-bold mb-6">Join the Future of Renovation Planning</h2>
            <p className="text-h3 text-text-primary mb-12 max-w-2xl mx-auto font-light">
              Be among the first to experience AI-powered renovation guidance. 
              Early access includes premium features at no cost for our founding members.
            </p>
            
            {/* Form */}
            <form onSubmit={handleWaitlistSubmit} className="max-w-xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="input flex-1 text-lg"
                  required
                />
                <button
                  type="submit"
                  className="btn-primary px-8 py-4 text-lg"
                >
                  Join Waitlist
                </button>
              </div>
              
              {/* Success message */}
              {submitted && (
                <div className="alert-success mt-6 animate-fade-in">
                  <div className="flex items-center gap-3 justify-center">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">You're on the list! We'll be in touch soon.</span>
                  </div>
                </div>
              )}
            </form>
            
            {/* Features */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center justify-center gap-3 text-text-secondary hover:text-text-primary transition-colors">
                  <Shield className="h-5 w-5 text-primary-400" />
                  <span className="font-medium">No spam, ever</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-text-secondary hover:text-text-primary transition-colors">
                  <Clock className="h-5 w-5 text-primary-400" />
                  <span className="font-medium">Early access in weeks</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-text-secondary hover:text-text-primary transition-colors">
                  <TrendingUp className="h-5 w-5 text-primary-400" />
                  <span className="font-medium">Free premium features</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-sm border-t border-white/10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600"></div>
              <span className="text-h3 font-bold">Renovation Advisor AI</span>
            </div>
            
            <div className="text-small text-text-tertiary">
              © {new Date().getFullYear()} Renovation Advisor AI. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6 text-small text-text-tertiary">
              <Link href="#" className="hover:text-text-primary transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-text-primary transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}