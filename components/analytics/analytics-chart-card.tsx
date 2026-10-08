import type { AnalyticsChartSeries } from "@/components/analytics/analytics-chart";
import { AnalyticsChart } from "@/components/analytics/analytics-chart";

type AnalyticsChartCardProps = {
  title: string;
  description: string;
  ariaLabel: string;
  series: AnalyticsChartSeries[];
  format?: "integer" | "percent";
};

export function AnalyticsChartCard({ title, description, ariaLabel, series, format = "integer" }: AnalyticsChartCardProps) {
  return (
    <section className="surface p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-twilight/10 pb-4">
        <div>
          <p className="eyebrow text-teal">Tendencia</p>
          <h2 className="display mt-2 text-2xl tracking-[-.035em]">{title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-twilight/52">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] font-semibold text-twilight/55" aria-label="Leyenda del gráfico">
          {series.map((item) => <span key={item.id} className="inline-flex items-center gap-2"><span className="size-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />{item.label}</span>)}
        </div>
      </div>
      <div className="mt-5"><AnalyticsChart ariaLabel={ariaLabel} series={series} format={format} /></div>
    </section>
  );
}
