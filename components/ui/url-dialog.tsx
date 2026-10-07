"use client";

import { X } from "@phosphor-icons/react";
import { FormEvent, KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { parseHttpUrl } from "@/lib/ui-validation";

type UrlDialogProps = {
  open: boolean;
  title: string;
  description: string;
  submitLabel: string;
  placeholder?: string;
  onClose: () => void;
  onSubmit: (url: string) => Promise<void> | void;
};

export function UrlDialog({
  open,
  title,
  description,
  submitLabel,
  placeholder = "https://ejemplo.com/recurso",
  onClose,
  onSubmit,
}: UrlDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  function close() {
    if (submitting) return;
    setValue("");
    setError("");
    onClose();
  }

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href], textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    let url: string;

    try {
      url = parseHttpUrl(value);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "La URL no es válida.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(url);
      setValue("");
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos procesar la URL.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="dialog-panel"
        onKeyDown={trapFocus}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="eyebrow text-seaweed">Recurso externo</p>
            <h2 id={titleId} className="display mt-3 text-3xl tracking-[-0.04em] text-twilight">
              {title}
            </h2>
            <p id={descriptionId} className="mt-3 max-w-md text-sm leading-6 text-twilight/60">
              {description}
            </p>
          </div>
          <button type="button" onClick={close} className="icon-button" aria-label="Cerrar diálogo">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="field">
            <span>URL</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder={placeholder}
              required
            />
          </label>
          {error ? <p role="alert" className="text-sm font-medium text-danger">{error}</p> : null}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={close} className="button button-secondary" disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="button button-primary" disabled={submitting}>
              {submitting ? "Procesando…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
