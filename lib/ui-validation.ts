export function parseHttpUrl(value: string): string {
  const normalized = value.trim();
  let parsed: URL;

  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error("Escribe una URL completa y válida.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("La URL debe comenzar por http:// o https://.");
  }

  return parsed.toString();
}

export function parseOptionalProfileUrl(value: string, provider: "linkedin" | "github"): string | null {
  if (!value.trim()) return null;
  const normalized = parseHttpUrl(value);
  const hostname = new URL(normalized).hostname.toLowerCase().replace(/\.$/, "");
  const domain = `${provider}.com`;
  if (hostname !== domain && !hostname.endsWith(`.${domain}`)) {
    throw new Error(`La URL de ${provider} debe pertenecer a ${domain}.`);
  }
  return normalized;
}
