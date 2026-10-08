import { ArrowRight, BookOpen, CheckCircle, Flag, Sparkle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { LearningTrajectory } from "@/components/ui/learning-trajectory";
import { getLearningData, getSession } from "@/lib/server-api";

export default async function DashboardPage() {
  const [user, learning] = await Promise.all([getSession(), getLearningData()]);
  if (!user) return null;

  const firstModule = learning.modules[0];
  const percentage = Math.round(learning.progress.percentage);

  return (
    <div className="app-main">
      <section className="grid overflow-hidden rounded-[1.5rem] bg-twilight text-white lg:grid-cols-[1.03fr_.97fr]">
        <Reveal className="flex flex-col justify-between p-7 sm:p-10 lg:min-h-[32rem] lg:p-12">
          <div>
            <p className="eyebrow text-gold">Mi espacio / Próximo nivel</p>
            <h1 className="display mt-6 max-w-3xl text-4xl leading-[1.02] tracking-[-.055em] sm:text-6xl lg:text-7xl">
              Hola, {user.full_name.split(" ")[0]}. Tu talento está en <span className="text-gold">movimiento.</span>
            </h1>
            <p className="pretty-copy mt-6 max-w-xl leading-7 text-white/68">
              Sigue construyendo señales claras de lo que sabes hacer. Cada lección completada acerca tu perfil a una nueva oportunidad.
            </p>
          </div>
          <Link href={firstModule ? `/dashboard/modules/${firstModule.id}` : "#modules"} className="button button-accent button-large mt-10 w-fit">
            Continuar mi ruta <ArrowRight size={18} weight="bold" />
          </Link>
        </Reveal>
        <Reveal delay={0.08} className="relative min-h-80 border-t border-white/10 bg-white/[.035] p-7 lg:border-l lg:border-t-0 lg:p-10">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="eyebrow text-seaweed">Trayectoria general</p>
              <p className="metric-number mt-3 text-6xl font-bold tracking-[-.065em] text-white">
                {percentage}<span className="text-2xl text-gold">%</span>
              </p>
            </div>
            <span className="rounded-lg border border-white/15 px-3 py-2 text-right text-[11px] leading-5 text-white/55">
              {learning.progress.completed_count} de {learning.progress.total_lessons}<br />lecciones
            </span>
          </div>
          <LearningTrajectory progress={percentage} animated className="mt-2" />
        </Reveal>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="surface p-5">
          <CheckCircle size={22} weight="bold" className="text-seaweed" />
          <p className="metric-number mt-5 text-3xl font-bold">{learning.progress.completed_count}</p>
          <p className="mt-1 text-sm text-twilight/52">Lecciones completadas</p>
        </div>
        <div className="surface p-5">
          <Flag size={22} weight="bold" className="text-teal" />
          <p className="metric-number mt-5 text-3xl font-bold">{learning.progress.total_lessons}</p>
          <p className="mt-1 text-sm text-twilight/52">Hitos de aprendizaje</p>
        </div>
        <div className="surface p-5">
          <Sparkle size={22} weight="bold" className="text-gold" />
          <p className="mt-5 text-base font-bold">Tu próximo paso cuenta</p>
          <p className="mt-1 text-sm text-twilight/52">Convierte lo aprendido en una señal visible.</p>
        </div>
      </section>

      <section id="modules" className="mt-20">
        <div className="flex flex-col justify-between gap-5 border-b border-twilight/13 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-seaweed">Ruta de aprendizaje</p>
            <h2 className="display mt-4 text-4xl tracking-[-.045em] sm:text-5xl">Frentes para crecer.</h2>
          </div>
          <span className="text-sm font-medium text-twilight/45">{learning.modules.length} módulos disponibles</span>
        </div>
        {learning.modules.length === 0 ? (
          <div className="empty-state mt-8">
            <BookOpen size={30} className="mx-auto text-teal" />
            <p className="mt-4 font-semibold">Estamos preparando tu ruta.</p>
            <p className="mt-2 text-sm text-twilight/50">Pronto verás aquí tus primeros módulos.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {learning.modules.map((module, index) => (
              <Reveal key={module.id} delay={index * 0.05} className="h-full">
                <Link href={`/dashboard/modules/${module.id}`} className="group flex h-full min-h-[17rem] flex-col justify-between rounded-[1.35rem] border border-twilight/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-seaweed/50 hover:shadow-[0_16px_38px_rgba(15,8,75,.08)]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="metric-number text-sm font-bold text-seaweed">/{String(index + 1).padStart(2, "0")}</span>
                    <ArrowRight size={19} className="text-twilight/35 transition-transform group-hover:translate-x-1 group-hover:text-teal" />
                  </div>
                  <div>
                    <h3 className="display text-2xl tracking-[-.035em]">{module.title}</h3>
                    <p className="pretty-copy mt-3 text-sm leading-6 text-twilight/55">{module.description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.11em] text-teal">Explorar módulo</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
