import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { BrandLockup } from "@/components/ui/brand-lockup";

export default function NotFound() {
  return <main className="grid min-h-dvh place-items-center bg-canvas p-6"><section className="surface w-full max-w-xl p-8 sm:p-12"><BrandLockup /><p className="eyebrow mt-14 text-seaweed">Error 404</p><h1 className="display mt-4 text-5xl tracking-[-.055em]">Esta ruta no existe.</h1><p className="mt-5 max-w-md leading-7 text-twilight/58">Puede que el contenido haya cambiado de lugar o que el enlace no esté disponible para tu cuenta.</p><Link href="/" className="button button-primary mt-8"><ArrowLeft size={17} /> Volver al inicio</Link></section></main>;
}
