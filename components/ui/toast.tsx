"use client";

/**
 * Toast compatibility shim — keeps the existing useToast / addToast / ToastProvider
 * API intact so no consumer files need to change, while delegating to Sonner under
 * the hood for the actual UI.
 *
 * Usage (unchanged across the app):
 *   const { addToast } = useToast()
 *   addToast({ title: "Done!", description: "...", type: "success" })
 *
 * Layout usage (unchanged):
 *   import { ToastProvider } from "@/components/ui/toast"
 *   <ToastProvider>{children}</ToastProvider>
 */

import * as React from "react";
import { toast as sonnerToast, Toaster } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ToastOptions {
  title?: string;
  description?: string;
  type?: "default" | "success" | "error" | "warning";
  duration?: number;
}

interface ToastContextValue {
  /** @deprecated internal — kept for API compatibility only */
  toasts: never[];
  addToast: (options: ToastOptions) => void;
  removeToast: (id: string) => void;
}

// ── Context (stub — real state lives inside Sonner) ───────────────────────────

const ToastContext = React.createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const addToast = React.useCallback((options: ToastOptions) => {
    const { title, description, type = "default", duration = 4000 } = options;

    const message = title ?? "";
    const sopts = { description, duration };

    switch (type) {
      case "success":
        sonnerToast.success(message, sopts);
        break;
      case "error":
        sonnerToast.error(message, sopts);
        break;
      case "warning":
        sonnerToast.warning(message, sopts);
        break;
      default:
        sonnerToast(message, sopts);
    }
  }, []);

  const removeToast = React.useCallback((_id: string) => {
    // Sonner handles its own dismissal; kept for API compatibility
  }, []);

  return (
    <ToastContext.Provider value={{ toasts: [], addToast, removeToast }}>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        expand={false}
        toastOptions={{
          duration: 4000,
          classNames: {
            toast: "font-sans text-sm rounded-xl shadow-lg border",
            title: "font-semibold",
            description: "text-xs opacity-80",
          },
        }}
      />
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
