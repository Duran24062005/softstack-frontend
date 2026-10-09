// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { Editor } from "@tiptap/core";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { BlockFormatMenu } from "@/components/editor/lesson-editor";
import { createContentExtensions } from "@/components/editor/media-extensions";
import type { TiptapDocument } from "@/lib/types";

const emptyDocument: TiptapDocument = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Elemento" }] }] };

function createEditor(content: TiptapDocument = emptyDocument) {
  return new Editor({ extensions: createContentExtensions(), content });
}

describe("Tiptap lesson editor lists", () => {
  afterEach(() => cleanup());

  it("registers and preserves unordered and ordered list nodes", () => {
    const editor = createEditor({
      type: "doc",
      content: [
        { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Punto" }] }] }] },
        { type: "orderedList", attrs: { start: 1 }, content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Paso" }] }] }] },
      ],
    });

    expect(editor.schema.nodes.bulletList).toBeDefined();
    expect(editor.schema.nodes.orderedList).toBeDefined();
    expect(editor.getJSON()).toMatchObject({ content: [{ type: "bulletList" }, { type: "orderedList" }] });
    expect(editor.getHTML()).toContain("<ul>");
    expect(editor.getHTML()).toContain("<ol");
    editor.destroy();
  });

  it("converts the active paragraph into an unordered list and toggles it off", () => {
    const editor = createEditor();

    expect(editor.commands.toggleBulletList()).toBe(true);
    expect(editor.getJSON().content?.[0]?.type).toBe("bulletList");
    expect(editor.commands.toggleBulletList()).toBe(true);
    expect(editor.getJSON().content?.[0]?.type).toBe("paragraph");
    editor.destroy();
  });

  it("converts the active paragraph into an ordered list and keeps list items editable", () => {
    const editor = createEditor();

    expect(editor.commands.toggleOrderedList()).toBe(true);
    expect(editor.getJSON().content?.[0]?.type).toBe("orderedList");
    expect(editor.getJSON().content?.[0]?.content?.[0]?.type).toBe("listItem");
    expect(editor.commands.splitListItem("listItem")).toBe(true);
    expect(editor.getJSON().content?.[0]?.content).toHaveLength(2);
    editor.destroy();
  });

  it("wires the visible menu actions to real Tiptap list commands", async () => {
    const user = userEvent.setup();
    const editor = createEditor();
    render(<BlockFormatMenu editor={editor} open onToggle={() => undefined} onClose={() => undefined} onAddMedia={() => undefined} />);

    await user.click(screen.getByRole("menuitem", { name: "Lista" }));
    expect(editor.getJSON().content?.[0]?.type).toBe("bulletList");

    editor.commands.setContent(emptyDocument);
    await user.click(screen.getByRole("menuitem", { name: "Lista numerada" }));
    expect(editor.getJSON().content?.[0]?.type).toBe("orderedList");
    editor.destroy();
  });

  it("restores visible markers after Tailwind preflight resets list styles", () => {
    const stylesheet = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

    expect(stylesheet).toMatch(/\.tiptap-content ul,[\s\S]*?list-style-type: disc;/);
    expect(stylesheet).toMatch(/\.tiptap-content ol,[\s\S]*?list-style-type: decimal;/);
  });
});
