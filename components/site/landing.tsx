"use client";

import { ArrowRight, ArrowUpRight, Check, Compass, Play, Sparkle, Target } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { BrandLockup } from "@/components/ui/brand-lockup";
import { LearningTrajectory } from "@/components/ui/learning-trajectory";

const routeModules = [
  {
    number: "01",
    title: "Presencia profesional",
    copy: "Comunica con claridad lo que sabes hacer y cómo puedes aportar.",
    icon: Compass,
    className: "overflow-hidden rounded-[1.35rem] bg-white text-twilight lg:col-span-7",
  },
  {
    number: "02",
    title: "CV con impacto",
    copy: "Transforma tareas técnicas en logros concretos y fáciles de entender.",
    icon: Target,
    className: "overflow-hidden rounded-[1.35rem] bg-seaweed text-twilight lg:col-span-5",
  },
  {
    number: "03",
    title: "Marca personal",
    copy: "Construye una señal profesional coherente entre LinkedIn, portafolio y conversación.",
    icon: Sparkle,
    className: "overflow-hidden rounded-[1.35rem] bg-twilight text-white lg:col-span-12",
  },
];

const methodSteps = [
  { number: "01", title: "Entiende", copy: "Microlecciones concretas para ordenar lo que ya sabes." },
  { number: "02", title: "Practica", copy: "Ejercicios que convierten ideas en evidencia profesional." },
  { number: "03", title: "Avanza", copy: "Progreso visible para mantener el ritmo y decidir el siguiente paso." },
];

