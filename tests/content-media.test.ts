import { beforeEach, describe, expect, it, vi } from "vitest";

const { uploadMock, apiFetchMock } = vi.hoisted(() => ({
  uploadMock: vi.fn(),
  apiFetchMock: vi.fn(),
}));

vi.mock("@vercel/blob/client", () => ({ upload: uploadMock }));
vi.mock("@/lib/api", () => ({ apiFetch: apiFetchMock }));

import {
  collectMediaPathnames,
  deleteContentMedia,
  getMediaKind,
  importContentMedia,
  uploadContentMedia,
} from "@/lib/content-media";
import { createContentExtensions } from "@/components/editor/media-extensions";

const imageReference = {
  url: "https://store.public.blob.vercel-storage.com/content-media/image.png",
  pathname: "content-media/image.png",
  content_type: "image/png",
  size: 128,
};

describe("content media helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("classifies supported image and video MIME types", () => {
    expect(getMediaKind("image/avif")).toBe("image");
    expect(getMediaKind("video/quicktime")).toBe("video");
    expect(getMediaKind("application/pdf")).toBeNull();
  });

  it("rejects unsupported or oversized files before contacting Blob", async () => {
    const unsupported = new File(["file"], "document.pdf", { type: "application/pdf" });
    const oversized = new File([new Uint8Array(10_000_001)], "large.png", { type: "image/png" });

    await expect(uploadContentMedia(unsupported)).rejects.toThrow("Solo aceptamos");
    await expect(uploadContentMedia(oversized)).rejects.toThrow("10 MB");
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("uploads with a type-specific token payload and reports progress", async () => {
    const progress: number[] = [];
    const file = new File(["image"], "mi portada.png", { type: "image/png" });
    uploadMock.mockImplementation(async (_pathname, _body, options) => {
      options.onUploadProgress({ percentage: 64 });
      return imageReference;
    });

    const result = await uploadContentMedia(file, (percentage) => progress.push(percentage));
    const [, , options] = uploadMock.mock.calls[0];

    expect(result).toMatchObject({ ...imageReference, size: file.size });
    expect(progress).toEqual([64]);
    expect(options.access).toBe("public");
    expect(options.contentType).toBe("image/png");
    expect(JSON.parse(options.clientPayload)).toMatchObject({ kind: "image", contentType: "image/png", size: file.size });
  });

  it("imports an external URL through the backend instead of persisting it directly", async () => {
    apiFetchMock.mockResolvedValue(imageReference);

    const result = await importContentMedia("https://example.com/image.png", "image");

    expect(result).toEqual(imageReference);
    expect(apiFetchMock).toHaveBeenCalledWith("/admin/content-media/import", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ source_url: "https://example.com/image.png", kind: "image" }),
    }));
  });

  it("deletes media by pathname through the backend", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await deleteContentMedia({ pathname: imageReference.pathname });

    expect(apiFetchMock).toHaveBeenCalledWith("/admin/content-media", {
      method: "DELETE",
      body: JSON.stringify({ pathname: imageReference.pathname }),
    });
  });

  it("collects image and video pathnames recursively from nested Tiptap nodes", () => {
    const document = {
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [{ type: "paragraph", content: [{ type: "image", attrs: { mediaPathname: imageReference.pathname } }] }],
        },
        {
          type: "bulletList",
          content: [{ type: "listItem", content: [{ type: "video", attrs: { mediaPathname: "content-media/video.mp4" } }] }],
        },
      ],
    };

    expect(collectMediaPathnames(document)).toEqual(new Set([imageReference.pathname, "content-media/video.mp4"]));
  });

  it("registers shared image and video extensions for editor and reader", () => {
    const extensions = createContentExtensions({ openOnClick: true });
    const starterKit = extensions.find((extension) => extension.name === "starterKit");

    expect(extensions.map((extension) => extension.name)).toEqual(expect.arrayContaining(["image", "video"]));
    expect(extensions.map((extension) => extension.name)).not.toContain("link");
    expect(starterKit?.options.link).toMatchObject({ openOnClick: true });
  });
});
