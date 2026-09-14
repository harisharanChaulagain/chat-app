"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Heart, MessagesSquare, Video } from "lucide-react";
import GuestGuard from "./components/GuestGuard";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ConnectionArt from "@/components/ui/ConnectionArt";

export default function Home() {
  return (
    <GuestGuard>
      <LandingPage />
    </GuestGuard>
  );
}

/** `tone` picks which of the two palette hues tints the icon tile. */
const FEATURES = [
  {
    icon: Heart,
    tone: "brand" as const,
    title: "Both of you have to say yes",
    desc: "A chat only opens once you follow each other. No cold openers, no unwanted messages.",
    delay: "80ms",
  },
  {
    icon: MessagesSquare,
    tone: "accent" as const,
    title: "Messages that land instantly",
    desc: "Real-time chat with typing indicators and read state, so a conversation feels like a conversation.",
    delay: "160ms",
  },
  {
    icon: Video,
    tone: "brand" as const,
    title: "Voice and video, built in",
    desc: "When texting isn't enough, call them from the same window. No extra app, no links to share.",
    delay: "240ms",
  },
];

function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen-dvh bg-[var(--surface)] text-[var(--text)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5"
            aria-label="ChatVerse home"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-fill)]">
              <MessageCircle className="h-[18px] w-[18px] text-white" />
            </span>
            <span className="text-lg font-semibold tracking-tight">ChatVerse</span>
          </button>

          <nav className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle variant="icon" />
            {/* Hidden on the narrowest phones, where the logo plus two buttons
                overflow 320px — the hero's "Log in" covers it. */}
            <button
              onClick={() => router.push("/login")}
              className="btn-secondary hidden px-4 py-2 text-sm min-[375px]:inline-flex"
            >
              Log in
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="btn-primary whitespace-nowrap px-4 py-2 text-sm"
            >
              Sign up
            </button>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
          {/* Copy comes second in the source on mobile so the illustration
              leads, and first from `md` up where it sits on the left. */}
          <div
            className="order-2 text-center opacity-0 animate-fade-in-up md:order-1 md:text-left"
            style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
          >
            {/* `text-5xl` overflowed a 320px viewport, so the base step is
                smaller and the display size only kicks in from `sm` up. */}
            <h1 className="text-[2rem] font-bold leading-[1.15] tracking-tight sm:text-[2.75rem] lg:text-5xl">
              Meet someone worth
              <br className="hidden sm:block" /> talking to.
            </h1>

            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-[17px] md:mx-0">
              ChatVerse is a place to actually get to know people. Follow each
              other, and the conversation opens up — messages, voice and video,
              all in one window.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <button
                onClick={() => router.push("/signup")}
                className="btn-primary px-7 py-3.5 text-base"
              >
                Create account
              </button>
              <button
                onClick={() => router.push("/login")}
                className="btn-secondary px-7 py-3.5 text-base"
              >
                Log in
              </button>
            </div>

            <p className="mt-5 text-sm text-[var(--muted-2)]">
              Free to join · No ads · You decide who reaches you
            </p>
          </div>

          {/* Illustration panel — a solid blush block, no gradient. */}
          <div
            className="order-1 opacity-0 animate-fade-in-up md:order-2"
            style={{ animationDelay: "160ms", animationFillMode: "forwards" }}
          >
            <div className="flex items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--brand-panel)] px-6 py-8 sm:px-10 sm:py-12">
              <ConnectionArt className="w-full max-w-[280px] sm:max-w-[380px] lg:max-w-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-[var(--bg)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Built for real connections
            </h2>
            <p className="mt-3 text-base text-[var(--muted)]">
              Three things we got out of the way so you can just talk.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="card p-6 opacity-0 animate-fade-in-up sm:p-7"
                style={{
                  animationDelay: feature.delay,
                  animationFillMode: "forwards",
                }}
              >
                <div
                  className={`mb-5 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] ${
                    feature.tone === "brand"
                      ? "bg-[var(--primary-soft-strong)] text-[var(--primary)]"
                      : "bg-[var(--accent-soft)] text-[var(--accent)]"
                  }`}
                >
                  <feature.icon className="h-[21px] w-[21px]" />
                </div>
                <h3 className="mb-2 text-[17px] font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <section className="bg-[var(--brand-panel)]">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to meet someone new?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-[var(--muted)] sm:text-[17px]">
            Set up your profile in a minute and start a conversation today.
          </p>
          <button
            onClick={() => router.push("/signup")}
            className="btn-primary mt-8 w-full px-8 py-3.5 text-base sm:w-auto"
          >
            Create account
          </button>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-7 sm:flex-row sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-xs)] bg-[var(--primary-fill)]">
              <MessageCircle className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-sm font-semibold">ChatVerse</span>
          </div>
          <p className="text-sm text-[var(--muted-2)]">
            © {new Date().getFullYear()} ChatVerse. Made for real conversations.
          </p>
        </div>
      </footer>
    </div>
  );
}
