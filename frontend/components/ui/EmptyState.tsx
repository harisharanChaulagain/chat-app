import React from "react";

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  tone?: "brand" | "danger";
  /** `compact` fits inside a narrow column such as the Messages list. */
  size?: "compact" | "full";
};

/**
 * The one empty/error state used across Discover, Matches and Messages, so a
 * quiet screen looks deliberate rather than broken wherever it appears.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "brand",
  size = "full",
}: EmptyStateProps) {
  const compact = size === "compact";

  return (
    <div
      className={`flex flex-col items-center justify-center text-center animate-fade-in ${
        compact ? "px-4 py-12" : "px-2 py-14 sm:py-20"
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-[var(--radius-xl)] border ${
          compact ? "mb-3.5 h-12 w-12" : "mb-4 h-14 w-14 sm:mb-5 sm:h-16 sm:w-16"
        } ${
          tone === "danger"
            ? "border-[var(--danger)]/20 bg-[var(--danger-soft)]"
            : "border-[var(--border)] bg-[var(--surface)]"
        }`}
      >
        {icon}
      </div>

      <h3
        className={`font-semibold text-[var(--text)] ${
          compact ? "text-sm" : "text-base sm:text-lg"
        }`}
      >
        {title}
      </h3>

      <p
        className={`leading-relaxed text-[var(--muted)] ${
          compact
            ? "mt-1.5 max-w-[16rem] text-[13px]"
            : "mt-2 max-w-sm text-sm"
        }`}
      >
        {description}
      </p>

      {action}
    </div>
  );
}
