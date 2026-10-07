"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { ProfileAvatar } from "@/components/dashboard/profile-avatar";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { getNavigationItems, isNavigationItemActive } from "@/components/navigation/navigation-items";
import type { User } from "@/lib/types";

export function AppNavigation({ user }: { user: User }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = getNavigationItems(user.role);

  function navigationLinks(mobile = false) {
    return items.map((item, index) => {
      const active = isNavigationItemActive(pathname, item.href);
      const startsAdmin = item.section === "admin" && items[index - 1]?.section !== "admin";
      return (
        <span key={item.href} className={startsAdmin ? (mobile ? "mt-3 border-t border-twilight/10 pt-3" : "ml-2 border-l border-twilight/15 pl-6") : ""}>
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`app-nav-link ${active ? "is-active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        </span>
      );
    });
  }

  return (
    <header className="app-nav sticky top-0 z-40">
      <div className="app-nav-inner">
        <BrandLockup compact />
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Navegación de la aplicación">
          {navigationLinks()}
        </nav>
        <div className="ml-auto hidden items-center gap-4 lg:flex">
          <span className="text-right">
            <span className="block text-xs font-semibold text-twilight">{user.full_name}</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-teal">
              {user.role === "admin" ? "Administrador" : user.role === "trainer" ? "Trainer" : "Estudiante"}
            </span>
          </span>
          <Link href="/dashboard/profile" aria-label="Abrir mi perfil">
            <ProfileAvatar user={user} className="size-11 text-sm" />
          </Link>
          <LogoutButton compact />
        </div>
        <button
          type="button"
          className="icon-button ml-auto lg:hidden"
          aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
          aria-expanded={menuOpen}
          aria-controls="mobile-app-navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={20} /> : <List size={20} />}
        </button>
      </div>
      {menuOpen ? (
        <div id="mobile-app-navigation" className="app-mobile-menu lg:hidden">
          <div className="flex items-center gap-3 border-b border-twilight/10 pb-4">
            <ProfileAvatar user={user} className="size-12 text-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-twilight">{user.full_name}</p>
              <p className="text-xs text-teal">{user.role === "admin" ? "Administrador" : user.role === "trainer" ? "Trainer" : "Estudiante"}</p>
            </div>
          </div>
          <nav className="mt-4 grid gap-1" aria-label="Navegación móvil">
            {navigationLinks(true)}
          </nav>
          <div className="mt-4 border-t border-twilight/10 pt-4">
            <LogoutButton />
          </div>
        </div>
      ) : null}
    </header>
  );
}
