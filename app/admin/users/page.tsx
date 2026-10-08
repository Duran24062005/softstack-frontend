import { ArrowLeft, UsersThree } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { UserManagement } from "@/components/admin/user-management";
import { getAdminUsers, requireAdmin } from "@/lib/server-api";

export default async function UsersPage() {
  await requireAdmin();
  const users = await getAdminUsers();

  return <div className="app-main">
    <Link href="/admin/modules" className="back-link"><ArrowLeft size={16} /> Módulos</Link>
    <header className="mt-8 border-b border-twilight/13 pb-8">
      <p className="eyebrow text-seaweed">Administración / Usuarios</p>
      <div className="mt-4 flex items-center gap-3"><UsersThree size={28} className="shrink-0 text-seaweed" aria-hidden="true" /><h1 className="display text-4xl tracking-[-.055em] sm:text-6xl lg:text-7xl">Cuida el acceso.</h1></div>
      <p className="pretty-copy mt-5 max-w-2xl leading-7 text-twilight/58">Cada cuenta tiene un rol y un estado visible. Revisa las solicitudes antes de abrir la ruta de aprendizaje.</p>
    </header>
    <UserManagement initialUsers={users} />
  </div>;
}
