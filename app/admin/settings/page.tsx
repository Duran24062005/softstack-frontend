import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { AssessmentSettingsForm } from "@/components/admin/assessment-settings-form";
import { getAssessmentSettings, requireAdmin } from "@/lib/server-api";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getAssessmentSettings();
  return <div className="app-main"><Link href="/admin/modules" className="back-link"><ArrowLeft size={16} /> Módulos</Link><header className="mt-8 border-b border-twilight/13 pb-8"><p className="eyebrow text-seaweed">Administración / Configuración</p><h1 className="display mt-4 text-4xl tracking-[-.055em] sm:text-6xl lg:text-7xl">Reglas claras.</h1><p className="mt-5 max-w-xl leading-7 text-twilight/58">Define el umbral global que utilizará el sistema para calificar nuevos intentos.</p></header><div className="mt-8"><AssessmentSettingsForm initial={settings} /></div></div>;
}
