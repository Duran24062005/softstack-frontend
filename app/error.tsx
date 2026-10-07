"use client";

import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-dvh place-items-center bg-canvas p-6 text-twilight"><section className="surface max-w-lg p-8 text-center"><WarningCircle size={38} weight="bold" className="mx-auto text-gold" /><p className="eyebrow mt-6 text-teal">Algo interrumpió la ruta</p><h1 className="display mt-3 text-4xl tracking-[-.045em]">No pudimos cargar esta vista.</h1><p className="mt-4 leading-7 text-twilight/58">Tu sesión y tu progreso siguen protegidos. Intenta cargar de nuevo.</p><button type="button" onClick={reset} className="button button-primary mt-7"><ArrowClockwise size={17} /> Reintentar</button></section></main>;
}
