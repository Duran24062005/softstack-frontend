"use client";

import { Check, CircleNotch, Sparkle } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { suggestLessonContent, suggestModuleContent } from "@/lib/api";
import { mapApiErrorToToast } from "@/lib/response-messages";
import type { ContentSuggestion, LessonApplySection, ModulePlanSection } from "@/lib/types";
import { useToast } from "@/components/ui/toast";

type Target = "module" | "lesson";
export type ContentAssistantSection = ModulePlanSection | LessonApplySection;
type Section = ContentAssistantSection;

const labels: Record<Section, string> = {
  fields: "Título, descripción y duración",
  objectives: "Objetivos de aprendizaje",
  concept_map: "Mapa conceptual",
  formats: "Formatos recomendados",
  session_plan: "Guía de sesión",
  lesson_sequence: "Secuencia de lecciones",
  content: "Bloques del lienzo",
};

const defaults: Record<Target, Section[]> = {
  module: ["fields", "objectives", "concept_map", "formats", "session_plan", "lesson_sequence"],
  lesson: ["fields", "objectives", "concept_map", "formats", "session_plan", "content"],
};

type ContentAiAssistantProps = {
  target: Target;
  mode: "create" | "organize";
  targetId?: string;
  initialTopic?: string;
  getPayload: () => Record<string, unknown>;
  onApply: (suggestion: ContentSuggestion, sections: ContentAssistantSection[]) => Promise<void>;
  currentSummary?: { title: string; description?: string; items?: string[] };
};

