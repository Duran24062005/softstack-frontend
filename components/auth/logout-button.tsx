"use client";

import { SignOut } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiFetch } from "@/lib/api";

export function LogoutButton() {
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
  return <button type="button" onClick={logout} disabled={loading} className="flex items-center gap-2 text-sm text-ink/45 transition-colors hover:text-ink"><SignOut size={16} />{loading ? "Saliendo…" : "Cerrar sesión"}</button>;
}
