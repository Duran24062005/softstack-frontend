// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ToastProvider, useToast } from "@/components/ui/toast";

function ToastTrigger() {
  const { showToast } = useToast();

  return <button type="button" onClick={() => showToast({ tone: "success", title: "Guardado", message: "La respuesta fue aplicada." })}>Mostrar toast</button>;
}

describe("ToastProvider", () => {
  afterEach(() => vi.useRealTimers());

  it("shows a centered success response and allows dismissing it", async () => {
    const user = userEvent.setup();
    render(<ToastProvider><ToastTrigger /></ToastProvider>);

    await user.click(screen.getByRole("button", { name: "Mostrar toast" }));

    expect(screen.getByRole("status")).toHaveTextContent("La respuesta fue aplicada.");
    await user.click(screen.getByRole("button", { name: "Cerrar notificación" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("maps error responses to an assertive notification and dismisses them automatically", async () => {
    vi.useFakeTimers();

    function ErrorTrigger() {
      const { showToast } = useToast();
      return <button type="button" onClick={() => showToast({ tone: "error", message: "No se pudo guardar." })}>Mostrar error</button>;
    }

    render(<ToastProvider><ErrorTrigger /></ToastProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Mostrar error" }));
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar.");

    act(() => vi.advanceTimersByTime(5_000));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
