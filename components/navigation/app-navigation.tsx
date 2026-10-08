"use client";

import {
  BookOpen,
  CaretLeft,
  CaretRight,
  ChartBar,
  Gear,
  House,
  List,
  NotePencil,
  UserCircle,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileAvatar } from "@/components/dashboard/profile-avatar";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { getNavigationItems, isNavigationItemActive } from "@/components/navigation/navigation-items";
import type { User } from "@/lib/types";

function navigationIcon(href: string) {
  if (href === "/dashboard") return <House size={18} weight="duotone" />;
  if (href === "/dashboard/profile") return <UserCircle size={18} weight="duotone" />;
  if (href === "/admin/modules") return <BookOpen size={18} weight="duotone" />;
  if (href === "/admin/lessons/new") return <NotePencil size={18} weight="duotone" />;
  if (href === "/admin/analytics") return <ChartBar size={18} weight="duotone" />;
  if (href === "/admin/users") return <UsersThree size={18} weight="duotone" />;
  if (href === "/admin/settings") return <Gear size={18} weight="duotone" />;
  return <UsersThree size={18} weight="duotone" />;
}

function roleLabel(role: User["role"]) {
  return role === "admin" ? "Administrador" : role === "trainer" ? "Trainer" : "Estudiante";
}

export function AppNavigation({
  user,
  collapsed,
  onToggle,
}: {
  user: User;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const items = getNavigationItems(user.role);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    mobileMenuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMobileMenu, mobileMenuOpen]);

  function navigationLinks(mobile = false) {
    return items.map((item, index) => {
      const active = isNavigationItemActive(pathname, item.href);
      const startsAdmin = item.section === "admin" && items[index - 1]?.section !== "admin";

      return (
        <span key={item.href} className={startsAdmin ? (mobile ? "mt-3 border-t border-twilight/10 pt-3" : "mt-4 border-t border-twilight/10 pt-4") : ""}>
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            title={!mobile && collapsed ? item.label : undefined}
            className={`app-nav-link ${active ? "is-active" : ""}`}
            onClick={mobile ? closeMobileMenu : undefined}
          >
            <span className="app-nav-icon" aria-hidden="true">
              {navigationIcon(item.href)}
            </span>
            <span className="app-nav-label">{item.label}</span>
          </Link>
        </span>
      );
    });
  }

  return (
    <>
      <aside className={`app-nav app-nav-desktop ${collapsed ? "is-collapsed" : ""}`} aria-label="Navegación de la aplicación">
        <div className="app-nav-inner">
          <div className="app-nav-brand-row">
            <BrandLockup compact />
            <button
              type="button"
              className="app-nav-toggle"
              aria-label={collapsed ? "Expandir menú" : "Encoger menú"}
              title={collapsed ? "Expandir menú" : "Encoger menú"}
              onClick={onToggle}
            >
              {collapsed ? <CaretLeft size={18} weight="bold" /> : <CaretRight size={18} weight="bold" />}
            </button>
          </div>

          <div className="app-nav-user">
            <Link href="/dashboard/profile" aria-label="Abrir mi perfil">
              <ProfileAvatar user={user} className="size-11 shrink-0 text-sm" />
            </Link>
            <div className="app-nav-user-copy min-w-0">
              <p className="truncate text-sm font-semibold text-twilight">{user.full_name}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-teal">{roleLabel(user.role)}</p>
            </div>
          </div>

          <nav className="app-nav-links" aria-label="Secciones">
            {navigationLinks()}
          </nav>

          <div className="app-nav-footer">
            <span title="Cerrar sesión">
              <LogoutButton compact={collapsed} />
            </span>
          </div>
        </div>
      </aside>

      <header className="app-nav-mobile">
        <div className="app-nav-mobile-inner">
          <BrandLockup compact />
          <button
            ref={mobileMenuButtonRef}
            type="button"
            className="icon-button ml-auto"
            aria-label={mobileMenuOpen ? "Cerrar navegación" : "Abrir navegación"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-app-navigation"
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
        {mobileMenuOpen ? (
          <>
            <button type="button" className="app-mobile-backdrop" aria-label="Cerrar menú" onClick={closeMobileMenu} />
            <aside id="mobile-app-navigation" className="app-mobile-drawer" role="dialog" aria-modal="true" aria-label="Navegación móvil">
              <div className="app-mobile-drawer-header">
                <p className="eyebrow text-teal">Navegación</p>
                <button type="button" className="icon-button" aria-label="Cerrar navegación" onClick={closeMobileMenu}>
                  <X size={20} />
                </button>
              </div>
              <div className="app-mobile-drawer-content">
                <div className="flex items-center gap-3 border-b border-twilight/10 pb-4">
                  <ProfileAvatar user={user} className="size-12 text-sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-twilight">{user.full_name}</p>
                    <p className="text-xs text-teal">{roleLabel(user.role)}</p>
                  </div>
                </div>
                <nav className="mt-4 grid gap-1" aria-label="Opciones móviles">
                  {navigationLinks(true)}
                </nav>
                <div className="mt-4 border-t border-twilight/10 pt-4">
                  <LogoutButton />
                </div>
              </div>
            </aside>
          </>
        ) : null}
      </header>
    </>
  );
}
