import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";

import { LessonEditor } from "@/components/editor/lesson-editor";
import { getAdminLesson, getAdminModules } from "@/lib/server-api";

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lesson, modules] = await Promise.all([getAdminLesson(id), getAdminModules()]);
  if (!lesson) notFound();
  return <div className="app-main"><div className="mb-10"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-ink/50 hover:text-ink"><ArrowLeft size={16} /> Dashboard</Link><p className="eyebrow mt-8 text-cobalt">Admin / Contenido</p><h1 className="display mt-4 text-5xl tracking-[-.06em]">Editar lección.</h1></div><LessonEditor lesson={lesson} modules={modules} /></div>;
}
