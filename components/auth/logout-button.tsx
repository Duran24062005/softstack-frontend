"use client";

import { SignOut } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiFetch } from "@/lib/api";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    try {
      await apiFetch<void>("/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }
  return <button type="button" onClick={logout} disabled={loading} aria-label={compact ? "Cerrar sesión" : undefined} className="flex items-center gap-2 text-sm font-medium text-twilight/52 transition-colors hover:text-teal"><SignOut size={17} />{compact ? null : loading ? "Saliendo…" : "Cerrar sesión"}</button>;
}
