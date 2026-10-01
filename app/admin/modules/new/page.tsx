import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

import { ModuleForm } from "@/components/admin/module-form";

export default function NewModulePage() {
  return <div className="app-main"><div className="mb-10"><Link href="/admin/modules" className="inline-flex items-center gap-2 text-sm text-ink/50 hover:text-ink"><ArrowLeft size={16} /> Módulos</Link><p className="eyebrow mt-8 text-cobalt">Admin / Biblioteca</p><h1 className="display mt-4 text-5xl tracking-[-.06em] sm:text-7xl">Nuevo módulo.</h1></div><div className="max-w-3xl"><ModuleForm /></div></div>;
}
