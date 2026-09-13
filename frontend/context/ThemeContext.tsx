"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemeChoice = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "chatverse-theme";

type ThemeContextValue = {
  /** What the user picked — "system" means follow the OS. */
  theme: ThemeChoice;
  /** What is actually painted right now. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeChoice) => void;
  /** Flips between light and dark, resolving "system" first. */
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => undefined,
  toggleTheme: () => undefined,
});

const prefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const readStoredTheme = (): ThemeChoice => {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Private mode / blocked storage — fall back to following the OS.
  }
  return "system";
};

/**
 * Applies the choice to `<html>`.
 *
 * "system" removes the attribute entirely rather than stamping a resolved
 * value, so the `prefers-color-scheme` block in globals.css keeps handling it
 * and the page follows the OS live, with no listener needed for the paint.
 */
const applyTheme = (choice: ThemeChoice) => {
  const root = document.documentElement;
  if (choice === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", choice);
  }
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Server render and first client paint agree on "system"; the inline script
  // in the document head has already stamped the real attribute by then, so
  // there is no flash while this effect catches up.
  const [theme, setThemeState] = useState<ThemeChoice>("system");
  const [systemIsDark, setSystemIsDark] = useState(false);

  useEffect(() => {
    setThemeState(readStoredTheme());
    setSystemIsDark(prefersDark());
  }, []);

  // Keep `resolvedTheme` honest while the user is on "system" and flips their
  // OS appearance mid-session.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) =>
      setSystemIsDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal: the theme still applies for this session.
    }
  }, []);

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (systemIsDark ? "dark" : "light") : theme;

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

/**
 * Runs before first paint to stamp `data-theme` from storage, so a user who
 * chose dark never sees a white flash on load.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;
