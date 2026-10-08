// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { pathnameMock, pushMock } = vi.hoisted(() => ({
  pathnameMock: vi.fn(() => "/dashboard"),
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: pathnameMock,
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, onClick, ...props }: { href: string; children: ReactNode; onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void }) => (
    <a href={href} {...props} onClick={(event) => { event.preventDefault(); onClick?.(event); }}>{children}</a>
  ),
}));

vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));

import { AppNavigation } from "@/components/navigation/app-navigation";
import { DashboardShell } from "@/components/navigation/dashboard-shell";
import type { User, UserRole } from "@/lib/types";

const user: User = {
  id: "user-1",
  full_name: "Alex García",
  email: "alex@example.com",
  role: "user",
  is_active: true,
  account_status: "active",
  email_verified: true,
  has_profile_photo: false,
  created_at: "2026-10-08T00:00:00Z",
};

function userWithRole(role: UserRole): User {
  return { ...user, role };
}

afterEach(() => {
  cleanup();
  document.body.style.overflow = "";
  pathnameMock.mockReset();
  pathnameMock.mockReturnValue("/dashboard");
  pushMock.mockReset();
});

describe("AppNavigation", () => {
  beforeEach(() => pathnameMock.mockReturnValue("/dashboard"));

  it.each([
    ["user", ["Mi ruta", "Mi perfil"], ["Módulos", "Usuarios"]],
    ["trainer", ["Mi ruta", "Mi perfil", "Módulos", "Editor", "Resultados"], ["Usuarios", "Configuración"]],
    ["admin", ["Mi ruta", "Mi perfil", "Módulos", "Editor", "Resultados", "Usuarios", "Configuración", "Trainers"], []],
  ] as const)("renders the correct navigation options for %s", (role, visible, hidden) => {
    render(<AppNavigation user={userWithRole(role)} collapsed={false} onToggle={vi.fn()} />);
    const navigation = screen.getByRole("navigation", { name: "Secciones" });

    for (const label of visible) expect(within(navigation).getByRole("link", { name: label })).toBeInTheDocument();
    for (const label of hidden) expect(within(navigation).queryByRole("link", { name: label })).not.toBeInTheDocument();
  });

  it("marks nested routes as active and exposes the collapse control", async () => {
    pathnameMock.mockReturnValue("/admin/modules/module-1");
    const onToggle = vi.fn();
    const { rerender } = render(<AppNavigation user={userWithRole("admin")} collapsed={false} onToggle={onToggle} />);
    const navigation = screen.getByRole("navigation", { name: "Secciones" });

    expect(within(navigation).getByRole("link", { name: "Módulos" })).toHaveAttribute("aria-current", "page");
    await userEvent.setup().click(screen.getByRole("button", { name: "Encoger menú" }));
    expect(onToggle).toHaveBeenCalledOnce();

    rerender(<AppNavigation user={userWithRole("admin")} collapsed onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: "Expandir menú" })).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "Usuarios" })).toHaveAttribute("title", "Usuarios");
  });

  it("opens the right drawer, locks scroll and closes with Escape or route selection", async () => {
    const userEvents = userEvent.setup();
    render(<AppNavigation user={userWithRole("user")} collapsed={false} onToggle={vi.fn()} />);
    const openButton = screen.getByRole("button", { name: "Abrir navegación" });

    await userEvents.click(openButton);
    expect(screen.getByRole("dialog", { name: "Navegación móvil" })).toBeInTheDocument();
    expect(openButton).toHaveAttribute("aria-expanded", "true");
    expect(document.body.style.overflow).toBe("hidden");

    await userEvents.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Navegación móvil" })).not.toBeInTheDocument();
    expect(openButton).toHaveFocus();
    expect(document.body.style.overflow).toBe("");

    await userEvents.click(openButton);
    const drawer = screen.getByRole("dialog", { name: "Navegación móvil" });
    await userEvents.click(within(drawer).getByRole("link", { name: "Mi perfil" }));
    expect(screen.queryByRole("dialog", { name: "Navegación móvil" })).not.toBeInTheDocument();
  });
});

describe("DashboardShell", () => {
  it("renders navigation, content and footer spaces together", async () => {
    const userEvents = userEvent.setup();
    render(
      <DashboardShell user={userWithRole("admin")}>
        <section data-testid="page-content">Contenido de la página</section>
      </DashboardShell>,
    );

    expect(screen.getByRole("complementary", { name: "Navegación de la aplicación" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toContainElement(screen.getByTestId("page-content"));
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Campuslands · SoftStack");
    expect(screen.getAllByRole("link", { name: "Campuslands SoftStack, ir al inicio" })).not.toHaveLength(0);

    await userEvents.click(screen.getByRole("button", { name: "Encoger menú" }));
    expect(screen.getByRole("button", { name: "Expandir menú" })).toBeInTheDocument();
  });
});
