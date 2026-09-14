"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import ConnectionArt from "./ConnectionArt";
import ThemeToggle from "./ThemeToggle";

type AuthShellProps = {
  /** Large heading above the form, e.g. "Welcome back". */
  heading: string;
  /** One supporting line under the heading. */
  subheading: string;
  /** Headline on the illustration panel — hidden on phones. */
  artTitle: string;
  artBody: string;
  /** The form itself. */
  children: React.ReactNode;
};

/**
 * Split-screen frame shared by Login and Signup.
 *
 * Desktop and tablet get two equal columns: illustration left, form right.
 * On phones the grid collapses, the illustration shrinks to a short banner,
 * and the form takes over below it.
 */
export default function AuthShell({
  heading,
  subheading,
  artTitle,
  artBody,
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-screen-dvh bg-[var(--surface)] md:grid md:grid-cols-2">
      {/* Illustration. Sticky on wide screens so a long form scrolls past a
          panel that stays put. */}
      <aside className="flex flex-col items-center justify-center bg-[var(--brand-panel)] px-6 py-10 md:sticky md:top-0 md:h-dvh md:px-10 lg:px-16">
        <ConnectionArt className="w-full max-w-[200px] sm:max-w-[260px] md:max-w-[360px] lg:max-w-[440px]" />

        <div className="mt-8 hidden max-w-[420px] text-center md:block">
          <h2 className="text-[22px] font-semibold leading-snug tracking-tight text-[var(--text)] lg:text-2xl">
            {artTitle}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
            {artBody}
          </p>
        </div>
      </aside>

      {/* Form */}
      <main className="flex flex-col justify-center px-5 py-10 sm:px-8 md:px-10 md:py-14 lg:px-16">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-8 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary-fill)]">
                <MessageCircle className="h-[18px] w-[18px] text-white" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-[var(--text)]">
                ChatVerse
              </span>
            </Link>
            <ThemeToggle variant="icon" />
          </div>

          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[var(--text)] sm:text-3xl">
            {heading}
          </h1>
          <p className="mt-2 text-[15px] text-[var(--muted)]">{subheading}</p>

          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  );
}

/** Hairline rule with a centred label — "or", between the form and Google. */
export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-[var(--border)]" />
      <span className="text-xs font-medium text-[var(--muted-2)]">{label}</span>
      <span className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

/**
 * Google sign-in button. Matches the primary button's height and radius so the
 * two stack as a pair — only the fill and the brand mark differ.
 */
export function GoogleButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-secondary flex w-full items-center justify-center gap-2.5 py-3 text-[15px] font-medium"
    >
      {/* Google's four-colour mark, kept at its official colours. */}
      <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {label}
    </button>
  );
}
