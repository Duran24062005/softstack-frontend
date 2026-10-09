import { Compass, Target } from "@phosphor-icons/react/dist/ssr";

import type { InstructionalPlan } from "@/lib/types";

export function InstructionalPlanSummary({ plan }: { plan: InstructionalPlan | null }) {
  if (!plan) return null;
  return <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_.9fr]" aria-label="Organización del aprendizaje">
    <div className="surface-soft p-6"><div className="flex items-center gap-2 text-seaweed"><Target size={18} weight="fill" /><p className="eyebrow">Al terminar podrás</p></div><ul className="mt-4 space-y-2 text-sm leading-6 text-twilight/70">{plan.learning_objectives.map((objective) => <li key={objective}>• {objective}</li>)}</ul></div>
    <div className="surface-soft p-6"><div className="flex items-center gap-2 text-teal"><Compass size={18} weight="fill" /><p className="eyebrow">Cómo avanzar</p></div><p className="mt-4 text-sm leading-6 text-twilight/65">{plan.ordering_rationale}</p><p className="mt-3 text-xs font-semibold uppercase tracking-[.12em] text-twilight/45">{plan.recommended_formats.join(" · ")}</p></div>
  </section>;
}
