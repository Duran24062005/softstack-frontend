import type { UserRole } from "@/lib/types";

export type NavigationItem = {
  href: string;
  label: string;
  section: "learning" | "admin";
};

const learningItems: NavigationItem[] = [
  { href: "/dashboard", label: "Mi ruta", section: "learning" },
  { href: "/dashboard/profile", label: "Mi perfil", section: "learning" },
];

const adminItems: NavigationItem[] = [
  { href: "/admin/modules", label: "Módulos", section: "admin" },
  { href: "/admin/lessons/new", label: "Editor", section: "admin" },
  { href: "/admin/analytics", label: "Resultados", section: "admin" },
];

const ownerItems: NavigationItem[] = [
  { href: "/admin/users", label: "Usuarios", section: "admin" },
  { href: "/admin/settings", label: "Configuración", section: "admin" },
  { href: "/admin/trainers", label: "Trainers", section: "admin" },
];

export function getNavigationItems(role: UserRole): NavigationItem[] {
  if (role === "admin") return [...learningItems, ...adminItems, ...ownerItems];
  return role === "trainer" ? [...learningItems, ...adminItems] : learningItems;
}

export function isNavigationItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href || pathname.startsWith("/dashboard/modules/") || pathname.startsWith("/dashboard/lessons/");
  }
  if (href === "/admin/lessons/new") {
    return pathname.startsWith("/admin/lessons/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
