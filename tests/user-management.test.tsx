// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { apiFetchMock } = vi.hoisted(() => ({ apiFetchMock: vi.fn() }));

vi.mock("@/lib/api", () => ({ apiFetch: apiFetchMock }));

import { UserManagement } from "@/components/admin/user-management";
import type { AdminUser } from "@/lib/types";

const users: AdminUser[] = [
  {
    id: "admin-1",
    full_name: "Administradora",
    email: "admin@example.com",
    role: "admin",
    is_active: true,
    account_status: "active",
    email_verified: true,
    has_profile_photo: false,
    created_at: "2026-10-01T00:00:00Z",
    status_changed_at: null,
    status_changed_by: null,
  },
  {
    id: "student-1",
    full_name: "Estudiante Pendiente",
    email: "student@example.com",
    role: "user",
    is_active: false,
    account_status: "pending",
    email_verified: true,
    has_profile_photo: false,
    created_at: "2026-10-02T00:00:00Z",
    status_changed_at: null,
    status_changed_by: null,
  },
  {
    id: "trainer-1",
    full_name: "Trainer Inactivo",
    email: "trainer@example.com",
    role: "trainer",
    is_active: false,
    account_status: "inactive",
    email_verified: true,
    has_profile_photo: false,
    created_at: "2026-10-03T00:00:00Z",
    status_changed_at: "2026-10-04T00:00:00Z",
    status_changed_by: "admin-1",
  },
];

afterEach(() => {
  cleanup();
});

describe("UserManagement", () => {
  beforeEach(() => apiFetchMock.mockReset());

  it("shows roles, statuses and filters the directory", async () => {
    const user = userEvent.setup();
    render(<UserManagement initialUsers={users} />);

    expect(screen.getByText("Administrador")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Inactiva")).toBeInTheDocument();
    expect(screen.getByText("3 de 3 cuentas")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Rol"), "trainer");
    expect(screen.getByText("Trainer Inactivo")).toBeInTheDocument();
    expect(screen.queryByText("Estudiante Pendiente")).not.toBeInTheDocument();
    expect(screen.getByText("1 de 3 cuentas")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Estado"), "rejected");
    expect(screen.getByText("No hay cuentas que coincidan con estos filtros.")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Estado"), "all");
    await user.clear(screen.getByLabelText("Buscar"));
    await user.type(screen.getByLabelText("Buscar"), "no existe");
    expect(screen.getByText("No hay cuentas que coincidan con estos filtros.")).toBeInTheDocument();
  });

  it("updates a pending account and keeps administrators protected", async () => {
    const user = userEvent.setup();
    const approved = { ...users[1], account_status: "active" as const, is_active: true, status_changed_at: "2026-10-08T00:00:00Z", status_changed_by: "admin-1" };
    apiFetchMock.mockResolvedValueOnce(approved);
    render(<UserManagement initialUsers={users} />);

    expect(screen.getByText("Cuenta protegida")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Aprobar" }));

    await waitFor(() => expect(screen.getByText("Estudiante Pendiente: cuenta activa.")).toBeInTheDocument());
    expect(screen.getAllByText("Activa").length).toBeGreaterThan(0);
    expect(apiFetchMock).toHaveBeenCalledWith("/admin/users/student-1/status", expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ account_status: "active" }),
    }));
  });

  it("shows backend errors for status changes", async () => {
    const user = userEvent.setup();
    apiFetchMock.mockRejectedValueOnce(new Error("Transición no permitida"));
    render(<UserManagement initialUsers={users} />);

    await user.click(screen.getByRole("button", { name: "Aprobar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Transición no permitida");

    apiFetchMock.mockRejectedValueOnce("fallo no estructurado");
    await user.click(screen.getByRole("button", { name: "Aprobar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos actualizar el estado de la cuenta.");
  });

  it("supports rejection, reopening, inactivation and reactivation actions", async () => {
    const user = userEvent.setup();
    const rejected = { ...users[1], account_status: "rejected" as const };
    const reopened = { ...users[1], account_status: "pending" as const };
    const active = { ...users[1], account_status: "active" as const, is_active: true };
    const inactive = { ...users[1], account_status: "inactive" as const, is_active: false };
    apiFetchMock
      .mockResolvedValueOnce(rejected)
      .mockResolvedValueOnce(reopened)
      .mockResolvedValueOnce(active)
      .mockResolvedValueOnce(inactive)
      .mockResolvedValueOnce(active);
    render(<UserManagement initialUsers={users} />);

    await user.click(screen.getByRole("button", { name: "Rechazar" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Reabrir" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Reabrir" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Aprobar" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Aprobar" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Inactivar" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Inactivar" }));
    await waitFor(() => expect(screen.getAllByRole("button", { name: "Reactivar" }).length).toBeGreaterThan(0));
    await user.click(screen.getAllByRole("button", { name: "Reactivar" })[0]);
    await waitFor(() => expect(screen.getByRole("button", { name: "Inactivar" })).toBeInTheDocument());
  });
});
