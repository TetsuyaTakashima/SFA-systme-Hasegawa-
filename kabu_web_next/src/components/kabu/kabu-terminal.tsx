"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BookOpen,
  Brain,
  CheckCircle2,
  Database,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogIn,
  RefreshCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PriceChart } from "@/components/charts/price-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { accountSummary, formatMoney } from "@/lib/demo-engine";
import { forecastFromBars, formatPct } from "@/lib/analytics";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/app-store";
import type {
  DemoAccount,
  HistoryResponse,
  Market,
  Quote,
  ScreenerCandidate,
  SymbolMasterItem,
  WatchItem,
} from "@/types/market";

type ConfigResponse = {
  supabaseReady: boolean;
  officialProvider: string;
  officialProviderReady: boolean;
};

type SymbolMasterResponse = {
  us: SymbolMasterItem[];
  jp: SymbolMasterItem[];
};

type ScreenerResponse = {
  candidates: ScreenerCandidate[];
  universeCount: number;
  searchedCount: number;
};

const viewTabs = [
  { id: "overview", label: "概要", icon: LayoutDashboard },
  { id: "discover", label: "銘柄発掘", icon: Search },
  { id: "trade", label: "デモ", icon: WalletCards },
  { id: "learn", label: "学習", icon: GraduationCap },
  { id: "settings", label: "設定", icon: SlidersHorizontal },
] as const;

type ViewTab = (typeof viewTabs)[number]["id"];

