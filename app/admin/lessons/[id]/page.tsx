import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonEditor } from "@/components/editor/lesson-editor";
import { getAdminLesson, getAdminModules } from "@/lib/server-api";

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lesson, modules] = await Promise.all([getAdminLesson(id), getAdminModules()]);
  if (!lesson) notFound();
  return <div className="app-main"><Link href={`/admin/modules/${lesson.module_id}`} className="back-link"><ArrowLeft size={16} /> Volver al módulo</Link><header className="mt-8 border-b border-twilight/13 pb-8"><p className="eyebrow text-seaweed">Administración / Contenido</p><h1 className="display mt-4 text-5xl tracking-[-.055em] sm:text-7xl">Editar lección.</h1><p className="mt-5 max-w-xl leading-7 text-twilight/58">Actualiza el contenido sin alterar su ubicación en la trayectoria.</p></header><div className="mt-8"><LessonEditor lesson={lesson} modules={modules} /></div></div>;
}
