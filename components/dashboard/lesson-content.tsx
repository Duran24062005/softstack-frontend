"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

import type { TiptapDocument } from "@/lib/types";

export function LessonContent({ content }: { content: TiptapDocument }) {
  const editor = useEditor({ extensions: [StarterKit, Link.configure({ openOnClick: true }), Image], content, editable: false, immediatelyRender: false });
  return <div className="tiptap-content"><EditorContent editor={editor} /></div>;
}
