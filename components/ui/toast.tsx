"use client";

import { CheckCircle, Info, WarningCircle, WarningOctagon, X } from "@phosphor-icons/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type ToastTone = "success" | "error" | "info" | "warning";

export type ToastOptions = {
  tone: ToastTone;
  message: string;
  title?: string;
  duration?: number;
};

type Toast = ToastOptions & { id: number };

type ToastContextValue = {
  showToast: (toast: ToastOptions) => number;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const DEFAULT_DURATION = 5_000;
const MAX_VISIBLE_TOASTS = 4;

const toneIcons = {
  success: CheckCircle,
  error: WarningCircle,
  info: Info,
  warning: WarningOctagon,
} as const;

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const Icon = toneIcons[toast.tone];

  return (
    <article
      className={`toast toast-${toast.tone}`}
      role={toast.tone === "error" ? "alert" : "status"}
      aria-atomic="true"
    >
      <Icon size={21} weight="bold" aria-hidden="true" />
      <div className="min-w-0">
        {toast.title ? <p className="toast-title">{toast.title}</p> : null}
        <p className="toast-message">{toast.message}</p>
      </div>
      <button type="button" className="toast-dismiss" aria-label="Cerrar notificación" onClick={() => onDismiss(toast.id)}>
        <X size={16} weight="bold" aria-hidden="true" />
      </button>
    </article>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" aria-label="Notificaciones">
      {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />)}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: ToastOptions) => {
    const id = nextId.current + 1;
    nextId.current = id;
    setToasts((current) => [...current.slice(-(MAX_VISIBLE_TOASTS - 1)), { ...toast, id }]);
    return id;
  }, []);

  useEffect(() => {
    const timers = toasts
      .filter((toast) => toast.duration !== 0)
      .map((toast) => window.setTimeout(() => dismissToast(toast.id), toast.duration ?? DEFAULT_DURATION));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [dismissToast, toasts]);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast debe utilizarse dentro de ToastProvider.");
  return context;
}