export function Landing() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="overflow-hidden bg-white text-twilight">
      <section className="px-5 pb-16 pt-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[90rem]">
          <nav className="flex min-h-16 items-center justify-between gap-5 border-b border-twilight/10 pb-5" aria-label="Navegación principal">
            <BrandLockup compact />
            <div className="hidden items-center gap-7 text-sm font-medium text-twilight/60 md:flex">
              <a href="#method" className="transition-colors hover:text-teal">Método</a>
              <a href="#modules" className="transition-colors hover:text-teal">Ruta</a>
              <a href="#why" className="transition-colors hover:text-teal">Por qué SoftStack</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="hidden px-3 py-2 text-sm font-semibold text-twilight/65 transition-colors hover:text-teal sm:inline-flex">
                Entrar
              </Link>
              <Link href="/register" className="button button-primary">
                Comenzar <ArrowUpRight size={16} weight="bold" />
              </Link>
            </div>
          </nav>

          <div className="grid min-h-[calc(100dvh-7rem)] items-center gap-12 py-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:py-20">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, x: -24 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: .75, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="eyebrow text-seaweed">Campus / Talento</p>
              <h1 className="display mt-6 max-w-4xl text-4xl leading-[1.02] tracking-[-.06em] sm:text-6xl lg:text-[5.7rem]">
                Tu talento ya existe. Haz que el mercado pueda <span className="text-seaweed">verlo.</span>
              </h1>
              <p className="pretty-copy mt-7 max-w-[38rem] text-lg leading-8 text-twilight/62">
                SoftStack es la ruta de Campuslands para convertir habilidades técnicas en mensajes, evidencias y decisiones profesionales que abren oportunidades.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/register" className="button button-primary button-large">
                  Crear mi ruta <ArrowRight size={18} weight="bold" />
                </Link>
                <a href="#method" className="button button-secondary button-large">
                  <Play size={16} weight="fill" /> Ver cómo funciona
                </a>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-twilight/10 pt-5 text-xs font-medium text-twilight/52">
                <span className="flex items-center gap-2"><Check size={15} className="text-seaweed" weight="bold" /> Lecciones prácticas</span>
                <span className="flex items-center gap-2"><Check size={15} className="text-seaweed" weight="bold" /> Progreso guardado</span>
                <span className="flex items-center gap-2"><Check size={15} className="text-seaweed" weight="bold" /> A tu ritmo</span>
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: .9, delay: .12, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-[1.5rem] bg-twilight px-6 pb-6 pt-7 text-white sm:px-8 sm:pb-8"
            >
              <div className="absolute inset-y-0 left-0 w-2 bg-seaweed" />
              <div className="relative flex items-center justify-between border-b border-white/15 pb-5">
                <div>
                  <p className="eyebrow text-gold">Ruta de ejemplo</p>
                  <p className="mt-2 text-sm text-white/56">De habilidad a señal profesional</p>
                </div>
                <p className="metric-number display text-4xl tracking-[-.06em] text-gold">24%</p>
              </div>
              <LearningTrajectory progress={68} animated className="relative mt-4" />
              <div className="relative -mt-8 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div className="rounded-2xl border border-white/15 bg-white/[.06] p-4">
                  <p className="text-[.64rem] font-semibold uppercase tracking-[.16em] text-white/46">Próximo movimiento</p>
                  <p className="mt-2 font-semibold">Escribe un pitch que conecte tu experiencia con un reto real.</p>
                </div>
                <span className="grid size-14 place-items-center rounded-2xl bg-gold text-twilight">
                  <ArrowUpRight size={22} weight="bold" />
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="method" className="border-y border-twilight/10 bg-canvas px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-[90rem] gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-24">
          <Reveal>
            <p className="eyebrow text-teal">El método</p>
            <h2 className="display mt-5 max-w-xl text-4xl leading-[1.02] tracking-[-.05em] sm:text-6xl">
              No memorices una fórmula. Aprende a <span className="text-seaweed">demostrar.</span>
            </h2>
            <p className="pretty-copy mt-6 max-w-md leading-7 text-twilight/58">
              Cada parte de la ruta termina en una acción que puedes llevar a una entrevista, un perfil o una conversación profesional.
            </p>
          </Reveal>
          <div className="border-t border-twilight/15">
            {methodSteps.map((step, index) => (
              <Reveal key={step.number} delay={index * .07}>
                <article className="grid gap-5 border-b border-twilight/12 py-7 sm:grid-cols-[4rem_1fr_1.1fr] sm:items-start">
                  <span className="metric-number text-sm font-bold text-seaweed">{step.number}</span>
                  <h3 className="display text-2xl tracking-[-.035em]">{step.title}</h3>
                  <p className="pretty-copy text-sm leading-6 text-twilight/56">{step.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="bg-white px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[90rem]">
          <Reveal>
            <div className="grid gap-8 border-b border-twilight/12 pb-8 lg:grid-cols-[1fr_24rem] lg:items-end">
              <div>
                <p className="eyebrow text-seaweed">La ruta</p>
                <h2 className="display mt-5 max-w-3xl text-4xl leading-[1] tracking-[-.055em] sm:text-6xl">
                  Tres frentes para contar mejor lo que ya sabes hacer.
                </h2>
              </div>
              <p className="pretty-copy leading-7 text-twilight/58">
                Empieza por el frente que más necesitas y vuelve cuando quieras. Tu progreso se conserva.
              </p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 lg:grid-cols-12">
            {routeModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Reveal key={module.title} delay={index * .08} className={module.className}>
                  <article className="group flex min-h-[19rem] h-full flex-col justify-between rounded-[1.35rem] border border-twilight/10 p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8">
                    <div className="flex items-start justify-between">
                      <span className="metric-number text-xs font-bold opacity-60">{module.number}</span>
                      <Icon size={26} className="opacity-72 transition-transform duration-300 group-hover:-translate-y-1" />
                    </div>
                    <div className={index === 2 ? "grid gap-5 sm:grid-cols-[1fr_1fr] sm:items-end" : ""}>
                      <h3 className="display max-w-lg text-3xl tracking-[-.045em] sm:text-4xl">{module.title}</h3>
                      <p className="pretty-copy mt-4 max-w-lg leading-7 opacity-66 sm:mt-0">{module.copy}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="why" className="bg-white px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
        <div className="mx-auto grid max-w-[90rem] overflow-hidden rounded-[1.5rem] bg-teal text-white lg:grid-cols-[.9fr_1.1fr]">
          <Reveal className="p-7 sm:p-10 lg:p-14">
            <p className="eyebrow text-gold">La diferencia</p>
            <h2 className="display mt-5 max-w-xl text-4xl leading-[1] tracking-[-.055em] sm:text-6xl">
              Tu talento necesita una señal clara, no más ruido.
            </h2>
          </Reveal>
          <div className="grid border-t border-white/16 lg:border-l lg:border-t-0">
            <Reveal className="border-b border-white/16 p-7 sm:p-10" delay={.08}>
              <p className="eyebrow text-gold">Contenido que aterriza</p>
              <p className="pretty-copy mt-4 max-w-xl text-lg leading-8 text-white/72">
                Cada módulo termina en una decisión o una pieza que puedes usar en tu próxima oportunidad.
              </p>
            </Reveal>
            <Reveal className="p-7 sm:p-10" delay={.14}>
              <p className="eyebrow text-gold">Progreso que orienta</p>
              <p className="pretty-copy mt-4 max-w-xl text-lg leading-8 text-white/72">
                El tablero convierte una meta grande en movimientos cortos, visibles y alcanzables.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-gold px-5 py-20 text-twilight sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto flex max-w-[90rem] flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-twilight/58">Tu siguiente movimiento</p>
            <h2 className="display mt-5 max-w-3xl text-4xl leading-[1] tracking-[-.055em] sm:text-6xl">
              Haz que tu perfil trabaje contigo.
            </h2>
          </div>
          <Link href="/register" className="button button-primary button-large shrink-0">
            Crear mi cuenta <ArrowUpRight size={18} weight="bold" />
          </Link>
        </div>
      </section>

      <footer className="bg-twilight px-5 py-9 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[90rem] flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <BrandLockup tone="light" />
          <div className="flex flex-col gap-2 text-xs text-white/48 sm:text-right">
            <span>Aprende · comunica · avanza</span>
            <span>© 2026 Campuslands</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
