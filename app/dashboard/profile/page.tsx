import { UserCircle } from "@phosphor-icons/react/dist/ssr";

import { ProfileForm } from "@/components/dashboard/profile-form";
import { requireSession } from "@/lib/server-api";

export default async function ProfilePage() {
  const user = await requireSession();
  return <div className="app-main"><div className="max-w-4xl"><p className="eyebrow text-cobalt">Cuenta / Perfil</p><div className="mt-5 flex items-end justify-between gap-6"><div><h1 className="display text-5xl tracking-[-.06em] sm:text-7xl">Tu perfil.</h1><p className="mt-5 max-w-xl leading-7 text-ink/60">Mantén tus datos listos para cada oportunidad.</p></div><div className="hidden size-20 place-items-center rounded-full bg-ink text-3xl font-bold text-lime sm:grid">{user.full_name.slice(0, 1).toUpperCase()}</div></div><div className="mt-14 rounded-[1.5rem] bg-white p-6 shadow-sm sm:p-9"><ProfileForm user={user} /></div><div className="mt-8 flex items-center gap-2 text-sm text-ink/45"><UserCircle size={18} /> Tu email también identifica tu cuenta y no se comparte públicamente.</div></div></div>;
}
