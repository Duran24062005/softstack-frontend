import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { AssessmentEditor } from "@/components/admin/assessment-editor";

export default async function NewAssessmentPage({ searchParams }: { searchParams: Promise<{ target?: string; targetId?: string }> }) {
  const params = await searchParams;
  const target = params.target === "module" ? "module" : "lesson";
  const targetId = params.targetId ?? "";
  return <div className="app-main"><div className="mx-auto max-w-5xl"><Link href="/admin/modules" className="back-link"><ArrowLeft size={16} /> Módulos</Link><header className="mt-8 border-b border-twilight/13 pb-8"><p className="eyebrow text-seaweed">Administración / Evaluaciones</p><h1 className="display mt-4 text-5xl tracking-[-.055em] sm:text-7xl">Diseña el quiz.</h1><p className="mt-5 max-w-xl leading-7 text-twilight/58">Las preguntas se revisan y aprueban antes de llegar a un estudiante.</p></header><div className="mt-8"><AssessmentEditor target={target} targetId={targetId} /></div></div></div>;
}
