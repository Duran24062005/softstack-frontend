// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AcademicProfileForm } from "@/components/dashboard/academic-profile-form";
import { AuthForm } from "@/components/auth/auth-form";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { ApiError, apiFetch } from "@/lib/api";

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
  ApiError: class extends Error {
    constructor(message: string, public readonly status: number, public readonly code?: string) {
      super(message);
    }
  },
}));
const pushMock = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
}));

const apiFetchMock = vi.mocked(apiFetch);

describe("student academic profile forms", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends academic data as part of public student registration", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValue({ verification_required: true });
    render(<AuthForm mode="register" />);

    await user.type(screen.getByLabelText("Nombre completo"), "Alex Rivera");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "strong-password");
    fireEvent.change(screen.getByLabelText("Año de inicio"), { target: { value: "2024" } });
    await user.type(screen.getByLabelText("Grupo"), "Grupo A");
    await user.type(screen.getByLabelText("Sede"), "Bucaramanga");
    await user.type(screen.getByLabelText(/LinkedIn/), "https://www.linkedin.com/in/alex");
    await user.click(screen.getByRole("button", { name: /Crear mi cuenta/ }));

    await waitFor(() => expect(apiFetchMock).toHaveBeenCalledWith("/auth/register", expect.objectContaining({ method: "POST" })));
    const request = JSON.parse(apiFetchMock.mock.calls[0][1]?.body as string);
    expect(request.academic_profile).toEqual({
      start_year: 2024,
      group_name: "Grupo A",
      campus_name: "Bucaramanga",
      linkedin_url: "https://www.linkedin.com/in/alex",
      github_url: null,
    });
  });

  it("saves one final group and campus in the independent profile resource", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValue({
      start_year: 2024,
      group_name: "Grupo A",
      campus_name: "Bucaramanga",
      linkedin_url: null,
      github_url: null,
    });
    render(<AcademicProfileForm endpoint="/auth/me/academic-profile" initialProfile={null} />);

    fireEvent.change(screen.getByLabelText("Año de inicio"), { target: { value: "2024" } });
    await user.type(screen.getByLabelText("Grupo"), "Grupo A");
    await user.type(screen.getByLabelText("Sede"), "Bucaramanga");
    await user.click(screen.getByRole("button", { name: /Guardar perfil/ }));

    expect(screen.queryByRole("button", { name: /Agregar grupo anterior/ })).not.toBeInTheDocument();

    await waitFor(() => expect(apiFetchMock).toHaveBeenCalledWith("/auth/me/academic-profile", expect.objectContaining({ method: "PUT" })));
    const request = JSON.parse(apiFetchMock.mock.calls[0][1]?.body as string);
    expect(request).toEqual({
      start_year: 2024,
      group_name: "Grupo A",
      campus_name: "Bucaramanga",
      linkedin_url: null,
      github_url: null,
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Perfil académico actualizado.");
  });

  it("redirects an unverified login to the code form", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockRejectedValue(new ApiError("Email address must be verified before signing in", 403, "EMAIL_NOT_VERIFIED"));
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "strong-password");
    await user.click(screen.getByRole("button", { name: /Entrar a mi espacio/ }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/verify-email?pending=1&email=alex%40example.com"));
  });

  it("reports invalid optional profile URLs before registering", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="register" />);

    await user.type(screen.getByLabelText("Nombre completo"), "Alex Rivera");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "strong-password");
    fireEvent.change(screen.getByLabelText("Año de inicio"), { target: { value: "2024" } });
    await user.type(screen.getByLabelText("Grupo"), "Grupo A");
    await user.type(screen.getByLabelText("Sede"), "Bucaramanga");
    await user.type(screen.getByLabelText(/LinkedIn/), "https://example.com/not-linkedin");
    await user.click(screen.getByRole("button", { name: /Crear mi cuenta/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("La URL de linkedin debe pertenecer a linkedin.com.");
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("blocks incomplete registration data before making a request", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="register" />);

    await user.type(screen.getByLabelText("Nombre completo"), "A");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "strong-password");
    fireEvent.submit(screen.getByRole("button", { name: /Crear mi cuenta/ }).closest("form")!);
    expect(await screen.findByRole("alert")).toHaveTextContent("Escribe tu nombre completo.");
    expect(apiFetchMock).not.toHaveBeenCalled();

    cleanup();
    render(<AuthForm mode="register" />);
    await user.type(screen.getByLabelText("Nombre completo"), "Alex Rivera");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "strong-password");
    fireEvent.change(screen.getByLabelText("Año de inicio"), { target: { value: "1899" } });
    fireEvent.submit(screen.getByRole("button", { name: /Crear mi cuenta/ }).closest("form")!);
    expect(await screen.findByRole("alert")).toHaveTextContent("El año de inicio debe estar entre");

    cleanup();
    render(<AuthForm mode="register" />);
    await user.type(screen.getByLabelText("Nombre completo"), "Alex Rivera");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "strong-password");
    fireEvent.change(screen.getByLabelText("Año de inicio"), { target: { value: "2024" } });
    await user.type(screen.getByLabelText("Sede"), "Bucaramanga");
    fireEvent.submit(screen.getByRole("button", { name: /Crear mi cuenta/ }).closest("form")!);
    expect(await screen.findByRole("alert")).toHaveTextContent("Completa tu grupo y sede de formación.");
  });

  it("redirects successful login and reports generic login failures", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValueOnce({ user: { id: "student-1" } });
    render(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "strong-password");
    await user.click(screen.getByRole("button", { name: /Entrar a mi espacio/ }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));

    cleanup();
    vi.clearAllMocks();
    apiFetchMock.mockRejectedValueOnce("network failure");
    render(<AuthForm mode="login" />);
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "strong-password");
    await user.click(screen.getByRole("button", { name: /Entrar a mi espacio/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos iniciar tu sesión.");
  });

  it("verifies only the six-digit code, strips non-digits and clears it after success", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockResolvedValue({ message: "Email verificado correctamente." });
    render(<VerifyEmailForm pendingEmail="alex@example.com" />);

    const codeInput = screen.getByLabelText("Código de verificación");
    await user.type(codeInput, "12abc3456789");
    expect(codeInput).toHaveValue("123456");
    await user.click(screen.getByRole("button", { name: "Verificar código" }));

    await waitFor(() => expect(apiFetchMock).toHaveBeenCalledWith("/auth/verify-email-code", expect.objectContaining({ method: "POST" })));
    expect(JSON.parse(apiFetchMock.mock.calls[0][1]?.body as string)).toEqual({ email: "alex@example.com", code: "123456" });
    expect(codeInput).toHaveValue("");
    expect(await screen.findByRole("status")).toHaveTextContent("Email verificado correctamente.");
  });

  it("confirms an email link and reports invalid links", async () => {
    apiFetchMock.mockResolvedValueOnce({ message: "Email verificado correctamente." });
    const { unmount } = render(<VerifyEmailForm token="raw token" />);

    await waitFor(() => expect(apiFetchMock).toHaveBeenCalledWith("/auth/verify-email?token=raw%20token"));
    expect(await screen.findByRole("status")).toHaveTextContent("Email verificado correctamente.");
    expect(screen.queryByLabelText("Código de verificación")).not.toBeInTheDocument();

    unmount();
    apiFetchMock.mockRejectedValueOnce(new Error("El enlace no es válido."));
    render(<VerifyEmailForm token="expired-token" />);

    expect(await screen.findByRole("alert")).toHaveTextContent("El enlace no es válido.");

    cleanup();
    apiFetchMock.mockRejectedValueOnce("invalid link");
    render(<VerifyEmailForm token="invalid-token" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("El enlace no es válido.");
  });

  it("shows code errors and can resend a fresh verification message", async () => {
    const user = userEvent.setup();
    apiFetchMock
      .mockRejectedValueOnce(new ApiError("El código no es válido o ya venció.", 400))
      .mockResolvedValueOnce({ message: "Si la cuenta puede recibir un correo, enviaremos un nuevo enlace y código." });
    render(<VerifyEmailForm pendingEmail="alex@example.com" />);

    await user.type(screen.getByLabelText("Código de verificación"), "123456");
    await user.click(screen.getByRole("button", { name: "Verificar código" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("El código no es válido o ya venció.");

    await user.click(screen.getByRole("button", { name: "Reenviar código" }));
    await waitFor(() => expect(apiFetchMock).toHaveBeenLastCalledWith("/auth/resend-verification", expect.objectContaining({ method: "POST" })));
    expect(JSON.parse(apiFetchMock.mock.calls[1][1]?.body as string)).toEqual({ email: "alex@example.com" });
    expect(await screen.findByRole("status")).toHaveTextContent("enviaremos un nuevo enlace y código");
  });

  it("shows a generic resend error when the client rejects with a non-Error value", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockRejectedValueOnce("network failure");
    render(<VerifyEmailForm pendingEmail="alex@example.com" />);

    await user.click(screen.getByRole("button", { name: "Reenviar código" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos reenviar el código.");
  });

  it("shows a generic code error when the client rejects with a non-Error value", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockRejectedValueOnce("invalid code");
    render(<VerifyEmailForm pendingEmail="alex@example.com" />);

    await user.type(screen.getByLabelText("Código de verificación"), "123456");
    await user.click(screen.getByRole("button", { name: "Verificar código" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("El código no es válido o ya venció.");
  });
});
