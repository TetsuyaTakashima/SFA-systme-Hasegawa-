import type { DemoAccount, DemoOrder, DemoPosition, Market, Quote } from "@/types/market";

export const DEFAULT_ACCOUNT: DemoAccount = {
  cash: 1_000_000,
  initialCash: 1_000_000,
  positions: [],
  orders: [],
};

type PlaceOrderInput = {
  account: DemoAccount;
  quote: Quote;
  side: "buy" | "sell";
  quantity: number;
  note?: string;
  smallAmountMode?: boolean;
};

export function minimumQuantity(market: Market, smallAmountMode: boolean) {
  if (market === "us") return smallAmountMode ? 0.0001 : 1;
  return smallAmountMode ? 1 : 100;
}

export function validateQuantity(market: Market, quantity: number, smallAmountMode: boolean) {
  const min = minimumQuantity(market, smallAmountMode);
  if (!Number.isFinite(quantity) || quantity <= 0) return `数量は${min}以上で入力してください。`;
  if (quantity < min) {
    if (market === "jp" && !smallAmountMode) return "通常モードの日本株は100株単位で練習します。";
    return `${market === "jp" ? "日本株" : "米国株"}の最小数量は${min}です。`;
  }
  if (!smallAmountMode && market === "jp" && quantity % 100 !== 0) return "通常モードの日本株は100株単位で練習します。";
  if (!smallAmountMode && market === "us" && !Number.isInteger(quantity)) return "通常モードの米国株は1株単位で練習します。";
  return "";
}

export function placeDemoOrder({
  account,
  quote,
  side,
  quantity,
  note,
  smallAmountMode = false,
}: PlaceOrderInput): { account: DemoAccount; order: DemoOrder; warning?: string } {
  const quantityError = validateQuantity(quote.market, quantity, smallAmountMode);
  if (quantityError) throw new Error(quantityError);

  const amount = roundCurrency(quote.price * quantity);
  const fee = roundCurrency(Math.max(amount * 0.001, quote.market === "jp" ? 55 : 0.01));
  const total = roundCurrency(amount + fee);
  if (side === "buy" && total > account.cash) {
    throw new Error(`買付余力が不足しています。必要額 ${formatMoney(total, quote.currency)} / 現金 ${formatMoney(account.cash, quote.currency)}`);
  }

  const positions = upsertPosition(account.positions, {
    symbol: quote.symbol,
    market: quote.market,
    name: quote.name,
    quantity: side === "buy" ? quantity : -quantity,
    averageCost: quote.price,
  });
  const order: DemoOrder = {
    id: crypto.randomUUID(),
    symbol: quote.symbol,
    market: quote.market,
    side,
    quantity,
    price: quote.price,
    amount,
    fee,
    note,
    createdAt: new Date().toISOString(),
  };
  const cash = side === "buy"
    ? roundCurrency(account.cash - total)
    : roundCurrency(account.cash + amount - fee);
  const warning = cash / account.initialCash < 0.1 ? "現金比率が10%を下回っています。集中投資になっていないか確認してください。" : undefined;

  return {
    account: {
      ...account,
      cash,
      positions,
      orders: [order, ...account.orders].slice(0, 200),
    },
    order,
    warning,
  };
}

function upsertPosition(positions: DemoPosition[], next: DemoPosition) {
  const existing = positions.find((position) => position.symbol === next.symbol && position.market === next.market);
  if (!existing) return [...positions, next].filter((position) => Math.abs(position.quantity) > 0.000001);
  const combinedQuantity = existing.quantity + next.quantity;
  if (Math.abs(combinedQuantity) < 0.000001) {
    return positions.filter((position) => position !== existing);
  }
  const averageCost = combinedQuantity > 0
    ? ((existing.quantity * existing.averageCost) + Math.max(next.quantity, 0) * next.averageCost) / Math.max(combinedQuantity, 1)
    : existing.averageCost;
  return positions.map((position) => position === existing
    ? { ...position, quantity: roundQuantity(combinedQuantity), averageCost: roundCurrency(averageCost) }
    : position);
}

export function accountSummary(account: DemoAccount, quotes: Quote[]) {
  const marketValue = account.positions.reduce((sum, position) => {
    const quote = quotes.find((item) => item.symbol === position.symbol && item.market === position.market);
    return sum + (quote?.price || position.averageCost) * position.quantity;
  }, 0);
  const total = account.cash + marketValue;
  const pnl = total - account.initialCash;
  return {
    cash: roundCurrency(account.cash),
    marketValue: roundCurrency(marketValue),
    total: roundCurrency(total),
    pnl: roundCurrency(pnl),
    pnlPct: account.initialCash ? (pnl / account.initialCash) * 100 : 0,
  };
}

export function formatMoney(value: number, currency: "USD" | "JPY" = "USD") {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(value);
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundQuantity(value: number) {
  return Math.round(value * 10000) / 10000;
}
