"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";

import { AppNavigation } from "@/components/navigation/app-navigation";
import { BrandLockup } from "@/components/ui/brand-lockup";
import type { User } from "@/lib/types";

export function DashboardShell({ user, children }: { user: User; children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const shellStyle = {
    "--app-nav-width": sidebarCollapsed ? "5.75rem" : "18rem",
  } as CSSProperties;

  return (
    <div className="app-shell" style={shellStyle}>
      <AppNavigation user={user} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} />
      <main>{children}</main>
      <footer className="app-footer">
        <BrandLockup compact />
        <p>Talento tech que transforma. Una lección y una oportunidad a la vez.</p>
        <span>Campuslands · SoftStack</span>
      </footer>
    </div>
  );
}
