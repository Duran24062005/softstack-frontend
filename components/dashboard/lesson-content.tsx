"use client";

import { useEditor, EditorContent } from "@tiptap/react";

import type { TiptapDocument } from "@/lib/types";
import { createContentExtensions } from "@/components/editor/media-extensions";

export function LessonContent({ content }: { content: TiptapDocument }) {
  const editor = useEditor({ extensions: createContentExtensions({ openOnClick: true }), content, editable: false, immediatelyRender: false });
  return <div className="tiptap-content"><EditorContent editor={editor} /></div>;
}
