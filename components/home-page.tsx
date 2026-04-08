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

      {/* Navigation - Enhanced visibility */}
      <nav className="container py-4 md:py-6 flex items-center justify-between gap-4 bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-white/10">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-h3 font-bold whitespace-nowrap text-white">Renovation Advisor AI</span>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          {status === "authenticated" ? (
            <>
              <Link
                href="/dashboard"
                className="btn-secondary whitespace-nowrap px-5 py-2.5 font-medium shadow-md hover:shadow-lg transition-shadow"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/", redirect: true })}
                className="btn-ghost whitespace-nowrap px-5 py-2.5 font-medium hover:bg-white/10 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="btn-secondary whitespace-nowrap px-5 py-2.5 font-medium shadow-md hover:shadow-lg transition-shadow"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary whitespace-nowrap px-6 py-2.5 font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section - Enhanced */}
      <section id="main-content" className="section relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge - Enhanced */}
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-primary-500/15 to-secondary-500/15 border border-primary-500/30 mb-10 animate-pulse-slow shadow-lg">
              <Sparkles className="h-5 w-5 text-primary-300 animate-spin-slow" />
              <span className="text-body font-semibold text-primary-200">✨ AI-Powered Renovation Intelligence</span>
            </div>
            
            {/* Heading - More compelling */}
            <h1 className="text-display font-bold mb-8 leading-tight tracking-tight">
              <span className="block">Transform Your Home with</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-primary-400 to-secondary-400 animate-gradient mt-4 md:mt-6 text-6xl md:text-7xl lg:text-8xl">
                AI-Powered Precision
              </span>
            </h1>
            
            {/* Description - More benefit-focused */}
            <p className="text-h2 text-text-primary mb-10 max-w-3xl mx-auto font-normal leading-relaxed md:leading-loose">
              Stop guessing, start building. Get <span className="font-semibold text-primary-300">accurate cost estimates</span>, 
              <span className="font-semibold text-secondary-300"> personalized guidance</span>, and 
              <span className="font-semibold text-success-300"> stress-free planning</span> for your renovation.
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-12 opacity-90">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Shield className="h-4 w-4 text-success-400" />
                <span className="text-small font-medium">Secure & Private</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <CheckCircle className="h-4 w-4 text-success-400" />
                <span className="text-small font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Clock className="h-4 w-4 text-info-400" />
                <span className="text-small font-medium">Setup in 2 Minutes</span>
              </div>
            </div>
            
            {/* CTA Buttons - Enhanced */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href={status === "authenticated" ? "/dashboard" : "/auth/signup"}
                className="btn-primary group relative overflow-hidden px-10 py-5 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 flex items-center">
                  Start Your Free Project
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              </Link>
              
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="#features"
                  className="btn-secondary px-8 py-4 text-lg font-medium border-2 border-white/20 hover:border-white/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    See How It Works
                  </span>
                </Link>
                <span className="text-caption text-text-tertiary">
                  No commitment • 100% free to start
                </span>
              </div>
            </div>
            
            {/* Stats preview */}
            <div className="mt-16 pt-8 border-t border-white/10">
              <div className="flex flex-wrap justify-center items-center gap-8 text-text-secondary">
                <div className="text-center">
                  <div className="text-h1 font-bold text-white">1,000+</div>
                  <div className="text-small">Projects Planned</div>
                </div>
                <div className="hidden md:block h-12 w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-h1 font-bold text-white">$2.5M+</div>
                  <div className="text-small">Costs Estimated</div>
                </div>
                <div className="hidden md:block h-12 w-px bg-white/20" />
                <div className="text-center">
                  <div className="text-h1 font-bold text-white">94%</div>
                  <div className="text-small">User Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="section bg-gradient-to-b from-transparent to-white/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-h1 font-bold mb-8">
              Renovation Shouldn't Be
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-warning-400 to-error-400 mt-4">
                This Stressful
              </span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="card-hover p-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-error-500/10 border border-error-500/20 flex items-center justify-center mx-auto mb-6">
                  <div className="text-h2 font-bold text-error-400">?</div>
                </div>
                <h3 className="text-h3 font-semibold mb-4">Budget Surprises</h3>
                <p className="text-body text-text-secondary leading-relaxed">
                  Hidden costs and inaccurate estimates derail 68% of renovation projects.
                </p>
              </div>
              
              <div className="card-hover p-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-warning-500/10 border border-warning-500/20 flex items-center justify-center mx-auto mb-6">
                  <div className="text-h2 font-bold text-warning-400">⏰</div>
                </div>
                <h3 className="text-h3 font-semibold mb-4">Time Overruns</h3>
                <p className="text-body text-text-secondary leading-relaxed">
                  Projects take 40% longer than planned due to poor coordination.
                </p>
              </div>
              
              <div className="card-hover p-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-info-500/10 border border-info-500/20 flex items-center justify-center mx-auto mb-6">
                  <div className="text-h2 font-bold text-info-400">💼</div>
                </div>
                <h3 className="text-h3 font-semibold mb-4">Decision Fatigue</h3>
                <p className="text-body text-text-secondary leading-relaxed">
                  Too many choices without expert guidance leads to costly mistakes.
                </p>
              </div>
            </div>
            
            <div className="p-8 rounded-2xl bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-500/20">
              <h3 className="text-h2 font-bold mb-4 text-white">There's a Better Way</h3>
              <p className="text-h3 text-text-primary leading-relaxed">
                Our AI advisor eliminates guesswork with data-driven insights, 
                keeping your project on budget and on schedule.
              </p>
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
                  <div className="text-h1 font-bold mb-3 bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent leading-none">
                    {stat.value}
                  </div>
                  <div className="text-caption text-text-tertiary leading-tight">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features - Enhanced */}
      <section id="features" className="section bg-gradient-to-b from-white/5 to-transparent">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary-300" />
              <span className="text-caption font-semibold text-primary-300">AI-POWERED PLATFORM</span>
            </div>
            <h2 className="text-h1 font-bold mb-6">
              Your Complete Renovation
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mt-4">
                Command Center
              </span>
            </h2>
            <p className="text-h2 text-text-primary max-w-3xl mx-auto font-light leading-relaxed">
              Everything you need to plan, budget, and execute your renovation—
              all in one intelligent platform.
            </p>
          </div>
          
          <div className="grid-cols-auto-fit gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card-hover p-8 h-full flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/10 hover:border-primary-500/30"
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-8 transition-all duration-500 ${hoveredFeature === index ? 'scale-110 rotate-3' : ''} shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-h2 font-bold mb-6 leading-tight text-white">{feature.title}</h3>
                  <p className="text-body text-text-secondary mb-8 flex-grow leading-relaxed">{feature.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className={`h-2 w-24 rounded-full bg-gradient-to-r ${feature.color} transition-all duration-500 ${hoveredFeature === index ? 'w-32' : 'w-24'}`} />
                    <span className="text-caption font-medium text-text-tertiary">
                      {hoveredFeature === index ? 'Learn more →' : 'Feature'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Inline CTA */}
        <div className="text-center mt-16 pt-12 border-t border-white/10">
          <h3 className="text-h2 font-bold mb-6">Ready to Transform Your Renovation Experience?</h3>
          <p className="text-h3 text-text-primary mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of homeowners who've saved time, money, and stress with our AI platform.
          </p>
          <Link
            href={status === "authenticated" ? "/dashboard" : "/auth/signup"}
            className="btn-primary inline-flex items-center px-10 py-5 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <span className="flex items-center gap-3">
              <Sparkles className="h-6 w-6" />
              Start Free Project
              <ArrowRight className="h-6 w-6 ml-2 group-hover:translate-x-2 transition-transform" />
            </span>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-gradient-to-b from-transparent to-white/5">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-h1 font-bold mb-6">
              Trusted by Homeowners
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-success-400 to-info-400 mt-4">
                Across the Country
              </span>
            </h2>
            <p className="text-h3 text-text-primary max-w-3xl mx-auto leading-relaxed">
              See how our AI platform has transformed renovation projects for real families.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                location: "San Francisco, CA",
                project: "Kitchen Remodel",
                quote: "The AI cost estimator was within 3% of our final budget. Saved us from major surprises!",
                savings: "$12,500"
              },
              {
                name: "James & Lisa R.",
                location: "Austin, TX",
                project: "Bathroom Addition",
                quote: "Contractor matching found us the perfect team. Project finished 2 weeks early!",
                savings: "3 weeks time"
              },
              {
                name: "Michael T.",
                location: "Chicago, IL",
                project: "Whole House Renovation",
                quote: "The timeline predictions kept us on track. First renovation that actually stayed on schedule.",
                savings: "45% less stress"
              }
            ].map((testimonial, index) => (
              <div key={index} className="card-hover p-8 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                    <Users className="h-7 w-7 text-primary-300" />
                  </div>
                  <div>
                    <div className="text-h3 font-bold text-white">{testimonial.name}</div>
                    <div className="text-small text-text-tertiary">{testimonial.location}</div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
                    <Home className="h-3 w-3" />
                    <span className="text-caption font-medium">{testimonial.project}</span>
                  </div>
                  <p className="text-body text-text-primary leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                </div>
                
                <div className="mt-auto pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-small text-text-tertiary">Estimated Savings</span>
                    <span className="text-h3 font-bold text-success-400">{testimonial.savings}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-h1 font-bold mb-6">
              Simple, Powerful,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mt-4">
                Stress-Free Process
              </span>
            </h2>
            <p className="text-h2 text-text-primary max-w-3xl mx-auto font-light leading-relaxed">
              From idea to completion in three simple steps—guided by AI every step of the way.
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
                
                <h3 className="text-h2 font-semibold mb-6 leading-tight">{step.title}</h3>
                <p className="text-body text-text-secondary leading-relaxed md:leading-loose flex-grow">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Enhanced */}
      <section className="section relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10" />
        
        {/* Animated elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary-500/5 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary-500/5 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto text-center p-12 md:p-16 rounded-3xl border-2 border-white/30 bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-sm shadow-2xl">
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
            <h2 className="text-display font-bold mb-10">
              <span className="block">Ready to Revolutionize</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-primary-400 to-secondary-400 animate-gradient mt-4">
                Your Renovation Journey?
              </span>
            </h2>
            
            <p className="text-h2 text-white mb-12 max-w-3xl mx-auto font-normal leading-relaxed">
              Join <span className="font-bold text-primary-300">1,000+ homeowners</span> who've transformed 
              their renovation experience with AI-powered precision planning.
            </p>
            
            {/* Benefits grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="h-12 w-12 rounded-xl bg-success-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-success-400" />
                </div>
                <div>
                  <div className="text-h3 font-bold text-white mb-1">Free to Start</div>
                  <div className="text-small text-text-secondary">No credit card required</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="h-12 w-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-primary-400" />
                </div>
                <div>
                  <div className="text-h3 font-bold text-white mb-1">AI-Powered</div>
                  <div className="text-small text-text-secondary">Smart recommendations</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="h-12 w-12 rounded-xl bg-secondary-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-secondary-400" />
                </div>
                <div>
                  <div className="text-h3 font-bold text-white mb-1">Risk-Free</div>
                  <div className="text-small text-text-secondary">Cancel anytime</div>
                </div>
              </div>
            </div>
            
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

      {/* Footer - Enhanced */}
      <footer className="py-16 border-t border-white/10 bg-gradient-to-b from-transparent to-black/50">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-h2 font-bold text-white">Renovation Advisor AI</div>
                  <div className="text-small text-primary-300">AI-powered renovation intelligence</div>
                </div>
              </div>
              <p className="text-body text-text-secondary leading-relaxed">
                Transforming home renovations with artificial intelligence, making every project predictable and stress-free.
              </p>
            </div>
            
            <div>
              <h3 className="text-h3 font-bold text-white mb-6">Product</h3>
              <ul className="space-y-4">
                <li><Link href="/features" className="text-body text-text-secondary hover:text-primary-300 transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-body text-text-secondary hover:text-primary-300 transition-colors">Pricing</Link></li>
                <li><Link href="/use-cases" className="text-body text-text-secondary hover:text-primary-300 transition-colors">Use Cases</Link></li>
                <li><Link href="/api" className="text-body text-text-secondary hover:text-primary-300 transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-h3 font-bold text-white mb-6">Company</h3>
              <ul className="space-y-4">
                <li><Link href="/about" className="text-body text-text-secondary hover:text-primary-300 transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="text-body text-text-secondary hover:text-primary-300 transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="text-body text-text-secondary hover:text-primary-300 transition-colors">Blog</Link></li>
                <li><Link href="/press" className="text-body text-text-secondary hover:text-primary-300 transition-colors">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-h3 font-bold text-white mb-6">Support</h3>
              <ul className="space-y-4">
                <li><Link href="/help" className="text-body text-text-secondary hover:text-primary-300 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-body text-text-secondary hover:text-primary-300 transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="text-body text-text-secondary hover:text-primary-300 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-body text-text-secondary hover:text-primary-300 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="text-body text-text-tertiary">
                © {new Date().getFullYear()} Renovation Advisor AI. All rights reserved.
              </div>
              <div className="text-small text-text-tertiary mt-2">
                Making home renovations predictable, affordable, and stress-free.
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-small text-text-tertiary">
                Follow us:
              </div>
              <div className="flex items-center gap-4">
                <Link href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-500/20 transition-colors">
                  <span className="text-body">𝕏</span>
                </Link>
                <Link href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-500/20 transition-colors">
                  <span className="text-body">f</span>
                </Link>
                <Link href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-500/20 transition-colors">
                  <span className="text-body">in</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}