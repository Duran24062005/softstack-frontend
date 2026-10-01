"use client";

import { CaretDownIcon, CodeIcon, ImageIcon, LinkIcon, ListBulletsIcon, ListNumbersIcon, MinusIcon, PlusIcon, QuotesIcon, TextBIcon, TextHOneIcon, TextHThreeIcon, TextHTwoIcon, TextItalicIcon, TextTIcon } from "@phosphor-icons/react";
import { EditorContent, useEditor } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState, type ElementType } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";
import type { Lesson, Module, TiptapDocument } from "@/lib/types";

type FloatingPosition = { top: number; left: number };
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
  return editor.view.dom.querySelector("p, h1, h2, h3");
}

function BlockFormatMenu({ editor, open, onToggle, onClose, onAddImage }: { editor: TiptapEditor; open: boolean; onToggle: () => void; onClose: () => void; onAddImage: () => void }) {
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

  return <div className="block-menu-wrap"><button type="button" className="block-add-button" aria-label="Agregar o cambiar formato del bloque" aria-expanded={open} aria-haspopup="menu" onClick={onToggle}><PlusIcon size={18} weight="bold" /><CaretDownIcon size={12} weight="bold" /></button>{open && <div className="block-format-menu" role="menu"><p className="block-menu-label">Formato del bloque</p>{actions.map(({ icon: ActionIcon, label, active, run }) => <button type="button" role="menuitem" key={label} className={active ? "is-active" : ""} onMouseDown={(event) => event.preventDefault()} onClick={() => { run(); onClose(); }}><ActionIcon size={17} weight="bold" /><span>{label}</span></button>)}<button type="button" role="menuitem" onMouseDown={(event) => event.preventDefault()} onClick={() => { onAddImage(); onClose(); }}><ImageIcon size={17} weight="bold" /><span>Imagen por URL</span></button></div>}</div>;
}

function InlineSelectionMenu({ editor, position, onAddLink }: { editor: TiptapEditor; position: FloatingPosition; onAddLink: () => void }) {
  return <div className="inline-selection-menu" style={{ top: position.top, left: position.left }} role="toolbar" aria-label="Formato del texto seleccionado"><button type="button" aria-label="Negrita" title="Negrita" className={editor.isActive("bold") ? "is-active" : ""} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleBold().run()}><TextBIcon size={17} weight="bold" /></button><button type="button" aria-label="Cursiva" title="Cursiva" className={editor.isActive("italic") ? "is-active" : ""} onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().toggleItalic().run()}><TextItalicIcon size={17} weight="bold" /></button><button type="button" aria-label="Enlace" title="Enlace" className={editor.isActive("link") ? "is-active" : ""} onMouseDown={(event) => event.preventDefault()} onClick={onAddLink}><LinkIcon size={17} weight="bold" /></button></div>;
}

export function LessonEditor({ lesson, modules, initialModuleId }: { lesson?: Lesson; modules: Module[]; initialModuleId?: string }) {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [description, setDescription] = useState(lesson?.description ?? "");
  const [moduleId, setModuleId] = useState(lesson?.module_id ?? initialModuleId ?? modules[0]?.id ?? "");
  const [status, setStatus] = useState<Lesson["status"]>(lesson?.status ?? "draft");
  const [minutes, setMinutes] = useState(String(lesson?.estimated_minutes ?? 10));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [blockMenuOpen, setBlockMenuOpen] = useState(false);
  const [blockPosition, setBlockPosition] = useState<FloatingPosition>({ top: 30, left: 12 });
  const [inlinePosition, setInlinePosition] = useState<FloatingPosition | null>(null);
  const editor = useEditor({ extensions: [StarterKit, Link.configure({ openOnClick: false }), Image], content: lesson?.content ?? { type: "doc", content: [] }, immediatelyRender: false });

  useEffect(() => {
    if (!editor) return;
    let frame = 0;
    const updateFloatingMenus = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        const block = getActiveBlockElement(editor);
        if (!canvas || !block) return;
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
    const url = window.prompt("URL del enlace");
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }

  function addImage() {
    const url = window.prompt("URL de la imagen");
    if (url) editor?.chain().focus().setImage({ src: url, alt: "Imagen de la lección" }).run();
  }

  async function save() {
    if (!editor || title.trim().length < 3 || !moduleId) {
      setError("Completa el título y selecciona un módulo.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = { title, description, status, estimated_minutes: Number(minutes), content: editor.getJSON() as TiptapDocument };
    try {
      await apiFetch<Lesson>(lesson ? `/admin/lessons/${lesson.id}` : `/admin/modules/${moduleId}/lessons`, { method: lesson ? "PATCH" : "POST", body: JSON.stringify(payload) });
      router.push(`/admin/modules/${lesson?.module_id ?? moduleId}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos guardar la lección.");
      setSaving(false);
    }
  }

  return <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]"><div className="space-y-5"><label className="field field-dark"><span>Título</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Cómo escribir logros cuantificables" /></label><label className="field field-dark"><span>Descripción</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Qué aprenderá el estudiante…" /></label>{!lesson && <label className="field field-dark"><span>Módulo</span><select value={moduleId} onChange={(event) => setModuleId(event.target.value)}>{modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}</select></label>}<div className="grid gap-5 sm:grid-cols-2"><label className="field field-dark"><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value as Lesson["status"])}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></label><label className="field field-dark"><span>Minutos estimados</span><input value={minutes} onChange={(event) => setMinutes(event.target.value)} type="number" min={1} max={240} /></label></div><button type="button" onClick={save} disabled={saving} className="button button-ink button-large">{saving ? "Guardando…" : "Guardar lección"}</button>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}</div><div className="editor-frame"><div ref={canvasRef} className="editor-canvas">{editor && <div className="editor-block-controls" style={{ top: blockPosition.top, left: blockPosition.left }}><BlockFormatMenu editor={editor} open={blockMenuOpen} onToggle={() => setBlockMenuOpen((current) => !current)} onClose={() => setBlockMenuOpen(false)} onAddImage={addImage} /></div>}{editor && inlinePosition && <InlineSelectionMenu editor={editor} position={inlinePosition} onAddLink={addLink} />}<EditorContent editor={editor} /></div></div></div>;
}
