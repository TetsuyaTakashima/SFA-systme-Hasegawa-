import type { AnalysisReason, Forecast, PriceBar, ScreenerCandidate, SymbolMasterItem, Market } from "@/types/market";

export function pctChange(values: number[], period: number) {
  if (values.length <= period) return 0;
  const last = values.at(-1);
  const base = values.at(-1 - period);
  if (!last || !base) return 0;
  return ((last / base) - 1) * 100;
}

export function movingAverage(values: number[], period: number) {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((sum, value) => sum + value, 0) / slice.length;
}

export function volatility(values: number[], lookback = 30) {
  const closes = values.slice(-lookback - 1);
  if (closes.length < 3) return 0;
  const returns = closes.slice(1).map((value, index) => Math.log(value / closes[index]));
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance = returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance) * Math.sqrt(252) * 100;
}

export function forecastFromBars(bars: PriceBar[]): Forecast {
  const closes = bars.map((bar) => bar.close);
  const momentum63 = pctChange(closes, 63);
  const momentum21 = pctChange(closes, 21);
  const vol = volatility(closes);
  const ma20 = movingAverage(closes, 20);
  const ma60 = movingAverage(closes, 60);
  const trendBias = ma20 && ma60 ? ((ma20 / ma60) - 1) * 100 : 0;
  const expectedPct = clamp(momentum63 * 0.34 + momentum21 * 0.22 + trendBias * 0.44, -18, 24);
  const spread = clamp(vol / 7, 2.5, 14);
  const confidence = vol < 22 && bars.length > 180 ? "high" : vol < 38 && bars.length > 90 ? "medium" : "low";
  const reasons: AnalysisReason[] = [
    {
      label: "中期モメンタム",
      detail: `直近3ヶ月の変化率は ${formatPct(momentum63)} です。上昇が続く銘柄は短期では買いが入りやすい一方、過熱確認も必要です。`,
      level: momentum63 > 8 ? "positive" : momentum63 < -8 ? "warning" : "neutral",
    },
    {
      label: "短期の勢い",
      detail: `直近1ヶ月の変化率は ${formatPct(momentum21)} です。短期が中期より弱い場合は押し目か失速かを見分けます。`,
      level: momentum21 > 4 ? "positive" : momentum21 < -5 ? "warning" : "neutral",
    },
    {
      label: "移動平均",
      detail: ma20 && ma60
        ? `20日平均は60日平均に対して ${formatPct(trendBias)} の位置です。平均線より上なら買い優勢、下なら慎重に見ます。`
        : "移動平均を出すには、もう少し過去データが必要です。",
      level: trendBias > 2 ? "positive" : trendBias < -2 ? "warning" : "neutral",
    },
    {
      label: "値動きの荒さ",
      detail: `年率換算のボラティリティは約 ${vol.toFixed(1)}% です。大きいほど利益機会も損失幅も大きくなります。`,
      level: vol > 45 ? "warning" : vol < 24 ? "positive" : "neutral",
    },
  ];

  return {
    horizonDays: 30,
    expectedPct,
    lowPct: expectedPct - spread,
    highPct: expectedPct + spread,
    confidence,
    reasons,
  };
}

export function rankCandidates(
  market: Market,
  symbols: SymbolMasterItem[],
  histories: Record<string, PriceBar[]>,
  limit = 30,
): ScreenerCandidate[] {
  return symbols
    .map((item) => {
      const bars = histories[item.sym] || [];
      const closes = bars.map((bar) => bar.close);
      const forecast = forecastFromBars(bars);
      const momentumPct = pctChange(closes, 63);
      const volatilityPct = volatility(closes);
      const liquidityHint = item.type === "etf" ? 4 : 0;
      const score = forecast.expectedPct * 2.2 + momentumPct * 1.1 - volatilityPct * 0.22 + liquidityHint;
      return {
        rank: 0,
        symbol: item.sym,
        market,
        name: item.name || item.nameEn || item.sym,
        sector: item.sector || "その他",
        price: closes.at(-1) || 0,
        momentumPct,
        forecastPct: forecast.expectedPct,
        volatilityPct,
        score,
        reasons: forecast.reasons,
      };
    })
    .filter((candidate) => Number.isFinite(candidate.score) && candidate.price > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((candidate, index) => ({ ...candidate, rank: index + 1 }));
}

export function formatPct(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
