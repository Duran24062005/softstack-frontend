import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssessmentEditor } from "@/components/admin/assessment-editor";
import { getEducatorAssessment } from "@/lib/server-api";

export default async function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assessment = await getEducatorAssessment(id);
  if (!assessment) notFound();
  return <div className="app-main"><div className="mx-auto max-w-5xl"><Link href="/admin/modules" className="back-link"><ArrowLeft size={16} /> Módulos</Link><header className="mt-8 border-b border-twilight/13 pb-8"><p className="eyebrow text-seaweed">Administración / Evaluaciones</p><h1 className="display mt-4 text-5xl tracking-[-.055em] sm:text-7xl">{assessment.title}</h1><p className="mt-5 max-w-xl leading-7 text-twilight/58">Gestiona el banco de preguntas y el estado de publicación.</p></header><div className="mt-8"><AssessmentEditor target={assessment.target_type} targetId={assessment.target_id} initialAssessment={assessment} /></div></div></div>;
}
