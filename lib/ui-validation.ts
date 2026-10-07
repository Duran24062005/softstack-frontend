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
