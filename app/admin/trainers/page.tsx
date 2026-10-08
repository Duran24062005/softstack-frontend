import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { TrainerAssignmentForm } from "@/components/admin/trainer-assignment-form";
import { TrainerManagementForm } from "@/components/admin/trainer-management-form";
import { getAdminStudents, getAdminTrainers, requireAdmin } from "@/lib/server-api";

export default async function TrainersPage() {
  await requireAdmin();
  const [students, trainers] = await Promise.all([getAdminStudents(), getAdminTrainers()]);
  return <div className="app-main"><Link href="/admin/modules" className="back-link"><ArrowLeft size={16} /> Módulos</Link><header className="mt-8 border-b border-twilight/13 pb-8"><p className="eyebrow text-seaweed">Administración / Trainers</p><h1 className="display mt-4 text-4xl tracking-[-.055em] sm:text-6xl lg:text-7xl">Organiza el acompañamiento.</h1><p className="mt-5 max-w-xl leading-7 text-twilight/58">Asigna un trainer principal a cada estudiante para limitar la analítica y ordenar el refuerzo.</p></header><TrainerManagementForm candidates={students} /><div className="mt-8"><TrainerAssignmentForm students={students} trainers={trainers} /></div></div>;
}
