// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { addSeriesMock, applyOptionsMock, chartMock, createChartMock, areaSeries, lineSeries, histogramSeries } = vi.hoisted(() => {
  const addSeries = vi.fn((definition: unknown) => {
    void definition;
    return { setData: vi.fn() };
  });
  const applyOptions = vi.fn();
  const chart = {
    addSeries,
    applyOptions,
    timeScale: vi.fn(() => ({ fitContent: vi.fn() })),
    remove: vi.fn(),
  };
  return {
    addSeriesMock: addSeries,
    applyOptionsMock: applyOptions,
    chartMock: chart,
    createChartMock: vi.fn(() => chart),
    areaSeries: Symbol("AreaSeries"),
    lineSeries: Symbol("LineSeries"),
    histogramSeries: Symbol("HistogramSeries"),
  };
});

vi.mock("lightweight-charts", () => ({
  AreaSeries: areaSeries,
  HistogramSeries: histogramSeries,
  LineSeries: lineSeries,
  createChart: createChartMock,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => <a href={href} {...props}>{children}</a>,
}));

import { AnalyticsChart } from "@/components/analytics/analytics-chart";
import { AnalyticsPeriodSelector } from "@/components/analytics/analytics-period-selector";
import { normalizeAnalyticsPeriod } from "@/lib/analytics";

afterEach(() => {
  cleanup();
  createChartMock.mockClear();
  addSeriesMock.mockClear();
  applyOptionsMock.mockClear();
  chartMock.remove.mockClear();
  vi.unstubAllGlobals();
});

describe("analytics chart", () => {
  it("creates the chart with responsive sizing and removes it on unmount", () => {
    const { unmount } = render(
      <AnalyticsChart
        ariaLabel="Avance del estudiante"
        format="percent"
        series={[
          { id: "progress", label: "Avance", color: "#00AA80", kind: "area", data: [{ time: "2026-10-08", value: 50 }] },
          { id: "score", label: "Calificación", color: "#16697A", kind: "line", data: [{ time: "2026-10-08", value: 80 }] },
          { id: "activity", label: "Actividad", color: "#F4B422", kind: "histogram", data: [{ time: "2026-10-08", value: 2 }] },
        ]}
      />,
    );

    expect(createChartMock).toHaveBeenCalledWith(expect.any(HTMLDivElement), expect.objectContaining({
      autoSize: true,
      layout: expect.objectContaining({ background: { color: "#F7F9F9" }, attributionLogo: false }),
    }));
    expect(addSeriesMock).toHaveBeenCalledTimes(3);
    expect(addSeriesMock.mock.calls.map(([definition]) => definition)).toEqual([areaSeries, lineSeries, histogramSeries]);
    expect(screen.getByRole("img", { name: "Avance del estudiante" })).toBeInTheDocument();
    expect(screen.getByText("Ver datos")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "TradingView" })).toHaveAttribute("href", "https://www.tradingview.com/");

    unmount();
    expect(chartMock.remove).toHaveBeenCalledOnce();
  });

  it("applies the system color scheme and updates when it changes", () => {
    let colorSchemeListener: ((event: MediaQueryListEvent) => void) | undefined;
    const mediaQuery = {
      matches: true,
      addEventListener: vi.fn((_event: string, listener: (event: MediaQueryListEvent) => void) => {
        colorSchemeListener = listener;
      }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("matchMedia", vi.fn(() => mediaQuery));

    render(<AnalyticsChart ariaLabel="Avance" series={[{ id: "progress", label: "Avance", color: "#00AA80", kind: "area", data: [{ time: "2026-10-08", value: 50 }] }]} />);

    expect(createChartMock).toHaveBeenCalledWith(expect.any(HTMLDivElement), expect.objectContaining({
      layout: expect.objectContaining({ background: { color: "#0F084B" }, attributionLogo: false }),
    }));

    colorSchemeListener?.({ matches: false } as MediaQueryListEvent);

    expect(applyOptionsMock).toHaveBeenCalledWith(expect.objectContaining({
      layout: expect.objectContaining({ background: { color: "#F7F9F9" } }),
    }));
  });

  it("explains empty periods without creating a chart", () => {
    render(<AnalyticsChart ariaLabel="Sin actividad" series={[{ id: "activity", label: "Actividad", color: "#F4B422", kind: "histogram", data: [] }]} />);

    expect(screen.getByText("Todavía no hay datos para este período.")).toBeInTheDocument();
    expect(createChartMock).not.toHaveBeenCalled();
  });
});

describe("analytics period selector", () => {
  it("keeps the selected period in the URL and normalizes invalid values", () => {
    render(<AnalyticsPeriodSelector pathname="/dashboard" period="30d" />);

    expect(screen.getByRole("link", { name: "30 días" })).toHaveAttribute("href", "/dashboard?period=30d");
    expect(screen.getByRole("link", { name: "30 días" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Todo" })).toHaveAttribute("href", "/dashboard?period=all");
    expect(normalizeAnalyticsPeriod("90d")).toBe("90d");
    expect(normalizeAnalyticsPeriod("invalid")).toBe("30d");
  });
});
