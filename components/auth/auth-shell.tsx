import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLockup } from "@/components/ui/brand-lockup";
import { LearningTrajectory } from "@/components/ui/learning-trajectory";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  children: ReactNode;
};

export function AuthShell({ eyebrow, title, description, backHref, backLabel, children }: AuthShellProps) {
  return (
    <main className="auth-shell">
      <section className="auth-brand-panel" aria-label="SoftStack por Campuslands">
        <BrandLockup tone="light" />
        <div className="mt-auto max-w-xl pb-4">
          <p className="eyebrow text-gold">Campus / Talento</p>
          <p className="display mt-5 text-4xl leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl">
            Convierte aprendizaje en señales que otras personas puedan reconocer.
          </p>
        </div>
        <LearningTrajectory progress={72} className="auth-trajectory" />
      </section>
      <section className="auth-form-panel">
        <div className="w-full max-w-[34rem]">
          <div className="mb-8 lg:hidden">
            <BrandLockup compact />
          </div>
          <Link href={backHref} className="back-link">
            <ArrowLeft size={16} /> {backLabel}
          </Link>
          <div className="mt-9">
            <p className="eyebrow text-seaweed">{eyebrow}</p>
            <h1 className="display mt-4 text-4xl leading-[1.02] tracking-[-0.05em] text-twilight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-twilight/60">{description}</p>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
