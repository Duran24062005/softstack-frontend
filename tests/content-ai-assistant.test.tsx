// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { suggestModuleContentMock, suggestLessonContentMock } = vi.hoisted(() => ({
  suggestModuleContentMock: vi.fn(),
  suggestLessonContentMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  suggestModuleContent: suggestModuleContentMock,
  suggestLessonContent: suggestLessonContentMock,
}));

import { ContentAiAssistant } from "@/components/admin/content-ai-assistant";
import { ToastProvider } from "@/components/ui/toast";

const suggestion = {
  target_type: "module" as const,
  mode: "create" as const,
  target_id: null,
  base_updated_at: null,
  provider: "fake",
  model: "fake-model",
  title: "Comunicación estratégica",
  description: "Una ruta para comunicar con claridad.",
  estimated_minutes: null,
  instructional_plan: {
    central_topic: "Comunicación",
    learning_objectives: ["Aplicar una estructura clara."],
    concept_map: { label: "Comunicación", children: [] },
    ordering_strategy: "simple_to_complex" as const,
    ordering_rationale: "La práctica avanza desde conceptos base hasta situaciones reales.",
    recommended_formats: ["text" as const],
    session_plan: [{ title: "Activación", minutes: 10, activity: "Conectar experiencias.", format: "activity" as const }],
    lesson_sequence: [],
  },
  content: null,
};

describe("ContentAiAssistant", () => {
  beforeEach(() => {
    suggestModuleContentMock.mockReset();
    suggestLessonContentMock.mockReset();
  });

  afterEach(() => cleanup());

  function renderAssistant(props: React.ComponentProps<typeof ContentAiAssistant>) {
    return render(<ToastProvider><ContentAiAssistant {...props} /></ToastProvider>);
  }

  it("generates a structured proposal and applies selected sections", async () => {
    const user = userEvent.setup();
    const onApply = vi.fn().mockResolvedValue(undefined);
    suggestModuleContentMock.mockResolvedValue(suggestion);
    renderAssistant({ target: "module", mode: "create", getPayload: () => ({ title: "Comunicación" }), onApply });

    await user.click(screen.getByRole("button", { name: /generar propuesta/i }));
    expect(await screen.findByText("Comunicación estratégica")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Propuesta generada");
    expect(screen.getByRole("status")).toHaveTextContent("Revísala y aplica solo las secciones que quieras conservar.");
    await user.click(screen.getByRole("button", { name: /aplicar selección/i }));
    expect(onApply).toHaveBeenCalledWith(suggestion, expect.arrayContaining(["objectives", "formats", "session_plan"]));
  });

  it("surfaces provider errors", async () => {
    const user = userEvent.setup();
    suggestLessonContentMock.mockRejectedValue(new Error("El proveedor no está disponible."));
    renderAssistant({ target: "lesson", mode: "create", getPayload: () => ({ title: "Lección" }), onApply: vi.fn() });

    await user.click(screen.getByRole("button", { name: /generar propuesta/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("El proveedor no está disponible.");
  });
});
