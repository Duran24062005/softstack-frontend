import Link from "next/link";
import { ArrowLeft, Gear, Lightning } from "@phosphor-icons/react/dist/ssr";

import { LogoutButton } from "@/components/auth/logout-button";
import { requireSession } from "@/lib/server-api";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireSession();
  return (
    <div className="app-shell">
      <header className="app-nav sticky top-0 z-30">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-5 px-6 py-4 sm:px-10 lg:px-16">
          <Link href="/dashboard" className="flex items-center gap-3 text-sm font-bold">
            <span className="grid size-8 place-items-center rounded-full bg-lime text-ink">
              <Lightning weight="fill" size={16} />
            </span>Soft<span className="-ml-3 text-cobalt">Stack</span>
          </Link><nav className="hidden items-center gap-6 text-sm text-ink/55 md:flex"><Link className="transition-colors hover:text-ink" href="/dashboard">Mi ruta</Link><Link className="transition-colors hover:text-ink" href="/dashboard/profile">Mi perfil</Link>{user.role === "admin" && <><Link className="transition-colors hover:text-ink" href="/admin/modules">Módulos</Link><Link className="transition-colors hover:text-ink" href="/admin/lessons/new">Editor</Link></>}</nav><div className="flex items-center gap-4"><span className="hidden text-right sm:block"><span className="block text-xs font-bold">{user.full_name}</span><span className="block text-[10px] uppercase tracking-widest text-ink/45">{user.role === "admin" ? "Admin" : "Estudiante"}</span></span><Link href="/dashboard/profile" className="grid size-10 place-items-center rounded-full bg-ink text-sm font-bold text-lime">{user.full_name.slice(0, 1).toUpperCase()}</Link><LogoutButton /></div></div></header><main>{children}</main><footer className="mx-auto flex max-w-[1400px] items-center justify-between border-t border-ink/10 px-6 py-8 text-xs text-ink/40 sm:px-10 lg:px-16"><Link href="/" className="flex items-center gap-2 hover:text-ink"><ArrowLeft size={14} /> SoftStack</Link><span>Tu siguiente nivel, paso a paso.</span><Link href="/dashboard/profile" className="flex items-center gap-2 hover:text-ink"><Gear size={14} /> Perfil</Link></footer></div>);
}
