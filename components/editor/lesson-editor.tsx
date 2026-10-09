"use client";

import { CaretDownIcon, CodeIcon, ImageIcon, LinkIcon, ListBulletsIcon, ListNumbersIcon, MinusIcon, PlusIcon, QuotesIcon, TextBIcon, TextHOneIcon, TextHThreeIcon, TextHTwoIcon, TextItalicIcon, TextTIcon } from "@phosphor-icons/react";
import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState, type ElementType } from "react";
import { useRouter } from "next/navigation";

import { apiFetch, applyLessonContent, discardContentRevision, publishContentRevision } from "@/lib/api";
import { collectMediaPathnames, deleteContentMedia, getMediaKind, importContentMedia, uploadContentMedia } from "@/lib/content-media";
import type { ContentSuggestion, Lesson, LessonApplySection, MediaReference, Module, ModulePlanSection, TiptapDocument, ContentRevision } from "@/lib/types";
import { ContentAiAssistant } from "@/components/admin/content-ai-assistant";
import { createContentExtensions } from "@/components/editor/media-extensions";
import { StatusNotice } from "@/components/ui/status-notice";
import { UrlDialog } from "@/components/ui/url-dialog";

type FloatingPosition = { top: number; left: number };
type SelectionPosition = { from: number; to: number };
type BlockAction = { icon: ElementType; label: string; active: boolean; run: () => void };
type TiptapEditor = NonNullable<ReturnType<typeof useEditor>>;

function getActiveBlockElement(editor: TiptapEditor): HTMLElement | null {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.isTextblock || node.type.name === "horizontalRule") {
      const domNode = editor.view.nodeDOM($from.before(depth));
      return domNode instanceof HTMLElement ? domNode : null;
    }
  }
  return editor.view.dom.querySelector("p, h1, h2, h3, img, video");
}

function mediaNode(reference: MediaReference) {
  const kind = getMediaKind(reference.content_type);
  if (kind === "video") {
    return { type: "video", attrs: { src: reference.url, mediaPathname: reference.pathname, mediaContentType: reference.content_type, mediaSize: reference.size, controls: true } };
  }
  return { type: "image", attrs: { src: reference.url, alt: "Media de la lección", mediaPathname: reference.pathname, mediaContentType: reference.content_type, mediaSize: reference.size } };
}

