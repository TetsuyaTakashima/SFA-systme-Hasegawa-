"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DemoAccount, Market, WatchItem } from "@/types/market";
import { DEFAULT_ACCOUNT } from "@/lib/demo-engine";

type AppStore = {
  market: Market;
  beginnerMode: boolean;
  smallAmountMode: boolean;
  watchlist: WatchItem[];
  demoAccount: DemoAccount;
  activeSymbol: string;
  setMarket: (market: Market) => void;
  setBeginnerMode: (enabled: boolean) => void;
  setSmallAmountMode: (enabled: boolean) => void;
  setActiveSymbol: (symbol: string) => void;
  addWatchItem: (item: WatchItem) => void;
  removeWatchItem: (symbol: string, market: Market) => void;
  replaceWatchlist: (items: WatchItem[]) => void;
  replaceDemoAccount: (account: DemoAccount) => void;
  resetDemoAccount: () => void;
};

const initialWatchlist: WatchItem[] = [
  { symbol: "AAPL", market: "us", name: "Apple", sector: "情報技術" },
  { symbol: "MSFT", market: "us", name: "Microsoft", sector: "情報技術" },
  { symbol: "7203.T", market: "jp", name: "トヨタ自動車", sector: "輸送用機器" },
  { symbol: "6758.T", market: "jp", name: "ソニーグループ", sector: "電気機器" },
];

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      market: "us",
      beginnerMode: false,
      smallAmountMode: false,
      watchlist: initialWatchlist,
      demoAccount: DEFAULT_ACCOUNT,
      activeSymbol: "AAPL",
      setMarket: (market) => set((state) => ({
        market,
        activeSymbol: state.watchlist.find((item) => item.market === market)?.symbol || (market === "jp" ? "7203.T" : "AAPL"),
      })),
      setBeginnerMode: (beginnerMode) => set({ beginnerMode }),
      setSmallAmountMode: (smallAmountMode) => set({ smallAmountMode }),
      setActiveSymbol: (activeSymbol) => set({ activeSymbol }),
      addWatchItem: (item) => set((state) => {
        if (state.watchlist.some((existing) => existing.symbol === item.symbol && existing.market === item.market)) return state;
        return { watchlist: [...state.watchlist, item], activeSymbol: item.symbol };
      }),
      removeWatchItem: (symbol, market) => set((state) => ({
        watchlist: state.watchlist.filter((item) => !(item.symbol === symbol && item.market === market)),
      })),
      replaceWatchlist: (items) => set({ watchlist: items }),
      replaceDemoAccount: (demoAccount) => set({ demoAccount }),
      resetDemoAccount: () => set({ demoAccount: DEFAULT_ACCOUNT }),
    }),
    {
      name: "kabu-web-next-v1",
      partialize: (state) => ({
        market: state.market,
        beginnerMode: state.beginnerMode,
        smallAmountMode: state.smallAmountMode,
        watchlist: state.watchlist,
        demoAccount: state.demoAccount,
        activeSymbol: state.activeSymbol,
      }),
    },
  ),
);
