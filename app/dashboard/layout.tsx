import { Suspense } from "react";

import { AppNavigation } from "@/components/navigation/app-navigation";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { requireSession } from "@/lib/server-api";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireSession();

  return (
    <div className="app-shell">
      <Suspense fallback={<div className="h-20 border-b border-twilight/10 bg-white" />}>
        <AppNavigation user={user} />
      </Suspense>
      <main>{children}</main>
      <footer className="app-footer">
        <BrandLockup compact />
        <p>Talento tech que transforma. Una lección y una oportunidad a la vez.</p>
        <span>Campuslands · SoftStack</span>
      </footer>
    </div>
  );
}
