"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Shield, Zap, Video, ArrowRight, Sparkles } from "lucide-react";
import GuestGuard from "./components/GuestGuard";

export default function Home() {
  return (
    <GuestGuard>
      <LandingPage />
    </GuestGuard>
  );
}

function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen-dvh bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden relative">

      {/* Ambient decor — kept smaller on phones so the glows stay atmospheric
          rather than washing out the whole screen. */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[340px] h-[340px] sm:w-[600px] sm:h-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] animate-float" />
        <div className="absolute -bottom-60 -left-40 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,transparent_70%)]" style={{ animation: 'float 4s ease-in-out infinite 1s' }} />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-[var(--accent-start)] opacity-40" style={{ animation: 'float 3s ease-in-out infinite 0.5s' }} />
        <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 rounded-full bg-[var(--accent-end)] opacity-30" style={{ animation: 'float 3.5s ease-in-out infinite 1.5s' }} />
        <div className="absolute top-1/4 left-1/5 w-1 h-1 rounded-full bg-violet-400 opacity-25" style={{ animation: 'float 4s ease-in-out infinite 2s' }} />
      </div>

      <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 max-w-7xl mx-auto animate-fade-in">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => router.push("/")}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-shadow duration-300">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight">
            Chat<span className="gradient-text">Verse</span>
          </span>
        </div>

        <nav className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {/* Hidden on the narrowest phones, where the logo plus two pills
              overflow 320px — the hero's "I Already Have Account" covers it. */}
          <button
            onClick={() => router.push("/login")}
            className="hidden min-[375px]:inline-flex px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg)] transition-all duration-300 text-[13px] sm:text-sm font-medium"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/signup")}
            className="gradient-btn px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-[13px] sm:text-sm font-semibold whitespace-nowrap"
          >
            Get Started
          </button>
        </nav>
      </header>

      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 md:pt-20 md:pb-28 max-w-4xl mx-auto">
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 rounded-full glass-card text-xs sm:text-sm text-[var(--text-secondary)] mb-6 sm:mb-8 cursor-default">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-[var(--accent-start)]" />
            <span>Now with WebRTC video calls</span>
          </div>
        </div>

        {/* `text-5xl` overflowed a 320px viewport, so the base step is smaller
            and the display size only kicks in from `sm` up. */}
        <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.15] sm:leading-[1.1] tracking-tight animate-fade-in-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          Talk. Match. Connect.
          <br />
          <span className="gradient-text animate-gradient bg-[length:200%_200%]">
            Instantly.
          </span>
        </h1>

        <p className="mt-5 sm:mt-6 text-[var(--text-secondary)] max-w-xl text-base sm:text-lg leading-relaxed animate-fade-in-up opacity-0" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
          A modern real-time chat & video platform where conversations happen
          only when both users agree. No spam. No strangers. Just real connections.
        </p>

        <div className="mt-8 sm:mt-10 flex w-full flex-col sm:w-auto sm:flex-row gap-3 sm:gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <button
            onClick={() => router.push("/signup")}
            className="gradient-btn px-6 py-3 sm:px-8 sm:py-3.5 rounded-full font-semibold text-base flex items-center justify-center gap-2 group"
          >
            Start Chatting
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 sm:px-8 sm:py-3.5 rounded-full font-medium text-base border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg)] transition-all duration-300"
          >
            I Already Have Account
          </button>
        </div>
      </section>

      <section className="relative z-10 grid gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 px-4 pb-16 sm:px-6 sm:pb-20 md:pb-28 max-w-6xl mx-auto">
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
            className="glass-card p-5 sm:p-7 rounded-2xl group cursor-default animate-fade-in-up opacity-0"
            style={{ animationDelay: feature.delay, animationFillMode: 'forwards' }}
          >
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-2 text-[var(--text-primary)]">
              {feature.title}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>

      <section className="relative z-10 py-14 sm:py-20 md:py-24 animate-fade-in">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
          <div className="glass-card p-6 sm:p-10 md:p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.08)] to-[rgba(6,182,212,0.05)] pointer-events-none" />

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 relative z-10">
              Ready to meet someone new?
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 sm:mb-8 text-base sm:text-lg relative z-10">
              Join thousands of users connecting in real-time.
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="gradient-btn w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3.5 rounded-full font-semibold text-base relative z-10 inline-flex items-center justify-center gap-2 group"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 text-center px-4 py-6 sm:py-8 border-t border-[var(--glass-border)]">
        <p className="text-[var(--text-muted)] text-sm">
          © {new Date().getFullYear()} ChatVerse. Built with 💜
        </p>
      </footer>
    </div>
  );
}