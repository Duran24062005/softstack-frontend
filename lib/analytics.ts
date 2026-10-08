import type { AnalyticsPeriod } from "@/lib/types";

const periods: AnalyticsPeriod[] = ["7d", "30d", "90d", "all"];

export function normalizeAnalyticsPeriod(value?: string): AnalyticsPeriod {
  return periods.includes(value as AnalyticsPeriod) ? value as AnalyticsPeriod : "30d";
}
