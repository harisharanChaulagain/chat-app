"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Shield, Zap, Video, ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden relative">

      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] animate-float" />
        <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,transparent_70%)]" style={{ animation: 'float 4s ease-in-out infinite 1s' }} />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-[var(--accent-start)] opacity-40" style={{ animation: 'float 3s ease-in-out infinite 0.5s' }} />
        <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 rounded-full bg-[var(--accent-end)] opacity-30" style={{ animation: 'float 3.5s ease-in-out infinite 1.5s' }} />
        <div className="absolute top-1/4 left-1/5 w-1 h-1 rounded-full bg-violet-400 opacity-25" style={{ animation: 'float 4s ease-in-out infinite 2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto animate-fade-in">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push("/")}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-shadow duration-300">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Chat<span className="gradient-text">Verse</span>
          </span>
        </div>

        <nav className="flex items-center gap-3">
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2.5 rounded-full border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg)] transition-all duration-300 text-sm font-medium"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/signup")}
            className="gradient-btn px-5 py-2.5 rounded-full text-sm font-semibold"
          >
            Get Started
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-28 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-[var(--text-secondary)] mb-8 cursor-default">
            <Sparkles className="w-4 h-4 text-[var(--accent-start)]" />
            <span>Now with WebRTC video calls</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight animate-fade-in-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          Talk. Match. Connect.
          <br />
          <span className="gradient-text animate-gradient bg-[length:200%_200%]">
            Instantly.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-[var(--text-secondary)] max-w-xl text-lg leading-relaxed animate-fade-in-up opacity-0" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
          A modern real-time chat & video platform where conversations happen
          only when both users agree. No spam. No strangers. Just real connections.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <button
            onClick={() => router.push("/signup")}
            className="gradient-btn px-8 py-3.5 rounded-full font-semibold text-base flex items-center justify-center gap-2 group"
          >
            Start Chatting
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <button
            onClick={() => router.push("/login")}
            className="px-8 py-3.5 rounded-full font-medium text-base border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg)] transition-all duration-300"
          >
            I Already Have Account
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 grid md:grid-cols-3 gap-6 px-6 pb-28 max-w-6xl mx-auto">
        {[
          {
            icon: Shield,
            title: "Mutual Chat System",
            desc: "Chat only starts when both users follow each other. No spam, no unwanted messages.",
            gradient: "from-violet-500 to-purple-600",
            delay: "100ms",
          },
          {
            icon: Zap,
            title: "Real-time Messaging",
            desc: "Instant chat powered by Socket.io with zero delay. Messages appear the moment they're sent.",
            gradient: "from-indigo-500 to-blue-600",
            delay: "250ms",
          },
          {
            icon: Video,
            title: "Video & Voice Calls",
            desc: "Built-in WebRTC video and audio calling for face-to-face conversations with crystal clarity.",
            gradient: "from-cyan-500 to-teal-600",
            delay: "400ms",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="glass-card p-7 rounded-2xl group cursor-default animate-fade-in-up opacity-0"
            style={{ animationDelay: feature.delay, animationFillMode: 'forwards' }}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-[var(--text-primary)]">
              {feature.title}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 py-24 animate-fade-in">
        <div className="max-w-3xl mx-auto text-center px-6">
          <div className="glass-card p-12 rounded-3xl relative overflow-hidden">
            {/* Gradient accent behind */}
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.08)] to-[rgba(6,182,212,0.05)] pointer-events-none" />

            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
              Ready to meet someone new?
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 text-lg relative z-10">
              Join thousands of users connecting in real-time.
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="gradient-btn px-8 py-3.5 rounded-full font-semibold text-base relative z-10 inline-flex items-center gap-2 group"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-[var(--glass-border)]">
        <p className="text-[var(--text-muted)] text-sm">
          © {new Date().getFullYear()} ChatVerse. Built with 💜
        </p>
      </footer>
    </div>
  );
}