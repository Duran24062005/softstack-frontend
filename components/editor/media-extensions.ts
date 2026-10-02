import { Node, mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";

export const ContentImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaPathname: { default: null },
      mediaContentType: { default: null },
      mediaSize: { default: null },
    };
  },
});

export const ContentVideo = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      mediaPathname: { default: null },
      mediaContentType: { default: null },
      mediaSize: { default: null },
      controls: { default: true },
      poster: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "video" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, { controls: true, preload: "metadata" })];
  },
});

export function createContentExtensions({ openOnClick = false }: { openOnClick?: boolean } = {}) {
  return [StarterKit, Link.configure({ openOnClick }), ContentImage, ContentVideo];
}