export function KabuTerminal() {
  const queryClient = useQueryClient();
  const {
    market,
    beginnerMode,
    smallAmountMode,
    watchlist,
    activeSymbol,
    demoAccount,
    setMarket,
    setBeginnerMode,
    setSmallAmountMode,
    setActiveSymbol,
    addWatchItem,
    removeWatchItem,
    replaceWatchlist,
    replaceDemoAccount,
    resetDemoAccount,
  } = useAppStore();
  const [view, setView] = useState<ViewTab>("overview");
  const [symbolQuery, setSymbolQuery] = useState("");
  const [screenerQuery, setScreenerQuery] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("1");
  const [orderNote, setOrderNote] = useState("");
  const [cloudEmail, setCloudEmail] = useState("");
  const [cloudMessage, setCloudMessage] = useState("未ログインでもローカル保存で試せます。");
  const [cloudUser, setCloudUser] = useState<string | null>(null);

  const visibleWatchlist = useMemo(
    () => watchlist.filter((item) => item.market === market),
    [market, watchlist],
  );
  const watchedSymbols = visibleWatchlist.map((item) => item.symbol);

  const configQuery = useQuery({
    queryKey: ["config"],
    queryFn: () => fetchJson<ConfigResponse>("/api/config"),
  });

  const masterQuery = useQuery({
    queryKey: ["symbol-master"],
    queryFn: () => fetchJson<SymbolMasterResponse>("/data/symbol-master.json"),
  });

  const quotesQuery = useQuery({
    queryKey: ["quotes", market, watchedSymbols.join(",")],
    queryFn: () => fetchJson<{ quotes: Quote[] }>(`/api/market/quote?market=${market}&symbols=${encodeURIComponent(watchedSymbols.join(","))}`),
    enabled: watchedSymbols.length > 0,
  });

  const historyQuery = useQuery({
    queryKey: ["history", market, activeSymbol],
    queryFn: () => fetchJson<HistoryResponse>(`/api/market/history?market=${market}&symbol=${encodeURIComponent(activeSymbol)}&range=1y`),
    enabled: Boolean(activeSymbol),
  });

  const screenerQueryResult = useQuery({
    queryKey: ["screener", market, screenerQuery],
    queryFn: () => postJson<ScreenerResponse>("/api/screener/run", { market, query: screenerQuery, limit: 24 }),
  });

  const orderMutation = useMutation({
    mutationFn: (payload: { quote: Quote; side: "buy" | "sell"; quantity: number; account: DemoAccount; note?: string }) =>
      postJson<{ account: DemoAccount; warning?: string }>("/api/demo/orders", {
        ...payload,
        smallAmountMode,
      }),
    onSuccess: (result) => {
      replaceDemoAccount(result.account);
      setOrderNote(result.warning || "注文をデモ口座へ反映しました。");
    },
  });

  const activeQuote = quotesQuery.data?.quotes.find((quote) => quote.symbol === activeSymbol);
  const forecast = historyQuery.data?.bars?.length ? forecastFromBars(historyQuery.data.bars) : null;
  const summary = accountSummary(demoAccount, quotesQuery.data?.quotes || []);
  const searchResults = useMemo(
    () => {
      const masterRows = market === "jp" ? masterQuery.data?.jp || [] : masterQuery.data?.us || [];
      return searchMaster(masterRows, symbolQuery).slice(0, 18);
    },
    [market, masterQuery.data, symbolQuery],
  );

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user.email || null;
      setCloudUser(email);
      if (email) setCloudMessage(`ログイン中: ${email}`);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user.email || null;
      setCloudUser(email);
      setCloudMessage(email ? `ログイン中: ${email}` : "ログアウトしました。ローカル保存で継続します。");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!visibleWatchlist.some((item) => item.symbol === activeSymbol)) {
      setActiveSymbol(visibleWatchlist[0]?.symbol || (market === "jp" ? "7203.T" : "AAPL"));
    }
  }, [activeSymbol, market, setActiveSymbol, visibleWatchlist]);

  const addFromMaster = (item: SymbolMasterItem) => {
    const next: WatchItem = {
      symbol: item.sym,
      market,
      name: item.name || item.nameEn || item.sym,
      sector: item.sector || "その他",
    };
    addWatchItem(next);
  };

  const submitOrder = (side: "buy" | "sell") => {
    const quote = activeQuote;
    if (!quote) {
      setOrderNote("価格データを取得してから注文してください。");
      return;
    }
    orderMutation.mutate({
      account: demoAccount,
      quote,
      side,
      quantity: Number(orderQuantity),
      note: orderNote,
    });
  };

  const login = async () => {
    const supabase = getBrowserSupabase();
    if (!supabase || !cloudEmail) {
      setCloudMessage("Supabase環境変数とメールアドレスを確認してください。");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: cloudEmail,
      options: { emailRedirectTo: window.location.href },
    });
    setCloudMessage(error ? `送信失敗: ${error.message}` : "ログインリンクを送信しました。メールを確認してください。");
  };

  const pushCloud = async () => {
    const supabase = getBrowserSupabase();
    const { data } = await supabase?.auth.getSession() ?? { data: null };
    if (!supabase || !data?.session?.user) {
      setCloudMessage("クラウド保存にはログインが必要です。");
      return;
    }
    const userId = data.session.user.id;
    const rows = [
      { user_id: userId, market, key: "stocks", data: visibleWatchlist },
      { user_id: userId, market, key: "paper", data: demoAccount },
      { user_id: userId, market, key: "settings", data: { beginnerMode, smallAmountMode, view } },
    ];
    const { error } = await supabase.from("app_state").upsert(rows, { onConflict: "user_id,market,key" });
    setCloudMessage(error ? `保存失敗: ${error.message}` : "クラウドへ保存しました。");
  };

  const pullCloud = async () => {
    const supabase = getBrowserSupabase();
    const { data } = await supabase?.auth.getSession() ?? { data: null };
    if (!supabase || !data?.session?.user) {
      setCloudMessage("クラウド読込にはログインが必要です。");
      return;
    }
    const { data: rows, error } = await supabase.from("app_state").select("key,data").eq("market", market).in("key", ["stocks", "paper"]);
    if (error) {
      setCloudMessage(`読込失敗: ${error.message}`);
      return;
    }
    const stocks = rows?.find((row) => row.key === "stocks")?.data;
    const paper = rows?.find((row) => row.key === "paper")?.data;
    if (Array.isArray(stocks)) replaceWatchlist([...watchlist.filter((item) => item.market !== market), ...(stocks as WatchItem[])]);
    if (paper && typeof paper === "object") replaceDemoAccount(paper as DemoAccount);
    setCloudMessage(rows?.length ? "クラウドから読み込みました。" : "クラウドに保存データがありません。");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-sky-400" />
                kabu_web v2 / Next.js App Router
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">株式デモトレード・分析ワークスペース</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant={market === "us" ? "default" : "outline"} onClick={() => setMarket("us")}>米国株</Button>
              <Button variant={market === "jp" ? "default" : "outline"} onClick={() => setMarket("jp")}>日本株</Button>
              <Separator orientation="vertical" className="hidden h-8 md:block" />
              <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <Label htmlFor="beginner-mode" className="text-sm">初心者モード</Label>
                <Switch id="beginner-mode" checked={beginnerMode} onCheckedChange={setBeginnerMode} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <Tabs value={view} onValueChange={(value) => setView(value as ViewTab)} className="w-full lg:w-auto">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto">
                {viewTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="gap-1">
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={configQuery.data?.officialProviderReady ? "default" : "secondary"}>
                {configQuery.data?.officialProviderReady ? `正式API: ${configQuery.data.officialProvider}` : "デモデータ / fallback"}
              </Badge>
              <Badge variant={configQuery.data?.supabaseReady ? "default" : "outline"}>
                {cloudUser ? "クラウド同期中" : configQuery.data?.supabaseReady ? "ログイン可" : "ローカル保存"}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <span className="text-emerald-400">上昇</span>
                <span>/</span>
                <span className="text-red-400">下落</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)_340px] lg:px-6">
        <aside className="hidden lg:block">
          <NavigationPanel
            view={view}
            setView={setView}
            watchlist={visibleWatchlist}
            activeSymbol={activeSymbol}
            setActiveSymbol={setActiveSymbol}
            removeWatchItem={(symbol) => removeWatchItem(symbol, market)}
          />
        </aside>

        <section className="min-w-0">
          <Tabs value={view} onValueChange={(value) => setView(value as ViewTab)}>
            <TabsContent value="overview" className="mt-0">
              <OverviewView
                market={market}
                quotes={quotesQuery.data?.quotes || []}
                quoteLoading={quotesQuery.isLoading}
                history={historyQuery.data}
                forecast={forecast}
                activeSymbol={activeSymbol}
                setActiveSymbol={setActiveSymbol}
                beginnerMode={beginnerMode}
              />
            </TabsContent>
            <TabsContent value="discover" className="mt-0">
              <DiscoverView
                symbolQuery={symbolQuery}
                setSymbolQuery={setSymbolQuery}
                searchResults={searchResults}
                addFromMaster={addFromMaster}
                screenerQuery={screenerQuery}
                setScreenerQuery={setScreenerQuery}
                screener={screenerQueryResult.data}
                screenerLoading={screenerQueryResult.isFetching}
                refreshScreener={() => queryClient.invalidateQueries({ queryKey: ["screener", market] })}
                setActiveSymbol={setActiveSymbol}
                setView={setView}
              />
            </TabsContent>
            <TabsContent value="trade" className="mt-0">
              <TradeView
                account={demoAccount}
                summary={summary}
                activeQuote={activeQuote}
                quantity={orderQuantity}
                setQuantity={setOrderQuantity}
                note={orderNote}
                setNote={setOrderNote}
                smallAmountMode={smallAmountMode}
                setSmallAmountMode={setSmallAmountMode}
                submitOrder={submitOrder}
                resetDemoAccount={resetDemoAccount}
                pending={orderMutation.isPending}
                quotes={quotesQuery.data?.quotes || []}
              />
            </TabsContent>
            <TabsContent value="learn" className="mt-0">
              <LearnView market={market} forecast={forecast} quote={activeQuote} />
            </TabsContent>
            <TabsContent value="settings" className="mt-0">
              <SettingsView
                cloudEmail={cloudEmail}
                setCloudEmail={setCloudEmail}
                cloudMessage={cloudMessage}
                login={login}
                pushCloud={pushCloud}
                pullCloud={pullCloud}
                config={configQuery.data}
              />
            </TabsContent>
          </Tabs>
        </section>

        <aside className="space-y-4">
          <MobileNav
            watchlist={visibleWatchlist}
            activeSymbol={activeSymbol}
            setActiveSymbol={setActiveSymbol}
            removeWatchItem={(symbol) => removeWatchItem(symbol, market)}
          />
          <AssistantPanel
            beginnerMode={beginnerMode}
            forecast={forecast}
            quote={activeQuote}
            cloudMessage={cloudMessage}
          />
        </aside>
      </main>
    </div>
  );
}

