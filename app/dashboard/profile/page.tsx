import { LockKey, UserCircle } from "@phosphor-icons/react/dist/ssr";

import { ProfileAvatar } from "@/components/dashboard/profile-avatar";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { ProfilePhotoForm } from "@/components/dashboard/profile-photo-form";
import { AcademicProfileForm } from "@/components/dashboard/academic-profile-form";
import { getMyAcademicProfile, requireSession } from "@/lib/server-api";

export default async function ProfilePage() {
  const user = await requireSession();
  const academicProfile = user.role === "user" ? await getMyAcademicProfile() : null;

  return (
    <div className="app-main">
      <div className="mx-auto max-w-5xl">
        <header className="grid gap-6 border-b border-twilight/13 pb-9 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="eyebrow text-seaweed">Cuenta / Perfil</p>
            <h1 className="display mt-4 text-4xl tracking-[-.055em] sm:text-6xl lg:text-7xl">Tu identidad, lista.</h1>
            <p className="pretty-copy mt-5 max-w-xl leading-7 text-twilight/58">Mantén tus datos al día para moverte con confianza frente a cada oportunidad.</p>
          </div>
          <ProfileAvatar user={user} className="hidden size-24 text-3xl sm:grid" />
        </header>
        <div className="mt-8 grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
          <aside className="rounded-[1.35rem] bg-twilight p-7 text-white">
            <p className="eyebrow text-gold">Privacidad primero</p>
            <LockKey size={28} weight="bold" className="mt-10 text-seaweed" />
            <h2 className="display mt-5 text-3xl tracking-[-.04em]">Tú controlas tus datos.</h2>
            <p className="pretty-copy mt-4 text-sm leading-7 text-white/62">Tu foto de perfil es privada. Tu email identifica la cuenta y no se publica en el contenido educativo.</p>
            <div className="mt-10 flex items-center gap-2 text-xs text-white/48"><UserCircle size={17} /> Cuenta {user.role === "admin" ? "administradora" : "estudiante"}</div>
          </aside>
          <section className="surface p-6 sm:p-9">
            <ProfilePhotoForm user={user} />
            <div className="mt-8"><ProfileForm user={user} /></div>
            {user.role === "user" ? <AcademicProfileForm endpoint="/auth/me/academic-profile" initialProfile={academicProfile} /> : null}
          </section>
        </div>
      </div>
    </div>
  );
}
