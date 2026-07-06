"use client";

import { createChart, ColorType, LineSeries, LineStyle, type IChartApi, type ISeriesApi, type LineData, type Time } from "lightweight-charts";
import { useEffect, useRef } from "react";
import type { PriceBar } from "@/types/market";

type PriceChartProps = {
  bars: PriceBar[];
  forecastPct?: number;
};

export function PriceChart({ bars, forecastPct = 0 }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const forecastRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      height: 310,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#a1a1aa",
      },
      grid: {
        vertLines: { color: "rgba(113,113,122,0.16)" },
        horzLines: { color: "rgba(113,113,122,0.16)" },
      },
      rightPriceScale: { borderColor: "rgba(113,113,122,0.25)" },
      timeScale: { borderColor: "rgba(113,113,122,0.25)" },
      crosshair: { mode: 1 },
    });
    const line = chart.addSeries(LineSeries, { color: "#38bdf8", lineWidth: 2 });
    const forecastLine = chart.addSeries(LineSeries, { color: trendColor(0), lineWidth: 2, lineStyle: LineStyle.Dashed });
    chartRef.current = chart;
    seriesRef.current = line;
    forecastRef.current = forecastLine;
    const resize = () => chart.applyOptions({ width: containerRef.current?.clientWidth || 600 });
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      forecastRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !forecastRef.current || !chartRef.current) return;
    const data: LineData[] = bars.map((bar) => ({ time: bar.time as Time, value: bar.close }));
    seriesRef.current.setData(data);
    forecastRef.current.applyOptions({ color: trendColor(forecastPct) });
    forecastRef.current.setData(buildForecastLine(data, forecastPct));
    chartRef.current.timeScale().fitContent();
  }, [bars, forecastPct]);

  return <div ref={containerRef} className="h-[310px] w-full" aria-label="株価推移チャート" />;
}

function buildForecastLine(data: LineData[], forecastPct: number): LineData[] {
  const last = data.at(-1);
  if (!last || !forecastPct) return [];
  const startDate = new Date(String(last.time));
  const future: LineData[] = [last];
  for (let index = 1; index <= 30; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    future.push({
      time: date.toISOString().slice(0, 10) as Time,
      value: last.value * (1 + (forecastPct / 100) * (index / 30)),
    });
  }
  return future;
}

function trendColor(value: number) {
  if (value > 0.05) return "#22c55e";
  if (value < -0.05) return "#f87171";
  return "#a1a1aa";
}
