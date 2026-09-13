"use client";

import React from "react";
import clsx from "clsx";
import { Monitor, Moon, Sun } from "lucide-react";
import { ThemeChoice, useTheme } from "@/context/ThemeContext";

const OPTIONS: { key: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { key: "light", label: "Light", Icon: Sun },
  { key: "dark", label: "Dark", Icon: Moon },
  { key: "system", label: "System", Icon: Monitor },
];

type ThemeToggleProps = {
  /**
   * "segmented" — a three-way light/dark/system control for menus.
   * "icon" — a single button that flips between light and dark.
   */
  variant?: "segmented" | "icon";
  className?: string;
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "segmented",
  className,
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === "icon") {
    const goingDark = resolvedTheme === "light";
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={goingDark ? "Switch to dark mode" : "Switch to light mode"}
        title={goingDark ? "Dark mode" : "Light mode"}
        className={clsx(
          "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--border-strong)] hover:text-[var(--text)]",
          className
        )}
      >
        {goingDark ? (
          <Moon className="h-[18px] w-[18px]" />
        ) : (
          <Sun className="h-[18px] w-[18px]" />
        )}
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={clsx(
        "flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] p-1",
        className
      )}
    >
      {OPTIONS.map(({ key, label, Icon }) => {
        const isActive = theme === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} theme`}
            title={label}
            onClick={() => setTheme(key)}
            className={clsx(
              "flex h-7 flex-1 items-center justify-center gap-1.5 rounded-full px-2 text-[11px] font-medium transition-all duration-200",
              isActive
                ? "bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-xs)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
