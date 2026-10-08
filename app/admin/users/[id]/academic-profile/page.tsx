import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AcademicProfileForm } from "@/components/dashboard/academic-profile-form";
import { getAdminStudentAcademicProfile, getAdminUsers, requireAdmin } from "@/lib/server-api";

export default async function StudentAcademicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [users, academicProfile] = await Promise.all([
    getAdminUsers({ role: "user" }),
    getAdminStudentAcademicProfile(id),
  ]);
  const student = users.find((user) => user.id === id);
  if (!student) notFound();

  return (
    <div className="app-main">
      <Link href="/admin/users" className="back-link"><ArrowLeft size={16} /> Usuarios</Link>
      <header className="mx-auto mt-8 max-w-4xl border-b border-twilight/13 pb-8">
        <p className="eyebrow text-seaweed">Administración / Estudiantes</p>
        <h1 className="display mt-4 text-4xl tracking-[-.055em] sm:text-6xl">Perfil de {student.full_name}.</h1>
        <p className="mt-5 max-w-2xl leading-7 text-twilight/58">Corrige o completa la trayectoria académica que acompaña esta cuenta de estudiante.</p>
      </header>
      <section className="surface mx-auto mt-8 max-w-4xl p-6 sm:p-9">
        <AcademicProfileForm
          endpoint={`/admin/students/${student.id}/academic-profile`}
          initialProfile={academicProfile}
          title="Trayectoria del estudiante"
          description="Los cambios administrativos se guardan en el perfil del estudiante y no alteran su rol ni su estado de cuenta."
        />
      </section>
    </div>
  );
}
