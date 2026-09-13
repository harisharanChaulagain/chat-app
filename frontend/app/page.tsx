"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Shield, Zap, Video, ArrowRight, Sparkles } from "lucide-react";
import GuestGuard from "./components/GuestGuard";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <GuestGuard>
      <LandingPage />
    </GuestGuard>
  );
}

const FEATURES = [
  {
    icon: Shield,
    title: "Mutual chat system",
    desc: "Chat only starts when both users follow each other. No spam, no unwanted messages.",
    gradient: "linear-gradient(135deg, #635BFF 0%, #8B5CF6 100%)",
    delay: "100ms",
  },
  {
    icon: Zap,
    title: "Real-time messaging",
    desc: "Instant chat powered by Socket.io with zero delay. Messages appear the moment they're sent.",
    gradient: "linear-gradient(135deg, #5B8DEF 0%, #635BFF 100%)",
    delay: "250ms",
  },
  {
    icon: Video,
    title: "Video & voice calls",
    desc: "Built-in WebRTC video and audio calling for face-to-face conversations with crystal clarity.",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #C084FC 100%)",
    delay: "400ms",
  },
];

function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen-dvh overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      {/* Ambient decor — two soft brand washes. Kept smaller on phones so they
          stay atmospheric rather than washing out the whole screen. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(99,91,255,0.16)_0%,transparent_70%)] animate-float sm:h-[600px] sm:w-[600px]" />
        <div
          className="absolute -bottom-60 -left-40 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.14)_0%,transparent_70%)] sm:h-[500px] sm:w-[500px]"
          style={{ animation: "float 4s ease-in-out infinite 1s" }}
        />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 animate-fade-in sm:px-6 sm:py-5 md:px-8 md:py-6">
        <div
          className="group flex cursor-pointer items-center gap-2 sm:gap-3"
          onClick={() => router.push("/")}
        >
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-transform duration-300 group-hover:scale-105 sm:h-10 sm:w-10"
            style={{
              background: "var(--gradient-brand)",
              boxShadow: "var(--shadow-brand)",
            }}
          >
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight sm:text-xl">
            Chat<span className="gradient-text">Verse</span>
          </span>
        </div>

        <nav className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle variant="icon" className="hidden sm:flex" />

          {/* Hidden on the narrowest phones, where the logo plus two pills
              overflow 320px — the hero's "I already have an account" covers it. */}
          <button
            onClick={() => router.push("/login")}
            className="hidden rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[13px] font-medium text-[var(--muted)] transition-all duration-200 hover:border-[var(--border-strong)] hover:text-[var(--text)] min-[375px]:inline-flex sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/signup")}
            className="btn-primary whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Get started
          </button>
        </nav>
      </header>

      <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-20 sm:pt-16 md:pb-28 md:pt-20">
        <div
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
        >
          <div className="mb-6 inline-flex cursor-default items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs text-[var(--muted)] shadow-[var(--shadow-xs)] sm:mb-8 sm:px-4 sm:text-sm">
            <Sparkles className="h-4 w-4 flex-shrink-0 text-[var(--primary)]" />
            <span>Now with WebRTC video calls</span>
          </div>
        </div>

        {/* `text-5xl` overflowed a 320px viewport, so the base step is smaller
            and the display size only kicks in from `sm` up. */}
        <h1
          className="text-[2rem] font-extrabold leading-[1.15] tracking-tight opacity-0 animate-fade-in-up sm:text-5xl sm:leading-[1.1] md:text-6xl lg:text-7xl"
          style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
        >
          Talk. Match. Connect.
          <br />
          <span className="gradient-text animate-gradient bg-[length:200%_200%]">
            Instantly.
          </span>
        </h1>

        <p
          className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)] opacity-0 animate-fade-in-up sm:mt-6 sm:text-lg"
          style={{ animationDelay: "350ms", animationFillMode: "forwards" }}
        >
          A modern real-time chat &amp; video platform where conversations happen
          only when both users agree. No spam. No strangers. Just real connections.
        </p>

        <div
          className="mt-8 flex w-full flex-col gap-3 opacity-0 animate-fade-in-up sm:mt-10 sm:w-auto sm:flex-row sm:gap-4"
          style={{ animationDelay: "500ms", animationFillMode: "forwards" }}
        >
          <button
            onClick={() => router.push("/signup")}
            className="btn-primary group flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold sm:px-8 sm:py-3.5"
          >
            Start chatting
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <button
            onClick={() => router.push("/login")}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-base font-medium text-[var(--muted)] transition-all duration-200 hover:border-[var(--border-strong)] hover:text-[var(--text)] sm:px-8 sm:py-3.5"
          >
            I already have an account
          </button>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:grid-cols-2 sm:gap-6 sm:px-6 sm:pb-20 md:grid-cols-3 md:pb-28">
        {FEATURES.map((feature, i) => (
          <div
            key={i}
            className="card card-interactive group cursor-default p-5 opacity-0 animate-fade-in-up sm:p-7"
            style={{ animationDelay: feature.delay, animationFillMode: "forwards" }}
          >
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] transition-transform duration-300 group-hover:scale-110 sm:mb-5 sm:h-12 sm:w-12"
              style={{ background: feature.gradient }}
            >
              <feature.icon className="h-[22px] w-[22px] text-white" />
            </div>
            <h3 className="mb-2 text-base font-bold text-[var(--text)] sm:text-lg">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>

      <section className="relative z-10 py-14 animate-fade-in sm:py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] sm:p-10 md:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[var(--gradient-wash)]" />

            <h2 className="relative z-10 mb-3 text-2xl font-bold tracking-tight sm:mb-4 sm:text-3xl md:text-4xl">
              Ready to meet someone new?
            </h2>
            <p className="relative z-10 mb-6 text-base text-[var(--muted)] sm:mb-8 sm:text-lg">
              Join thousands of users connecting in real-time.
            </p>
            <button
              onClick={() => router.push("/signup")}
              className="btn-primary group relative z-10 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold sm:w-auto sm:px-8 sm:py-3.5"
            >
              Get started now
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[var(--border)] px-4 py-6 text-center sm:py-8">
        <p className="text-sm text-[var(--muted-2)]">
          © {new Date().getFullYear()} ChatVerse. Built with 💜
        </p>
      </footer>
    </div>
  );
}
