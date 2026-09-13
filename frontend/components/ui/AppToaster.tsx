"use client";

import React from "react";
import { Toaster } from "react-hot-toast";

/**
 * App-wide toast styling.
 *
 * Colours come through as CSS custom properties rather than literals, so
 * toasts follow the active theme without this component having to re-render
 * when the theme flips.
 */
const AppToaster = () => (
  <Toaster
    position="top-right"
    containerStyle={{
      // Clears the notch / status bar on phones.
      top: "max(1rem, env(safe-area-inset-top, 0px))",
    }}
    toastOptions={{
      style: {
        background: "var(--surface)",
        color: "var(--text)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-lg)",
        fontSize: "14px",
        fontWeight: 500,
        fontFamily: "var(--font-inter), 'Inter', system-ui, sans-serif",
        padding: "12px 16px",
        maxWidth: "min(24rem, calc(100vw - 2rem))",
      },
      success: {
        duration: 3000,
        iconTheme: {
          primary: "var(--success)",
          secondary: "var(--surface)",
        },
      },
      error: {
        duration: 4000,
        iconTheme: {
          primary: "var(--danger)",
          secondary: "var(--surface)",
        },
      },
      loading: {
        iconTheme: {
          primary: "var(--primary)",
          secondary: "var(--surface)",
        },
      },
    }}
  />
);

export default AppToaster;