export function ContentAiAssistant({ target, mode, targetId, initialTopic = "", getPayload, onApply, currentSummary }: ContentAiAssistantProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [audience, setAudience] = useState("Estudiantes de formación profesional");
  const [level, setLevel] = useState("intermedio");
  const [lessonCount, setLessonCount] = useState("5");
  const [suggestion, setSuggestion] = useState<ContentSuggestion | null>(null);
  const [selected, setSelected] = useState<Section[]>(defaults[target]);
  const [busy, setBusy] = useState(false);
  const [applying, setApplying] = useState(false);
  const { showToast } = useToast();

  const availableSections = useMemo(() => target === "module"
    ? defaults.module.filter((section) => section !== "concept_map" || suggestion?.instructional_plan.concept_map)
    : defaults.lesson.filter((section) => section !== "content" || suggestion?.content), [suggestion, target]);

  function toggle(section: Section) {
    setSelected((current) => current.includes(section) ? current.filter((item) => item !== section) : [...current, section]);
  }

  async function generate() {
    setBusy(true);
    try {
      const base = getPayload();
      const payload = {
        ...base,
        mode,
        topic: topic.trim() || base.title || "",
        audience,
        level,
        lesson_count: Number(lessonCount),
        ...(targetId ? (target === "module" ? { module_id: targetId } : { lesson_id: targetId }) : {}),
      };
      const result = target === "module" ? await suggestModuleContent(payload) : await suggestLessonContent(payload);
      setSuggestion(result);
      setSelected(defaults[target].filter((section) => section !== "concept_map" || result.instructional_plan.concept_map).filter((section) => section !== "content" || result.content));
      showToast({ tone: "success", title: "Propuesta generada", message: "Revísala y aplica solo las secciones que quieras conservar." });
    } catch (caught) {
      showToast(mapApiErrorToToast(caught, "No pudimos generar la propuesta."));
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    if (!suggestion || selected.length === 0) return;
    setApplying(true);
    try {
      await onApply(suggestion, selected);
      showToast({ tone: "success", title: "Propuesta aplicada", message: "Revisa el borrador antes de publicarlo." });
    } catch (caught) {
      showToast(mapApiErrorToToast(caught, "No pudimos aplicar la propuesta."));
    } finally {
      setApplying(false);
    }
  }

  return (
    <section className="surface-soft mt-6 p-5 sm:p-6" aria-label="Asistente de contenido con IA">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow text-seaweed"><Sparkle size={14} weight="fill" className="mr-1 inline" /> Asistente editorial</p>
          <h2 className="display mt-2 text-2xl tracking-[-.035em]">Organiza la experiencia.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-twilight/55">La IA propone una estructura instruccional. Tú decides qué aplicar y qué queda como borrador.</p>
        </div>
        <span className="rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-twilight">Revisión humana</span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
        <label className="field"><span>Tema o instrucción</span><input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder={target === "module" ? "Ej. Comunicación estratégica" : "Ej. Cómo escribir logros medibles"} /></label>
        <label className="field"><span>Nivel</span><select value={level} onChange={(event) => setLevel(event.target.value)}><option value="introductorio">Introductorio</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option></select></label>
        <label className="field"><span>Audiencia</span><input value={audience} onChange={(event) => setAudience(event.target.value)} /></label>
        {target === "module" ? <label className="field"><span>Lecciones</span><input value={lessonCount} onChange={(event) => setLessonCount(event.target.value)} type="number" min={1} max={12} /></label> : null}
      </div>
      <button type="button" onClick={generate} disabled={busy} className="button button-secondary mt-5">{busy ? <CircleNotch size={18} className="animate-spin" /> : <Sparkle size={18} />} {busy ? "Pensando…" : mode === "organize" ? "Analizar y reorganizar" : "Generar propuesta"}</button>
      {suggestion ? <div className="mt-6 grid gap-6 border-t border-twilight/10 pt-6 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <p className="eyebrow text-teal">Vista previa</p>
          <h3 className="display mt-2 text-xl">{suggestion.title}</h3>
          <p className="mt-2 text-sm leading-6 text-twilight/60">{suggestion.description}</p>
          {mode === "organize" ? <div className="mt-4 grid gap-3 rounded-xl border border-twilight/10 bg-canvas p-4 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-twilight/45">Actual</p><p className="mt-2 text-sm font-semibold text-twilight">{currentSummary?.title || "Sin título"}</p><p className="mt-1 text-xs leading-5 text-twilight/55">{currentSummary?.description || "Sin descripción"}</p>{currentSummary?.items?.length ? <ol className="mt-3 space-y-1 text-xs text-twilight/55">{currentSummary.items.map((item, index) => <li key={`${item}-${index}`}>{index + 1}. {item}</li>)}</ol> : null}</div><div><p className="text-xs font-bold uppercase tracking-[.12em] text-seaweed">Propuesta</p><p className="mt-2 text-sm font-semibold text-twilight">{suggestion.title}</p><p className="mt-1 text-xs leading-5 text-twilight/55">{suggestion.description || "Sin descripción"}</p>{suggestion.instructional_plan.lesson_sequence.length ? <ol className="mt-3 space-y-1 text-xs text-twilight/55">{suggestion.instructional_plan.lesson_sequence.map((item, index) => <li key={item.key}>{index + 1}. {item.title}</li>)}</ol> : null}</div></div> : null}
          <div className="mt-4 rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-teal">Objetivos</p><ul className="mt-3 space-y-2 text-sm leading-6 text-twilight/70">{suggestion.instructional_plan.learning_objectives.map((objective) => <li key={objective} className="flex gap-2"><Check size={16} className="mt-1 shrink-0 text-seaweed" />{objective}</li>)}</ul></div>
          {suggestion.instructional_plan.lesson_sequence.length > 0 ? <div className="mt-4 rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-teal">Secuencia propuesta</p><ol className="mt-3 space-y-2 text-sm text-twilight/70">{suggestion.instructional_plan.lesson_sequence.map((lesson, index) => <li key={lesson.key}><span className="mr-2 font-bold text-seaweed">{String(index + 1).padStart(2, "0")}</span>{lesson.title}</li>)}</ol></div> : null}
        </div>
        <div>
          <p className="eyebrow text-teal">Aplicación selectiva</p>
          <div className="mt-3 grid gap-2">{availableSections.map((section) => <label key={section} className="flex cursor-pointer items-start gap-3 rounded-xl border border-twilight/10 bg-white p-3 text-sm text-twilight/75"><input type="checkbox" checked={selected.includes(section)} onChange={() => toggle(section)} className="mt-1 accent-seaweed" /><span><span className="font-semibold text-twilight">{labels[section]}</span><span className="mt-1 block text-xs leading-5 text-twilight/50">{section === "content" ? "Inserta únicamente bloques seguros y editables." : "Se conserva bajo revisión antes de guardar o publicar."}</span></span></label>)}</div>
          <button type="button" onClick={apply} disabled={applying || selected.length === 0} className="button button-primary mt-5">{applying ? <CircleNotch size={18} className="animate-spin" /> : <Check size={18} />} {applying ? "Aplicando…" : "Aplicar selección"}</button>
        </div>
      </div> : null}
    </section>
  );
}
