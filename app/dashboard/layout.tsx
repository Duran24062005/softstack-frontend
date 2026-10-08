import { Suspense } from "react";

import { DashboardShell } from "@/components/navigation/dashboard-shell";
import { requireSession } from "@/lib/server-api";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireSession();

  return (
    <Suspense fallback={<div className="app-shell min-h-screen bg-canvas" />}>
      <DashboardShell user={user}>
        {children}
      </DashboardShell>
      </Suspense>
  );
}
