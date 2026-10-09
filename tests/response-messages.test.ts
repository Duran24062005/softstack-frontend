import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";
import { mapApiErrorToToast } from "@/lib/response-messages";

describe("mapApiErrorToToast", () => {
  it.each([
    [401, "Sesión requerida", "Sesión expirada."],
    [403, "Acción no permitida", "No puedes aplicar esta sección."],
    [409, "El contenido cambió", "La versión base ya no coincide."],
    [503, "Servicio no disponible", "El proveedor no responde."],
  ])("maps HTTP %s into a user-facing toast", (status, title, message) => {
    expect(mapApiErrorToToast(new ApiError(message, status), "Fallback")).toEqual({
      tone: status === 409 ? "warning" : "error",
      title,
      message,
    });
  });

  it("uses a fallback for unknown thrown values", () => {
    expect(mapApiErrorToToast("unexpected", "Inténtalo de nuevo.")).toEqual({
      tone: "error",
      title: "No pudimos completar la acción",
      message: "Inténtalo de nuevo.",
    });
  });
});
