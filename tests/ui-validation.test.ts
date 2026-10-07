import { describe, expect, it } from "vitest";

import { parseHttpUrl } from "@/lib/ui-validation";

describe("external URL validation", () => {
  it("normalizes valid HTTP(S) URLs", () => {
    expect(parseHttpUrl(" https://example.com/recurso ")).toBe("https://example.com/recurso");
  });

  it("rejects empty, malformed and unsupported URL schemes", () => {
    expect(() => parseHttpUrl("")).toThrow("URL completa y válida");
    expect(() => parseHttpUrl("texto libre")).toThrow("URL completa y válida");
    expect(() => parseHttpUrl("javascript:alert(1)")).toThrow("http:// o https://");
  });
});
