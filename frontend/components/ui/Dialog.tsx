"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Buttons, laid out by the caller. */
  footer?: React.ReactNode;
  /** Hides the close affordance for a dialog that demands an answer. */
  dismissible?: boolean;
};

/**
 * The one modal shell: a flat scrim over a solid panel. Shared by the report,
 * confirm and match dialogs so they behave identically — escape to close,
 * backdrop to dismiss, and no page scrolling behind.
 */
export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    // Stop the page behind from scrolling under the dialog.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, dismissible]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[rgba(20,17,18,0.55)] animate-fade-in"
        style={{ animationDuration: "150ms" }}
        onClick={() => dismissible && onClose()}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-t-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-lg)] outline-none animate-slide-up sm:rounded-[var(--radius-xl)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-[var(--text)]">
              {title}
            </h2>
            {description && (
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                {description}
              </p>
            )}
          </div>

          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="icon-btn flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {children && <div className="mt-5">{children}</div>}

        {footer && <div className="mt-6 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}
