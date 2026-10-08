import Link from "next/link";

import type { AnalyticsPeriod } from "@/lib/types";

const periods: Array<{ value: AnalyticsPeriod; label: string }> = [
  { value: "7d", label: "7 días" },
  { value: "30d", label: "30 días" },
  { value: "90d", label: "90 días" },
  { value: "all", label: "Todo" },
];

export function AnalyticsPeriodSelector({ pathname, period }: { pathname: string; period: AnalyticsPeriod }) {
  return (
    <nav aria-label="Período de análisis" className="flex flex-wrap gap-2">
      {periods.map((option) => (
        <Link key={option.value} href={`${pathname}?period=${option.value}`} aria-current={option.value === period ? "page" : undefined} className={option.value === period ? "button button-accent" : "button button-quiet"}>
          {option.label}
        </Link>
      ))}
    </nav>
  );
}
