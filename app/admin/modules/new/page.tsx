import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { ModuleForm } from "@/components/admin/module-form";

export default function NewModulePage() {
  return <div className="app-main"><div className="mx-auto max-w-4xl"><Link href="/admin/modules" className="back-link"><ArrowLeft size={16} /> Módulos</Link><header className="mt-8 border-b border-twilight/13 pb-8"><p className="eyebrow text-seaweed">Administración / Biblioteca</p><h1 className="display mt-4 text-5xl tracking-[-.055em] sm:text-7xl">Nuevo módulo.</h1><p className="mt-5 max-w-xl leading-7 text-twilight/58">Una unidad clara ayuda a que cada estudiante entienda hacia dónde se dirige.</p></header><div className="mt-8"><ModuleForm /></div></div></div>;
}
