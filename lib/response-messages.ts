export type ApiErrorToast = {
  tone: "error" | "warning";
  title: string;
  message: string;
};

function hasHttpStatus(error: unknown): error is { status: number; message?: string } {
  return typeof error === "object"
    && error !== null
    && "status" in error
    && typeof error.status === "number";
}

export function mapApiErrorToToast(error: unknown, fallback: string): ApiErrorToast {
  if (!hasHttpStatus(error)) {
    return {
      tone: "error",
      title: "No pudimos completar la acción",
      message: error instanceof Error && error.message ? error.message : fallback,
    };
  }

  if (error.status === 401) {
    return { tone: "error", title: "Sesión requerida", message: error.message || "Vuelve a iniciar sesión para continuar." };
  }

  if (error.status === 403) {
    return { tone: "error", title: "Acción no permitida", message: error.message || "No tienes permisos para realizar esta acción." };
  }

  if (error.status === 409) {
    return { tone: "warning", title: "El contenido cambió", message: error.message || "Regenera la propuesta antes de aplicarla." };
  }

  if (error.status >= 500) {
    return { tone: "error", title: "Servicio no disponible", message: error.message || "Inténtalo de nuevo en unos instantes." };
  }

  return { tone: "error", title: "No pudimos completar la acción", message: error.message || fallback };
}