function NavigationPanel({
  view,
  setView,
  watchlist,
  activeSymbol,
  setActiveSymbol,
  removeWatchItem,
}: {
  view: ViewTab;
  setView: (view: ViewTab) => void;
  watchlist: WatchItem[];
  activeSymbol: string;
  setActiveSymbol: (symbol: string) => void;
  removeWatchItem: (symbol: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">画面</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {viewTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button key={tab.id} variant={view === tab.id ? "secondary" : "ghost"} className="w-full justify-start gap-2" onClick={() => setView(tab.id)}>
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </CardContent>
      </Card>
      <WatchlistPanel watchlist={watchlist} activeSymbol={activeSymbol} setActiveSymbol={setActiveSymbol} removeWatchItem={removeWatchItem} />
    </div>
  );
}

function MobileNav(props: {
  watchlist: WatchItem[];
  activeSymbol: string;
  setActiveSymbol: (symbol: string) => void;
  removeWatchItem: (symbol: string) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2 lg:hidden">
          <Activity className="h-4 w-4" />
          ウォッチリストを開く
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px]">
        <SheetHeader>
          <SheetTitle>ウォッチリスト</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <WatchlistPanel {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function WatchlistPanel({
  watchlist,
  activeSymbol,
  setActiveSymbol,
  removeWatchItem,
}: {
  watchlist: WatchItem[];
  activeSymbol: string;
  setActiveSymbol: (symbol: string) => void;
  removeWatchItem: (symbol: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ウォッチリスト</CardTitle>
        <CardDescription>番号の下に会社名を表示し、選択銘柄を各画面で共有します。</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[360px] pr-3">
          <div className="space-y-2">
            {watchlist.map((item) => (
              <div
                key={`${item.market}:${item.symbol}`}
                role="button"
                tabIndex={0}
                className={`w-full rounded-md border p-3 text-left transition ${activeSymbol === item.symbol ? "border-primary bg-secondary" : "border-border hover:bg-secondary/70"}`}
                onClick={() => setActiveSymbol(item.symbol)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") setActiveSymbol(item.symbol);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-sm font-semibold">{item.symbol}</div>
                    <div className="text-xs text-muted-foreground">{item.name}</div>
                  </div>
                  <Badge variant="outline">{item.sector}</Badge>
                </div>
                <div className="mt-2">
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={(event) => { event.stopPropagation(); removeWatchItem(item.symbol); }}>
                    削除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function OverviewView({
  market,
  quotes,
  quoteLoading,
  history,
  forecast,
  activeSymbol,
  setActiveSymbol,
  beginnerMode,
}: {
  market: Market;
  quotes: Quote[];
  quoteLoading: boolean;
  history?: HistoryResponse;
  forecast: ReturnType<typeof forecastFromBars> | null;
  activeSymbol: string;
  setActiveSymbol: (symbol: string) => void;
  beginnerMode: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="登録銘柄" value={`${quotes.length}件`} detail={market === "jp" ? "日本株モード" : "米国株モード"} />
        <MetricCard label="選択銘柄" value={activeSymbol} detail={quotes.find((quote) => quote.symbol === activeSymbol)?.name || "価格取得待ち"} />
        <MetricCard label="30日予想" value={forecast ? <TrendValue value={forecast.expectedPct} /> : "--"} detail={forecast ? `信頼度 ${forecast.confidence}` : "データ取得後に表示"} />
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>価格推移と予想</CardTitle>
            <CardDescription>過去推移、移動の勢い、30営業日予想を同じ画面で確認します。</CardDescription>
          </div>
          <Select value={activeSymbol} onValueChange={setActiveSymbol}>
            <SelectTrigger className="w-full md:w-[220px]"><SelectValue placeholder="銘柄" /></SelectTrigger>
            <SelectContent>
              {quotes.map((quote) => <SelectItem key={quote.symbol} value={quote.symbol}>{quote.symbol} / {quote.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {history?.bars?.length ? (
            <PriceChart bars={history.bars} forecastPct={forecast?.expectedPct} />
          ) : (
            <div className="flex h-[310px] items-center justify-center rounded-md border border-dashed text-muted-foreground">
              {quoteLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "データ取得中です"}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>ウォッチリスト価格</CardTitle>
          <CardDescription>パフォーマンス比較の起点になる一覧です。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>銘柄</TableHead>
                <TableHead>会社名</TableHead>
                <TableHead className="text-right">現在値</TableHead>
                <TableHead className="text-right">前日比</TableHead>
                <TableHead>ソース</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.symbol} className="cursor-pointer" onClick={() => setActiveSymbol(quote.symbol)}>
                  <TableCell className="font-mono">{quote.symbol}</TableCell>
                  <TableCell>{quote.name}</TableCell>
                  <TableCell className="text-right">{formatMoney(quote.price, quote.currency)}</TableCell>
                  <TableCell className="text-right"><TrendValue value={quote.changePct} /></TableCell>
                  <TableCell><Badge variant="outline">{quote.source}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {beginnerMode ? <BeginnerHint text="前日比だけで判断せず、3ヶ月の流れ・値動きの荒さ・決算前後のイベントを合わせて確認します。" /> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function DiscoverView(props: {
  symbolQuery: string;
  setSymbolQuery: (value: string) => void;
  searchResults: SymbolMasterItem[];
  addFromMaster: (item: SymbolMasterItem) => void;
  screenerQuery: string;
  setScreenerQuery: (value: string) => void;
  screener?: ScreenerResponse;
  screenerLoading: boolean;
  refreshScreener: () => void;
  setActiveSymbol: (symbol: string) => void;
  setView: (view: ViewTab) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>銘柄マスター検索</CardTitle>
          <CardDescription>全銘柄マスターからティッカー/コード/会社名で検索できます。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="例: AAPL / 7203 / トヨタ" value={props.symbolQuery} onChange={(event) => props.setSymbolQuery(event.target.value)} />
          <ScrollArea className="h-[520px] pr-3">
            <div className="space-y-2">
              {props.searchResults.map((item) => (
                <div key={item.sym} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono font-semibold">{item.sym}</div>
                      <div className="text-sm">{item.name || item.nameEn}</div>
                      <div className="text-xs text-muted-foreground">{[item.sector, item.exchange, item.typeLabel].filter(Boolean).join(" / ")}</div>
                    </div>
                    <Button size="sm" onClick={() => props.addFromMaster(item)}>追加</Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>銘柄発掘スクリーナー</CardTitle>
            <CardDescription>候補は予想・勢い・荒さを同じ根拠形式で評価します。</CardDescription>
          </div>
          <Button variant="outline" onClick={props.refreshScreener} disabled={props.screenerLoading}>
            {props.screenerLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            再スキャン
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="絞り込み: 会社名/コード" value={props.screenerQuery} onChange={(event) => props.setScreenerQuery(event.target.value)} />
          <div className="text-xs text-muted-foreground">
            対象 {props.screener?.universeCount ?? "--"}件 / 評価 {props.screener?.searchedCount ?? "--"}件
          </div>
          <ScrollArea className="h-[520px] pr-3">
            <div className="space-y-3">
              {props.screener?.candidates.map((candidate) => (
                <div key={candidate.symbol} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge>{candidate.rank}位</Badge>
                        <span className="font-mono font-semibold">{candidate.symbol}</span>
                        <span className="text-sm text-muted-foreground">{candidate.name}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <MetricInline label="予想" value={<TrendValue value={candidate.forecastPct} />} />
                        <MetricInline label="3ヶ月" value={<TrendValue value={candidate.momentumPct} />} />
                        <MetricInline label="荒さ" value={`${candidate.volatilityPct.toFixed(1)}%`} />
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { props.setActiveSymbol(candidate.symbol); props.setView("overview"); }}>詳細</Button>
                  </div>
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {candidate.reasons.slice(0, 2).map((reason) => <li key={reason.label}>・{reason.label}: {reason.detail}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function TradeView({
  account,
  summary,
  activeQuote,
  quantity,
  setQuantity,
  note,
  setNote,
  smallAmountMode,
  setSmallAmountMode,
  submitOrder,
  resetDemoAccount,
  pending,
  quotes,
}: {
  account: DemoAccount;
  summary: ReturnType<typeof accountSummary>;
  activeQuote?: Quote;
  quantity: string;
  setQuantity: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  smallAmountMode: boolean;
  setSmallAmountMode: (value: boolean) => void;
  submitOrder: (side: "buy" | "sell") => void;
  resetDemoAccount: (initialCash?: number) => void;
  pending: boolean;
  quotes: Quote[];
}) {
  const [initialCashDraft, setInitialCashDraft] = useState(() => ({
    source: account.initialCash,
    value: moneyInputValue(account.initialCash),
  }));
  const [initialCashMessage, setInitialCashMessage] = useState("");
  const [initialCashTone, setInitialCashTone] = useState<"success" | "warning">("success");
  const estimatedAmount = activeQuote ? Number(quantity || 0) * activeQuote.price : 0;
  const afterCash = activeQuote ? account.cash - estimatedAmount : account.cash;
  const displayCurrency = activeQuote?.currency || "USD";
  const initialCashInput = initialCashDraft.source === account.initialCash ? initialCashDraft.value : moneyInputValue(account.initialCash);
  const updateInitialCashInput = (value: string) => setInitialCashDraft({ source: account.initialCash, value });

  const applyInitialCash = () => {
    const amount = parsePositiveAmount(initialCashInput);
    if (!amount) {
      setInitialCashTone("warning");
      setInitialCashMessage("初期金額は1以上の数字で入力してください。");
      return;
    }
    resetDemoAccount(amount);
    setInitialCashTone("success");
    setInitialCashMessage(`${formatMoney(amount, displayCurrency)} の初期金額でデモ口座を作り直しました。`);
  };

  const resetWithCurrentInitialCash = () => {
    resetDemoAccount();
    setInitialCashTone("success");
    setInitialCashMessage("現在の初期金額でデモ口座をリセットしました。");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="現金" value={formatMoney(summary.cash, activeQuote?.currency)} detail="発注可能な残高" />
        <MetricCard label="評価額" value={formatMoney(summary.marketValue, activeQuote?.currency)} detail="建玉の概算" />
        <MetricCard label="総資産" value={formatMoney(summary.total, activeQuote?.currency)} detail={<TrendValue value={summary.pnlPct} />} />
        <MetricCard label="注文後現金" value={formatMoney(afterCash, activeQuote?.currency)} detail="手数料除く概算" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>デモ初期設定</CardTitle>
          <CardDescription>初期金額を変更すると、建玉と注文履歴をクリアして新しい練習口座を作ります。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="demo-initial-cash">初期金額</Label>
              <Input
                id="demo-initial-cash"
                type="number"
                min="1"
                step="10000"
                value={initialCashInput}
                onChange={(event) => updateInitialCashInput(event.target.value)}
              />
            </div>
            <div className="rounded-md border border-border p-3 text-sm">
              <div className="text-muted-foreground">現在の初期金額</div>
              <div className="mt-1 font-mono text-lg font-semibold">{formatMoney(account.initialCash, displayCurrency)}</div>
            </div>
            <div className="rounded-md border border-border p-3 text-sm">
              <div className="text-muted-foreground">現在の現金</div>
              <div className="mt-1 font-mono text-lg font-semibold">{formatMoney(account.cash, displayCurrency)}</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
            <Button onClick={applyInitialCash}><WalletCards className="mr-2 h-4 w-4" />初期金額を反映</Button>
            <Button variant="outline" onClick={resetWithCurrentInitialCash}><RefreshCcw className="mr-2 h-4 w-4" />現在の初期金額でリセット</Button>
          </div>
          {initialCashMessage ? (
            <div className={`xl:col-span-2 ${initialCashTone === "warning" ? "text-sm text-amber-300" : "text-sm text-muted-foreground"}`}>
              {initialCashMessage}
            </div>
          ) : null}
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>発注パネル</CardTitle>
            <CardDescription>実売買ではなく、学習用のデモ注文です。数量入力時に概算金額を確認できます。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-border p-3">
              <div className="text-sm text-muted-foreground">選択銘柄</div>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <div className="font-mono text-lg font-semibold">{activeQuote?.symbol || "--"}</div>
                  <div className="text-sm text-muted-foreground">{activeQuote?.name || "価格取得待ち"}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{activeQuote ? formatMoney(activeQuote.price, activeQuote.currency) : "--"}</div>
                  <div>{activeQuote ? <TrendValue value={activeQuote.changePct} /> : "--"}</div>
                </div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>数量</Label>
                <Input type="number" min="0" step={smallAmountMode ? "0.0001" : "1"} value={quantity} onChange={(event) => setQuantity(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>取引単位</Label>
                <div className="flex h-10 items-center justify-between rounded-md border border-border px-3">
                  <span className="text-sm">少額モード</span>
                  <Switch checked={smallAmountMode} onCheckedChange={setSmallAmountMode} />
                </div>
              </div>
            </div>
            <div className="grid gap-2 rounded-md bg-secondary p-3 text-sm">
              <div className="flex justify-between"><span>概算約定代金</span><span>{formatMoney(estimatedAmount, activeQuote?.currency)}</span></div>
              <div className="flex justify-between"><span>現在現金</span><span>{formatMoney(account.cash, activeQuote?.currency)}</span></div>
              <div className="flex justify-between"><span>買い注文後</span><span>{formatMoney(afterCash, activeQuote?.currency)}</span></div>
            </div>
            <Textarea placeholder="なぜこの注文をするか。あとで振り返れるように一言残します。" value={note} onChange={(event) => setNote(event.target.value)} />
            <div className="grid gap-2 md:grid-cols-3">
              <Button onClick={() => submitOrder("buy")} disabled={pending}>買い練習</Button>
              <Button variant="secondary" onClick={() => submitOrder("sell")} disabled={pending}>売り練習</Button>
              <Button variant="outline" onClick={resetWithCurrentInitialCash}>口座リセット</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>建玉・履歴</CardTitle>
            <CardDescription>ウォッチリスト価格と連動して評価します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader><TableRow><TableHead>銘柄</TableHead><TableHead className="text-right">数量</TableHead><TableHead className="text-right">平均</TableHead></TableRow></TableHeader>
              <TableBody>
                {account.positions.map((position) => (
                  <TableRow key={position.symbol}>
                    <TableCell><div className="font-mono">{position.symbol}</div><div className="text-xs text-muted-foreground">{position.name}</div></TableCell>
                    <TableCell className="text-right">{position.quantity}</TableCell>
                    <TableCell className="text-right">{formatMoney(position.averageCost, position.market === "jp" ? "JPY" : "USD")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator />
            <ScrollArea className="h-[220px] pr-3">
              <div className="space-y-2">
                {account.orders.map((order) => (
                  <div key={order.id} className="rounded-md border border-border p-2 text-sm">
                    <div className="flex justify-between"><span className="font-mono">{order.symbol}</span><Badge variant={order.side === "buy" ? "default" : "secondary"}>{order.side === "buy" ? "買い" : "売り"}</Badge></div>
                    <div className="mt-1 text-xs text-muted-foreground">{order.quantity}株 / {formatMoney(order.price, order.market === "jp" ? "JPY" : "USD")}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {!account.orders.length ? <BeginnerHint text="まずは少額モードで、1銘柄だけ買い練習をして現金と評価額の動きを見てみましょう。" /> : null}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>ウォッチリストから注文対象を選ぶ</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {quotes.map((quote) => (
            <div key={quote.symbol} className="rounded-md border border-border p-3">
              <div className="font-mono font-semibold">{quote.symbol}</div>
              <div className="text-sm text-muted-foreground">{quote.name}</div>
              <div className="mt-2 flex justify-between text-sm"><span>{formatMoney(quote.price, quote.currency)}</span><TrendValue value={quote.changePct} /></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LearnView({ market, forecast, quote }: { market: Market; forecast: ReturnType<typeof forecastFromBars> | null; quote?: Quote }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>初心者向けの見方</CardTitle>
          <CardDescription>数字の意味と、次に何を見るべきかを短く整理します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ["株価が上がる主な理由", "業績期待、金利低下、需給改善、ニュース、同業比較の見直しなど。"],
            ["株価が下がる主な理由", "業績不安、金利上昇、悪材料、過熱後の利益確定、全体相場の悪化など。"],
            ["デモ注文の目的", "当たる銘柄探しより、数量・現金・損切りの感覚を先に身につけることです。"],
            [market === "jp" ? "日本株の単元" : "米国株の単位", market === "jp" ? "通常は100株単位が基本です。少額モードでは1株練習として扱います。" : "通常は1株単位です。少額モードでは小数株練習として扱います。"],
          ].map(([title, body]) => (
            <div key={title} className="rounded-md border border-border p-3">
              <div className="font-semibold">{title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>選択銘柄の予想根拠</CardTitle>
          <CardDescription>{quote ? `${quote.symbol} / ${quote.name}` : "銘柄を選択してください"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {forecast?.reasons.map((reason) => (
            <div key={reason.label} className="rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <Badge variant={reason.level === "positive" ? "default" : reason.level === "warning" ? "destructive" : "secondary"}>{reason.level}</Badge>
                <div className="font-semibold">{reason.label}</div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{reason.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsView({
  cloudEmail,
  setCloudEmail,
  cloudMessage,
  login,
  pushCloud,
  pullCloud,
  config,
}: {
  cloudEmail: string;
  setCloudEmail: (value: string) => void;
  cloudMessage: string;
  login: () => void;
  pushCloud: () => void;
  pullCloud: () => void;
  config?: ConfigResponse;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>保存・同期</CardTitle>
          <CardDescription>Supabaseを設定するとクラウド主軸で端末間同期できます。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input type="email" placeholder="メールアドレス" value={cloudEmail} onChange={(event) => setCloudEmail(event.target.value)} />
            <Button onClick={login}><LogIn className="mr-2 h-4 w-4" />ログイン</Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <Button variant="secondary" onClick={pushCloud}><Database className="mr-2 h-4 w-4" />クラウド保存</Button>
            <Button variant="outline" onClick={pullCloud}><RefreshCcw className="mr-2 h-4 w-4" />クラウド読込</Button>
          </div>
          <div className="rounded-md border border-border p-3 text-sm text-muted-foreground">{cloudMessage}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>データ接続</CardTitle>
          <CardDescription>APIキーはRoute Handler側で扱い、ブラウザへ出しません。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <StatusLine ok={Boolean(config?.supabaseReady)} label="Supabase設定" />
          <StatusLine ok={Boolean(config?.officialProviderReady)} label={`正式API ${config?.officialProvider || ""}`} />
          <StatusLine ok label="ローカルfallback" />
          <Separator />
          <p className="text-muted-foreground">VercelではRoot Directoryを `kabu_web_next` に切り替えるとv2を配信できます。旧版は `kabu_web` に残してあります。</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AssistantPanel({ beginnerMode, forecast, quote, cloudMessage }: {
  beginnerMode: boolean;
  forecast: ReturnType<typeof forecastFromBars> | null;
  quote?: Quote;
  cloudMessage: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Brain className="h-4 w-4 text-sky-400" />判断メモ</CardTitle>
        <CardDescription>初見でも迷いにくいよう、今見るべきことだけを出します。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border border-border p-3">
          <div className="text-sm font-semibold">{quote ? `${quote.symbol} の見方` : "銘柄未選択"}</div>
          <p className="mt-1 text-sm text-muted-foreground">
            {forecast ? (
              <>
                30日予想は <TrendValue value={forecast.expectedPct} />。信頼度は {forecast.confidence} です。
              </>
            ) : "ウォッチリストから銘柄を選ぶと、予想と根拠が表示されます。"}
          </p>
          <Progress value={forecast ? Math.min(100, Math.abs(forecast.expectedPct) * 4) : 0} className="mt-3" />
        </div>
        {beginnerMode ? <BeginnerHint text="初心者モード中です。専門用語は「学習」画面で短く説明します。" /> : null}
        <div className="rounded-md bg-secondary p-3 text-xs text-muted-foreground">{cloudMessage}</div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: ReactNode; detail: ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-mono text-xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{detail}</CardContent>
    </Card>
  );
}

function MetricInline({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-md bg-secondary p-2"><div className="text-muted-foreground">{label}</div><div className="font-mono">{value}</div></div>;
}

function TrendValue({ value, className = "" }: { value?: number | null; className?: string }) {
  if (value == null || !Number.isFinite(value)) return <span className={className}>--</span>;
  const colorClass = value > 0.05 ? "text-emerald-400" : value < -0.05 ? "text-red-400" : "text-muted-foreground";
  return <span className={`${colorClass} ${className}`.trim()}>{formatPct(value)}</span>;
}

function parsePositiveAmount(value: string) {
  const amount = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function moneyInputValue(value: number) {
  return Number.isFinite(value) ? String(value) : "";
}

function BeginnerHint({ text }: { text: string }) {
  return (
    <div className="flex gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
      <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function StatusLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-3">
      <span>{label}</span>
      <Badge variant={ok ? "default" : "secondary"}>{ok ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <ShieldCheck className="mr-1 h-3 w-3" />}{ok ? "OK" : "未設定"}</Badge>
    </div>
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
}

function searchMaster(rows: SymbolMasterItem[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return rows.slice(0, 18);
  return rows
    .filter((row) => [row.sym, row.name, row.nameEn, row.sector].filter(Boolean).join(" ").toLowerCase().includes(q))
    .slice(0, 18);
}
