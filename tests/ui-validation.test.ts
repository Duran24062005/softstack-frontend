import { describe, expect, it } from "vitest";

import { parseHttpUrl, parseOptionalProfileUrl } from "@/lib/ui-validation";

describe("external URL validation", () => {
  it("normalizes valid HTTP(S) URLs", () => {
    expect(parseHttpUrl(" https://example.com/recurso ")).toBe("https://example.com/recurso");
  });

  it("rejects empty, malformed and unsupported URL schemes", () => {
    expect(() => parseHttpUrl("")).toThrow("URL completa y válida");
    expect(() => parseHttpUrl("texto libre")).toThrow("URL completa y válida");
    expect(() => parseHttpUrl("javascript:alert(1)")).toThrow("http:// o https://");
  });

  it("accepts optional LinkedIn and GitHub profile URLs only on their domains", () => {
    expect(parseOptionalProfileUrl("https://www.linkedin.com/in/student", "linkedin")).toBe("https://www.linkedin.com/in/student");
    expect(parseOptionalProfileUrl("", "github")).toBeNull();
    expect(() => parseOptionalProfileUrl("https://example.com/student", "github")).toThrow("github.com");
  });
});
