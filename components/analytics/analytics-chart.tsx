"use client";

import { AreaSeries, HistogramSeries, LineSeries, createChart, type Time } from "lightweight-charts";
import { useEffect, useMemo, useRef } from "react";

import type { AnalyticsPoint } from "@/lib/types";

export type AnalyticsChartSeries = {
  id: string;
  label: string;
  color: string;
  data: AnalyticsPoint[];
  kind: "area" | "line" | "histogram";
  topColor?: string;
  bottomColor?: string;
};

type AnalyticsChartProps = {
  ariaLabel: string;
  series: AnalyticsChartSeries[];
  format?: "integer" | "percent";
};

function formatValue(value: number, format: "integer" | "percent") {
  return format === "percent" ? `${value.toLocaleString("es-CO", { maximumFractionDigits: 1 })}%` : value.toLocaleString("es-CO", { maximumFractionDigits: 1 });
}

const chartThemes = {
  light: {
    background: "#F7F9F9",
    text: "rgba(15, 8, 75, .68)",
    grid: "rgba(15, 8, 75, .08)",
    gridStrong: "rgba(15, 8, 75, .13)",
    border: "rgba(15, 8, 75, .18)",
    crosshair: "rgba(22, 105, 122, .8)",
    crosshairSecondary: "rgba(22, 105, 122, .45)",
  },
  dark: {
    background: "#0F084B",
    text: "rgba(255, 255, 255, .72)",
    grid: "rgba(255, 255, 255, .08)",
    gridStrong: "rgba(255, 255, 255, .13)",
    border: "rgba(255, 255, 255, .18)",
    crosshair: "rgba(244, 180, 34, .72)",
    crosshairSecondary: "rgba(244, 180, 34, .4)",
  },
} as const;

type ChartTheme = (typeof chartThemes)[keyof typeof chartThemes];

function getChartOptions(theme: ChartTheme, format: "integer" | "percent") {
  return {
    autoSize: true,
    height: 240,
    layout: {
      background: { color: theme.background },
      textColor: theme.text,
      fontFamily: "Poppins, Arial, sans-serif",
      fontSize: 11,
    },
    grid: {
      vertLines: { color: theme.grid },
      horzLines: { color: theme.gridStrong },
    },
    crosshair: {
      vertLine: { color: theme.crosshair, width: 1 as const },
      horzLine: { color: theme.crosshairSecondary, width: 1 as const },
    },
    rightPriceScale: { borderColor: theme.border },
    timeScale: { borderColor: theme.border, timeVisible: false, rightOffset: 2 },
    localization: { priceFormatter: (value: number) => formatValue(value, format) },
  };
}

function getColorSchemeMediaQuery() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
  return window.matchMedia("(prefers-color-scheme: dark)");
}

export function AnalyticsChart({ ariaLabel, series, format = "integer" }: AnalyticsChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartData = useMemo(() => series.flatMap((item) => item.data.map((point) => ({ ...point, series: item.label }))), [series]);
  const hasData = series.some((item) => item.data.length > 0);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container || !hasData) return undefined;

    const colorSchemeMediaQuery = getColorSchemeMediaQuery();
    const chart = createChart(container, getChartOptions(colorSchemeMediaQuery?.matches ? chartThemes.dark : chartThemes.light, format));

    for (const item of series) {
      const points = item.data.map((point) => ({ time: point.time as Time, value: point.value }));
      if (item.kind === "area") {
        const area = chart.addSeries(AreaSeries, {
          lineColor: item.color,
          topColor: item.topColor ?? "rgba(0, 170, 128, .32)",
          bottomColor: item.bottomColor ?? "rgba(0, 170, 128, .04)",
          lineWidth: 2,
          crosshairMarkerRadius: 4,
        });
        area.setData(points);
      } else if (item.kind === "histogram") {
        const histogram = chart.addSeries(HistogramSeries, { color: item.color, priceLineVisible: false, lastValueVisible: false });
        histogram.setData(points);
      } else {
        const line = chart.addSeries(LineSeries, { color: item.color, lineWidth: 2, crosshairMarkerRadius: 4 });
        line.setData(points);
      }
    }

    const handleColorSchemeChange = (event: MediaQueryListEvent) => {
      chart.applyOptions(getChartOptions(event.matches ? chartThemes.dark : chartThemes.light, format));
    };

    colorSchemeMediaQuery?.addEventListener("change", handleColorSchemeChange);
    chart.timeScale().fitContent();
    return () => {
      colorSchemeMediaQuery?.removeEventListener("change", handleColorSchemeChange);
      chart.remove();
    };
  }, [format, hasData, series]);

  return (
    <div className="analytics-chart-surface">
      <div className="analytics-chart" role="img" aria-label={ariaLabel}>
        {hasData ? <div ref={chartContainerRef} className="h-60 w-full" /> : <p className="analytics-chart-empty flex h-60 items-center justify-center px-5 text-center text-sm">Todavía no hay datos para este período.</p>}
      </div>
      {hasData ? (
        <details className="analytics-chart-data mt-4 rounded-lg border px-3 py-2 text-xs">
          <summary className="analytics-chart-data-summary cursor-pointer font-semibold">Ver datos</summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[24rem] text-left">
              <caption className="sr-only">{ariaLabel}</caption>
              <thead><tr className="analytics-chart-data-rule border-b"><th className="pb-2 pr-4 font-semibold">Fecha</th><th className="pb-2 pr-4 font-semibold">Serie</th><th className="pb-2 font-semibold">Valor</th></tr></thead>
              <tbody>{chartData.map((point, index) => <tr key={`${point.series}-${point.time}-${index}`} className="analytics-chart-data-row border-b last:border-0"><td className="py-2 pr-4">{point.time}</td><td className="py-2 pr-4">{point.series}</td><td className="py-2">{formatValue(point.value, format)}</td></tr>)}</tbody>
            </table>
          </div>
        </details>
      ) : null}
    </div>
  );
}
