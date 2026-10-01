"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Compass, Lightning, Play, Sparkle, Target } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

import { Reveal } from "@/components/motion/reveal";

const modules = [
  { number: "01", title: "Presencia profesional", copy: "Aprende a ser claro, confiable y memorable frente a una cámara.", icon: Compass, tone: "lime" },
  { number: "02", title: "CV con impacto", copy: "Convierte tareas técnicas en logros que hablan de tu valor.", icon: Target, tone: "paper" },
  { number: "03", title: "Marca personal", copy: "Haz visible tu propuesta de valor en LinkedIn y tu portafolio.", icon: Sparkle, tone: "ink" },
];

export function Landing() {
  const reduceMotion = useReducedMotion();
  return (
    <main className="overflow-hidden bg-ink text-paper">
      <section className="relative min-h-[100dvh] border-b border-white/10 px-6 pb-16 pt-6 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1400px] flex-col">
          <nav className="flex items-center justify-between border-b border-white/15 pb-5" aria-label="Navegación principal">
            <Link href="/" className="group flex items-center gap-3 text-sm font-semibold tracking-tight">
              <span className="grid size-8 place-items-center rounded-full bg-lime text-ink transition-transform group-hover:rotate-12"><Lightning weight="fill" size={16} /></span>
              <span>soft<span className="text-lime">stack</span></span>
            </Link>
            <div className="hidden items-center gap-8 text-xs uppercase tracking-[0.18em] text-paper/60 md:flex">
              <a href="#method" className="transition-colors hover:text-lime">Método</a>
              <a href="#modules" className="transition-colors hover:text-lime">Ruta</a>
              <a href="#why" className="transition-colors hover:text-lime">Por qué</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden text-sm font-semibold text-paper/70 transition-colors hover:text-paper sm:block">Entrar</Link>
              <Link href="/register" className="button button-lime">Comenzar <ArrowUpRight size={16} weight="bold" /></Link>
            </div>
          </nav>

          <div className="grid flex-1 items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-24">
            <motion.div initial={reduceMotion ? false : { opacity: 0, x: -30 }} animate={reduceMotion ? undefined : { opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <p className="eyebrow text-lime">Campus de empleabilidad / 01</p>
              <h1 className="display mt-7 max-w-3xl text-5xl leading-[0.95] tracking-[-0.06em] sm:text-7xl lg:text-[7.4rem]">Tu siguiente nivel empieza <span className="text-lime">antes</span> de la entrevista.</h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-paper/65">Una ruta práctica para convertir tus habilidades técnicas en una presencia profesional que abre puertas.</p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/register" className="button button-lime button-large">Crear mi ruta <ArrowUpRight size={18} weight="bold" /></Link>
                <a href="#method" className="button button-ghost button-large"><Play size={16} weight="fill" /> Ver cómo funciona</a>
              </div>
            </motion.div>

            <motion.div initial={reduceMotion ? false : { opacity: 0, scale: 0.94, rotate: 2 }} animate={reduceMotion ? undefined : { opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }} className="relative min-h-[420px] lg:min-h-[560px]">
              <div className="absolute inset-4 rounded-[2rem] border border-white/15 bg-white/[0.04] p-4 shadow-2xl shadow-black/30 backdrop-blur-sm sm:inset-10 sm:p-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 text-[10px] uppercase tracking-[0.2em] text-paper/50"><span>Mi ruta / 2026</span><span className="text-lime">En progreso</span></div>
                <div className="mt-8 flex items-end justify-between"><div><p className="text-sm text-paper/50">Progreso total</p><p className="display mt-2 text-6xl tracking-[-0.08em] text-lime">24<span className="text-3xl">%</span></p></div><div className="grid size-20 place-items-center rounded-full border border-lime/50 bg-lime/10 text-center text-xs font-semibold text-lime"><span>2 de<br />8 pasos</span></div></div>
                <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: "24%" }} transition={{ duration: 1.2, delay: 0.7 }} className="h-full rounded-full bg-lime" /></div>
                <div className="mt-10 space-y-3">
                  {["Presencia profesional", "CV con impacto", "Marca personal"].map((item, index) => <motion.div key={item} initial={reduceMotion ? false : { opacity: 0, x: 14 }} animate={reduceMotion ? undefined : { opacity: 1, x: 0 }} transition={{ delay: 0.85 + index * 0.12 }} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"><span className={`grid size-9 place-items-center rounded-full ${index < 2 ? "bg-lime text-ink" : "border border-white/20 text-paper/60"}`}>{index < 2 ? <Check weight="bold" /> : <span className="text-xs">0{index + 1}</span>}</span><span className="text-sm font-medium">{item}</span><ArrowUpRight className="ml-auto text-paper/40" size={17} /></motion.div>)}
                </div>
              </div>
              <div className="absolute -bottom-2 -left-2 rounded-2xl border border-lime/40 bg-lime px-4 py-3 text-xs font-bold text-ink shadow-xl shadow-lime/20 sm:bottom-4 sm:left-0"><span className="block text-[10px] uppercase tracking-widest opacity-60">Próximo paso</span><span className="mt-1 block">Escribe tu pitch personal →</span></div>
              <div className="absolute -right-1 top-10 size-24 rounded-full border border-white/20 bg-cobalt p-3 text-[10px] uppercase leading-4 tracking-widest text-paper sm:right-0"><span className="block rotate-12">Construye · comunica · avanza</span></div>
            </motion.div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs uppercase tracking-[0.18em] text-paper/40"><span>Diseñado para talento tech en formación</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-lime" /> Aprende haciendo</span></div>
        </div>
      </section>

      <section id="method" className="bg-paper px-6 py-24 text-ink sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[1400px]"><Reveal><p className="eyebrow text-ink/50">El método</p><h2 className="display mt-6 max-w-4xl text-4xl leading-[0.98] tracking-[-0.05em] sm:text-6xl">No te preparamos para memorizar. Te preparamos para <span className="text-cobalt">demostrar.</span></h2></Reveal><div className="mt-16 grid gap-10 border-t border-ink/15 pt-8 md:grid-cols-3">{[{ n: "01", title: "Entiende", copy: "Microlecciones concretas para ordenar lo que ya sabes." }, { n: "02", title: "Practica", copy: "Ejercicios para convertir ideas en evidencia de impacto." }, { n: "03", title: "Avanza", copy: "Progreso visible para mantener el ritmo y ganar confianza." }].map((item, index) => <Reveal key={item.n} delay={index * 0.08}><p className="text-xs font-bold text-cobalt">{item.n}</p><h3 className="display mt-6 text-3xl tracking-[-0.04em]">{item.title}</h3><p className="mt-4 max-w-xs leading-7 text-ink/60">{item.copy}</p></Reveal>)}</div></div>
      </section>

      <section id="modules" className="bg-lime px-6 py-24 text-ink sm:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-[1400px]"><Reveal><div className="flex flex-wrap items-end justify-between gap-8"><div><p className="eyebrow text-ink/55">La ruta</p><h2 className="display mt-6 max-w-2xl text-5xl leading-[0.95] tracking-[-0.06em] sm:text-7xl">Cinco frentes. Una versión más clara de ti.</h2></div><p className="max-w-xs leading-7 text-ink/65">Empieza por donde más lo necesitas y vuelve cuando quieras. Tu ruta se adapta a tu momento.</p></div></Reveal><div className="mt-16 grid gap-4 md:grid-cols-3">{modules.map((module, index) => { const Icon = module.icon; return <Reveal key={module.title} delay={index * 0.08}><article className={`group flex min-h-[280px] flex-col justify-between rounded-[1.5rem] p-6 transition-transform duration-500 hover:-translate-y-2 ${module.tone === "ink" ? "bg-ink text-paper" : module.tone === "paper" ? "bg-paper" : "border border-ink/20 bg-lime"}`}><div className="flex items-start justify-between"><span className="text-xs font-bold opacity-55">{module.number}</span><Icon size={24} weight="duotone" className="opacity-70 transition-transform duration-500 group-hover:rotate-12" /></div><div><h3 className="display text-3xl tracking-[-0.04em]">{module.title}</h3><p className="mt-3 max-w-xs leading-6 opacity-65">{module.copy}</p></div></article></Reveal> })}</div></div>
      </section>

      <section id="why" className="bg-ink px-6 py-24 sm:px-10 lg:px-16 lg:py-32"><div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24"><Reveal><p className="eyebrow text-lime">La diferencia</p><h2 className="display mt-6 text-5xl leading-[0.95] tracking-[-0.06em] sm:text-7xl">Tu talento ya está. Ahora dale <span className="text-lime">señal.</span></h2></Reveal><Reveal delay={0.12}><div className="grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-2"><div><p className="display text-6xl text-lime">01</p><h3 className="mt-5 text-xl font-semibold">Contenido que aterriza</h3><p className="mt-3 leading-7 text-paper/55">Nada de teoría suelta. Cada módulo termina en una acción que puedes usar en tu próxima oportunidad.</p></div><div><p className="display text-6xl text-lime">02</p><h3 className="mt-5 text-xl font-semibold">Progreso que se siente</h3><p className="mt-3 leading-7 text-paper/55">Tu tablero convierte una meta grande en pasos cortos, visibles y alcanzables.</p></div></div></Reveal></div></section>

      <section className="bg-cobalt px-6 py-24 text-paper sm:px-10 lg:px-16 lg:py-32"><div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-10 md:flex-row md:items-end"><div><p className="eyebrow text-lime">Tu siguiente movimiento</p><h2 className="display mt-6 max-w-3xl text-5xl leading-[0.95] tracking-[-0.06em] sm:text-7xl">Haz que tu perfil trabaje contigo.</h2></div><Link href="/register" className="button button-lime button-large shrink-0">Crear mi cuenta <ArrowUpRight size={18} weight="bold" /></Link></div></section>
      <footer className="flex flex-col justify-between gap-5 border-t border-white/10 bg-ink px-6 py-8 text-xs uppercase tracking-[0.16em] text-paper/40 sm:flex-row sm:px-10 lg:px-16"><span>softstack / tech leap</span><span>Aprende · comunica · avanza</span><span>© 2026</span></footer>
    </main>
  );
}
