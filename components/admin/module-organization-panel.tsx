"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ContentAiAssistant, type ContentAssistantSection } from "@/components/admin/content-ai-assistant";
import { StatusNotice } from "@/components/ui/status-notice";
import { useToast } from "@/components/ui/toast";
import { applyModuleContent, discardContentRevision, publishContentRevision } from "@/lib/api";
import { mapApiErrorToToast } from "@/lib/response-messages";
import type { ContentRevision, ContentSuggestion, Lesson, Module, ModulePlanSection } from "@/lib/types";

export function ModuleOrganizationPanel({ module, lessons, initialRevision }: { module: Module; lessons: Lesson[]; initialRevision?: ContentRevision | null }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [revision, setRevision] = useState<ContentRevision | null>(initialRevision ?? null);

  async function applySuggestion(suggestion: ContentSuggestion, sections: ContentAssistantSection[]) {
    if (!suggestion.base_updated_at) throw new Error("La propuesta no tiene una versión base válida.");
    const lessonOrders = sections.includes("lesson_sequence")
      ? suggestion.instructional_plan.lesson_sequence.map((blueprint, index) => {
        const source = blueprint.source_id ? lessons.find((lesson) => lesson.id === blueprint.source_id) : lessons.find((lesson) => lesson.title.toLowerCase() === blueprint.title.toLowerCase());
        return source ? { lesson_id: source.id, order: index } : null;
      }).filter((item): item is { lesson_id: string; order: number } => item !== null)
      : [];
    const response = await applyModuleContent(module.id, {
      base_updated_at: suggestion.base_updated_at,
      plan_sections: sections.filter((section): section is ModulePlanSection => ["fields", "objectives", "concept_map", "formats", "session_plan", "lesson_sequence"].includes(section)),
      title: suggestion.title,
      description: suggestion.description,
      instructional_plan: suggestion.instructional_plan,
      lesson_orders: lessonOrders,
    });
    if (response.revision) {
      setRevision(response.revision);
    } else {
      router.refresh();
    }
  }

  async function publishRevision() {
    if (!revision) return;
    try {
      await publishContentRevision(revision.id);
      setRevision(null);
      showToast({ tone: "success", title: "Revisión publicada", message: "La nueva organización ya está visible." });
      router.refresh();
    } catch (caught) {
      showToast(mapApiErrorToToast(caught, "No pudimos publicar la revisión."));
    }
  }

  async function discardRevision() {
    if (!revision) return;
    try {
      await discardContentRevision(revision.id);
      setRevision(null);
      showToast({ tone: "info", title: "Revisión descartada", message: "El contenido publicado se mantuvo sin cambios." });
    } catch (caught) {
      showToast(mapApiErrorToToast(caught, "No pudimos descartar la revisión."));
    }
  }

  return <>
    <ContentAiAssistant
      target="module"
      mode="organize"
      targetId={module.id}
      initialTopic={module.title}
      getPayload={() => ({
        module_id: module.id,
        title: module.title,
        description: module.description,
        lesson_count: lessons.length || 5,
        lessons: lessons.map((lesson) => ({ id: lesson.id, title: lesson.title, description: lesson.description, order: lesson.order, estimated_minutes: lesson.estimated_minutes, instructional_plan: lesson.instructional_plan })),
        base_updated_at: module.updated_at,
      })}
      currentSummary={{ title: module.title, description: module.description, items: lessons.map((lesson) => lesson.title) }}
      onApply={applySuggestion}
    />
    {revision ? <StatusNotice tone="info" className="mt-4">Se creó una versión borrador; el contenido publicado no cambió. <button type="button" className="ml-2 font-semibold underline" onClick={() => void publishRevision()}>Publicar versión</button><button type="button" className="ml-3 font-semibold underline" onClick={() => void discardRevision()}>Descartar</button></StatusNotice> : null}
  </>;
}