export function BlockFormatMenu({ editor, open, onToggle, onClose, onAddMedia }: { editor: TiptapEditor; open: boolean; onToggle: () => void; onClose: () => void; onAddMedia: () => void }) {
  const actions: BlockAction[] = [
    { icon: TextTIcon, label: "Texto", active: editor.isActive("paragraph"), run: () => editor.chain().focus().setParagraph().run() },
    { icon: TextHOneIcon, label: "Título 1", active: editor.isActive("heading", { level: 1 }), run: () => editor.chain().focus().setHeading({ level: 1 }).run() },
    { icon: TextHTwoIcon, label: "Título 2", active: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().setHeading({ level: 2 }).run() },
    { icon: TextHThreeIcon, label: "Título 3", active: editor.isActive("heading", { level: 3 }), run: () => editor.chain().focus().setHeading({ level: 3 }).run() },
    { icon: ListBulletsIcon, label: "Lista", active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { icon: ListNumbersIcon, label: "Lista numerada", active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { icon: QuotesIcon, label: "Cita", active: editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
    { icon: CodeIcon, label: "Código", active: editor.isActive("codeBlock"), run: () => editor.chain().focus().toggleCodeBlock().run() },
    { icon: MinusIcon, label: "Separador", active: false, run: () => editor.chain().focus().setHorizontalRule().run() },
  ];

  return <div className="block-menu-wrap"><button type="button" className="block-add-button" aria-label="Agregar o cambiar formato del bloque" aria-expanded={open} aria-haspopup="menu" onClick={onToggle}><PlusIcon size={18} weight="bold" /><CaretDownIcon size={12} weight="bold" /></button>{open && <div className="block-format-menu" role="menu"><p className="block-menu-label">Formato del bloque</p>{actions.map(({ icon: ActionIcon, label, active, run }) => <button type="button" role="menuitem" key={label} className={active ? "is-active" : ""} onMouseDown={(event) => event.preventDefault()} onClick={() => { run(); onClose(); }}><ActionIcon size={17} weight="bold" /><span>{label}</span></button>)}<button type="button" role="menuitem" onMouseDown={(event) => event.preventDefault()} onClick={() => { onAddMedia(); onClose(); }}><ImageIcon size={17} weight="bold" /><span>Imagen o video</span></button></div>}</div>;
}

function InlineSelectionMenu({ editor, position, onAddLink }: { editor: TiptapEditor; position: FloatingPosition; onAddLink: () => void }) {
  return <div className="inline-selection-menu" style={{ top: position.top, left: position.left }} role="toolbar" aria-label="Formato del texto seleccionado"><button type="button" aria-label="Negrita" title="Negrita" className={editor.isActive("bold") ? "is-active" : ""} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()}><TextBIcon size={17} weight="bold" /></button><button type="button" aria-label="Cursiva" title="Cursiva" className={editor.isActive("italic") ? "is-active" : ""} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()}><TextItalicIcon size={17} weight="bold" /></button><button type="button" aria-label="Enlace" title="Enlace" className={editor.isActive("link") ? "is-active" : ""} onMouseDown={(event) => event.preventDefault()} onClick={onAddLink}><LinkIcon size={17} weight="bold" /></button></div>;
}

export function LessonEditor({ lesson, modules, initialModuleId, initialRevision }: { lesson?: Lesson; modules: Module[]; initialModuleId?: string; initialRevision?: ContentRevision | null }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef<SelectionPosition>({ from: 1, to: 1 });
  const pendingUploadsRef = useRef(new Map<string, MediaReference>());
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [description, setDescription] = useState(lesson?.description ?? "");
  const [moduleId, setModuleId] = useState(lesson?.module_id ?? initialModuleId ?? modules[0]?.id ?? "");
  const [status, setStatus] = useState<Lesson["status"]>(lesson?.status ?? "draft");
  const [minutes, setMinutes] = useState(String(lesson?.estimated_minutes ?? 10));
  const [instructionalPlan, setInstructionalPlan] = useState<Lesson["instructional_plan"]>(lesson?.instructional_plan ?? null);
  const [revision, setRevision] = useState<ContentRevision | null>(initialRevision ?? null);
  const [error, setError] = useState("");
  const [mediaStatus, setMediaStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const [blockPosition, setBlockPosition] = useState<FloatingPosition>({ top: 30, left: 12 });
  const [inlinePosition, setInlinePosition] = useState<FloatingPosition | null>(null);
  const [urlDialog, setUrlDialog] = useState<"link" | "media" | null>(null);
  const editor = useEditor({ extensions: createContentExtensions(), content: lesson?.content ?? { type: "doc", content: [] }, immediatelyRender: false });

  useEffect(() => {
    if (!editor) return;
    let frame = 0;
    const updateFloatingMenus = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        const block = getActiveBlockElement(editor);
        if (!canvas || !block) return;
        selectionRef.current = { from: editor.state.selection.from, to: editor.state.selection.to };
        const canvasRect = canvas.getBoundingClientRect();
        const blockRect = block.getBoundingClientRect();
        setBlockPosition({ top: Math.max(12, blockRect.top - canvasRect.top), left: Math.max(10, blockRect.left - canvasRect.left - 46) });
        if (editor.state.selection.empty) {
          setInlinePosition(null);
          return;
        }
        const from = editor.view.coordsAtPos(editor.state.selection.from);
        const to = editor.view.coordsAtPos(editor.state.selection.to);
        setInlinePosition({ top: Math.max(8, Math.min(from.top, to.top) - canvasRect.top - 48), left: Math.max(84, (from.left + to.right) / 2 - canvasRect.left - 72) });
      });
    };
    updateFloatingMenus();
    editor.on("selectionUpdate", updateFloatingMenus);
    editor.on("focus", updateFloatingMenus);
    window.addEventListener("resize", updateFloatingMenus);
    window.addEventListener("scroll", updateFloatingMenus, true);
    return () => {
      cancelAnimationFrame(frame);
      editor.off("selectionUpdate", updateFloatingMenus);
      editor.off("focus", updateFloatingMenus);
      window.removeEventListener("resize", updateFloatingMenus);
      window.removeEventListener("scroll", updateFloatingMenus, true);
    };
  }, [editor]);

  function addLink() {
    if (!editor) return;
    selectionRef.current = { from: editor.state.selection.from, to: editor.state.selection.to };
    setUrlDialog("link");
  }

  function insertLink(url: string) {
    if (!editor) return;
    editor.chain().focus().setTextSelection(selectionRef.current).setLink({ href: url }).run();
  }

  const insertMedia = useCallback((reference: MediaReference) => {
    if (!editor) return;
    editor.chain().focus().setTextSelection(selectionRef.current).insertContent(mediaNode(reference)).run();
  }, [editor]);

  const uploadFile = useCallback(async (file: File) => {
    setMediaStatus("Subiendo medio…");
    try {
      const reference = await uploadContentMedia(file, (percentage) => setMediaStatus(`Subiendo medio… ${percentage}%`));
      pendingUploadsRef.current.set(reference.pathname, reference);
      insertMedia(reference);
      setMediaStatus("Medio cargado en Blob.");
    } catch (caught) {
      setMediaStatus(caught instanceof Error ? caught.message : "No pudimos cargar el medio.");
    }
  }, [insertMedia]);

  const importMediaFromUrl = useCallback(async (url: string) => {
    setMediaStatus("Importando medio…");
    try {
      const reference = await importContentMedia(url);
      pendingUploadsRef.current.set(reference.pathname, reference);
      insertMedia(reference);
      setMediaStatus("Medio importado a Blob.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "No pudimos importar el medio.";
      setMediaStatus(message);
      throw new Error(message);
    }
  }, [insertMedia]);

  function addMediaFromUrl() {
    setUrlDialog("media");
  }

  const handlePaste = useCallback((event: ClipboardEvent) => {
    if (!event.clipboardData) return;
    const pastedFile = Array.from(event.clipboardData.files).find((file) => getMediaKind(file.type));
    if (pastedFile) {
      event.preventDefault();
      void uploadFile(pastedFile);
      return;
    }
    const pastedUrl = event.clipboardData.getData("text/plain").trim();
    if (/^https?:\/\/[^\s]+\.(?:jpe?g|png|webp|avif|mp4|webm|mov)(?:[?#].*)?$/i.test(pastedUrl)) {
      event.preventDefault();
      void importMediaFromUrl(pastedUrl);
    }
  }, [importMediaFromUrl, uploadFile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("paste", handlePaste);
    return () => canvas.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  async function cleanupPendingUploads() {
    await Promise.allSettled([...pendingUploadsRef.current.values()].map((reference) => deleteContentMedia(reference)));
    pendingUploadsRef.current.clear();
  }

  async function applySuggestion(suggestion: ContentSuggestion, sections: Array<LessonApplySection | ModulePlanSection>) {
    const current = instructionalPlan ?? suggestion.instructional_plan;
    const next = { ...current };
    if (sections.includes("objectives")) next.learning_objectives = suggestion.instructional_plan.learning_objectives;
    if (sections.includes("concept_map")) next.concept_map = suggestion.instructional_plan.concept_map;
    if (sections.includes("formats")) next.recommended_formats = suggestion.instructional_plan.recommended_formats;
    if (sections.includes("session_plan")) next.session_plan = suggestion.instructional_plan.session_plan;
    if (sections.includes("lesson_sequence")) next.lesson_sequence = suggestion.instructional_plan.lesson_sequence;
    next.central_topic = suggestion.instructional_plan.central_topic;
    next.ordering_strategy = suggestion.instructional_plan.ordering_strategy;
    next.ordering_rationale = suggestion.instructional_plan.ordering_rationale;
    const nextTitle = sections.includes("fields") ? suggestion.title : title || suggestion.title;
    const nextDescription = sections.includes("fields") ? suggestion.description : description || suggestion.description;
    const nextMinutes = sections.includes("fields") ? String(suggestion.estimated_minutes ?? minutes) : minutes;
    if (sections.includes("fields")) {
      setTitle(nextTitle);
      setDescription(nextDescription);
      setMinutes(nextMinutes);
    }
    if (sections.includes("content") && suggestion.content && editor) editor.commands.setContent(suggestion.content);
    setInstructionalPlan(next);
    if (lesson && suggestion.base_updated_at) {
      const response = await applyLessonContent(lesson.id, {
        base_updated_at: suggestion.base_updated_at,
        sections: sections as LessonApplySection[],
        title: nextTitle,
        description: nextDescription,
        estimated_minutes: Number(nextMinutes),
        instructional_plan: next,
        content: suggestion.content ?? undefined,
      });
      if (response.revision) setRevision(response.revision);
    }
  }

  async function publishRevision() {
    if (!revision) return;
    try {
      await publishContentRevision(revision.id);
      setRevision(null);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos publicar la revisión.");
    }
  }

  async function discardRevision() {
    if (!revision) return;
    try {
      await discardContentRevision(revision.id);
      setRevision(null);
      if (lesson) {
        setTitle(lesson.title);
        setDescription(lesson.description);
        setMinutes(String(lesson.estimated_minutes));
        setInstructionalPlan(lesson.instructional_plan);
        editor?.commands.setContent(lesson.content);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos descartar la revisión.");
    }
  }

  async function save() {
    if (!editor || title.trim().length < 3 || !moduleId) {
      setError("Completa el título y selecciona un módulo.");
      return;
    }
    setSaving(true);
    setError("");
    const content = editor.getJSON() as TiptapDocument;
    const referencedPathnames = collectMediaPathnames(content);
    const removedPending = [...pendingUploadsRef.current.values()].filter((reference) => !referencedPathnames.has(reference.pathname));
    await Promise.allSettled(removedPending.map((reference) => deleteContentMedia(reference)));
    removedPending.forEach((reference) => pendingUploadsRef.current.delete(reference.pathname));
    const payload = { title, description, status, estimated_minutes: Number(minutes), content, instructional_plan: instructionalPlan };
    try {
      await apiFetch<Lesson>(lesson ? `/admin/lessons/${lesson.id}` : `/admin/modules/${moduleId}/lessons`, { method: lesson ? "PATCH" : "POST", body: JSON.stringify(payload) });
      pendingUploadsRef.current.clear();
      router.push(`/admin/modules/${lesson?.module_id ?? moduleId}`);
      router.refresh();
    } catch (caught) {
      await cleanupPendingUploads();
      setError(caught instanceof Error ? caught.message : "No pudimos guardar la lección.");
      setSaving(false);
    }
  }

  return <><div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]"><aside className="surface h-fit space-y-5 p-5 sm:p-6"><div><p className="eyebrow text-seaweed">Configuración</p><p className="mt-2 text-sm leading-6 text-twilight/55">Define el contexto antes de construir la experiencia de aprendizaje.</p></div><label className="field"><span>Título</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Cómo escribir logros cuantificables" disabled={Boolean(revision)} /></label><label className="field"><span>Descripción</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Qué aprenderá el estudiante…" disabled={Boolean(revision)} /></label>{!lesson && <label className="field"><span>Módulo</span><select value={moduleId} onChange={(event) => setModuleId(event.target.value)}>{modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</select></label>}<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1"><label className="field"><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value as Lesson["status"])} disabled={Boolean(revision)}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></label><label className="field"><span>Minutos estimados</span><input value={minutes} onChange={(event) => setMinutes(event.target.value)} type="number" min={1} max={240} disabled={Boolean(revision)} /></label></div><input ref={fileInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void uploadFile(file); }} /><button type="button" onClick={save} disabled={saving || Boolean(revision)} className="button button-primary button-large w-full">{revision ? "Resuelve la revisión pendiente" : saving ? "Guardando…" : "Guardar lección"}</button>{mediaStatus ? <StatusNotice tone="info">{mediaStatus}</StatusNotice> : null}{error ? <StatusNotice tone="error">{error}</StatusNotice> : null}</aside><section className="editor-frame"><div className="flex items-center justify-between border-b border-twilight/10 px-5 py-4"><div><p className="eyebrow text-teal">Lienzo de lección</p><p className="mt-1 text-xs text-twilight/45">Selecciona texto para aplicar formato o enlazarlo.</p></div><button type="button" className="button button-secondary" onClick={() => setUrlDialog("media")} disabled={Boolean(revision)}>Importar media</button></div><div ref={canvasRef} className="editor-canvas">{editor && <div className="editor-block-controls" style={{ top: blockPosition.top, left: blockPosition.left }}><BlockFormatMenu editor={editor} open={blockMenuOpen} onToggle={() => setBlockMenuOpen((current) => !current)} onClose={() => setBlockMenuOpen(false)} onAddMedia={() => fileInputRef.current?.click()} /></div>}{editor && inlinePosition && <InlineSelectionMenu editor={editor} position={inlinePosition} onAddLink={addLink} />}<EditorContent editor={editor} /><div className="px-5 pb-5 text-xs text-twilight/45"><button type="button" className="font-semibold text-teal underline underline-offset-2" onClick={addMediaFromUrl} disabled={Boolean(revision)}>Importar medio desde una URL</button></div></div></section></div><ContentAiAssistant target="lesson" mode={lesson ? "organize" : "create"} targetId={lesson?.id} initialTopic={title} currentSummary={{ title, description, items: lesson ? [editor?.getText() || "Contenido actual"] : undefined }} getPayload={() => ({ title, description, objective: instructionalPlan?.learning_objectives[0] ?? "", module_title: modules.find((module) => module.id === moduleId)?.title ?? "", module_description: modules.find((module) => module.id === moduleId)?.description ?? "", estimated_minutes: Number(minutes), content: editor?.getJSON() ?? { type: "doc", content: [] }, instructional_plan: instructionalPlan })} onApply={applySuggestion} />{revision ? <StatusNotice tone="info" className="mt-4">Hay una revisión de IA pendiente. <button type="button" className="ml-2 font-semibold underline" onClick={() => void publishRevision()}>Publicar versión</button><button type="button" className="ml-3 font-semibold underline" onClick={() => void discardRevision()}>Descartar</button></StatusNotice> : null}<UrlDialog open={urlDialog !== null} onClose={() => setUrlDialog(null)} onSubmit={urlDialog === "link" ? insertLink : importMediaFromUrl} title={urlDialog === "link" ? "Añadir enlace" : "Importar imagen o video"} description={urlDialog === "link" ? "Conecta el texto seleccionado con un recurso de confianza." : "Guardaremos una copia pública del recurso en el almacenamiento de contenido."} submitLabel={urlDialog === "link" ? "Añadir enlace" : "Importar recurso"} /></>;
}
