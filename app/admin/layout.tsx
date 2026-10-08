import { Suspense } from "react";

import { DashboardShell } from "@/components/navigation/dashboard-shell";
import { requireEducator } from "@/lib/server-api";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireEducator();

  return (
    <Suspense fallback={<div className="app-shell min-h-screen bg-canvas" />}>
      <DashboardShell user={user}>
        {children}
      </DashboardShell>
    </Suspense>
  );
}
