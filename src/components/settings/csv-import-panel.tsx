"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { Check, Download, FileSpreadsheet, LoaderCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { SalesTargetType } from "@/lib/types";
import { SALES_TARGET_LABELS } from "@/lib/ui-labels";

type CsvRow = Record<string, string>;

export function CsvImportPanel({ targetTypes, prefectures }: { targetTypes: SalesTargetType[]; prefectures: string[] }) {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [recordType, setRecordType] = useState(targetTypes[0]?.key ?? "facility");
  const [prefecture, setPrefecture] = useState("csv");
  const [mergeDuplicates, setMergeDuplicates] = useState(true);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const preview = useMemo(() => rows.slice(0, 5), [rows]);

  async function selectFile(file: File | undefined) {
    if (!file) return;
    const buffer = await file.arrayBuffer();
    let text = new TextDecoder("utf-8").decode(buffer);
    if (text.includes("\uFFFD")) text = new TextDecoder("shift-jis").decode(buffer);
    const result = Papa.parse<CsvRow>(text.replace(/^\uFEFF/u, ""), { header: true, skipEmptyLines: "greedy", transformHeader: (header) => header.trim() });
    if (result.errors.length && !result.data.length) { toast.error("CSVを読み取れませんでした。"); return; }
    const clean = result.data.filter((row) => Object.values(row).some((value) => String(value ?? "").trim()));
    setRows(clean); setFileName(file.name); setProgress(0);
  }

  async function importRows() {
    if (!rows.length) return;
    setBusy(true); setProgress(0);
    let inserted = 0; let updated = 0; let conflicts = 0;
    try {
      for (let index = 0; index < rows.length; index += 200) {
        const response = await fetch("/api/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows: rows.slice(index, index + 200), recordType, prefecture: prefecture === "csv" ? "" : prefecture, mergeDuplicates }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "取り込みに失敗しました。");
        inserted += result.inserted ?? 0; updated += result.updated ?? 0; conflicts += result.conflicts ?? 0;
        setProgress(Math.min(100, Math.round(((index + 200) / rows.length) * 100)));
      }
      toast.success(`${inserted}件追加、${updated}件更新しました。${conflicts ? ` ${conflicts}件は競合しました。` : ""}`);
      setRows([]); setFileName(""); setProgress(100);
    } catch (error) { toast.error(error instanceof Error ? error.message : "取り込みに失敗しました。"); }
    finally { setBusy(false); }
  }

  return (
    <section className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-sm font-semibold">CSVファイルを取り込む</h2><p className="mt-1 text-xs text-muted-foreground">UTF-8とShift-JISに対応。200件ずつ安全に取り込みます。</p></div><Button asChild variant="outline" size="sm"><a href="/api/sample-csv"><Download className="size-4" />サンプルCSV</a></Button></div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
        <div className="space-y-2"><Label htmlFor="csv-file">CSVファイル</Label><Input id="csv-file" type="file" accept=".csv,text/csv" onChange={(event) => selectFile(event.target.files?.[0])} /><p className="text-xs text-muted-foreground">{fileName || "ファイル未選択"}</p></div>
        <div className="space-y-2"><Label>{`取り込み${SALES_TARGET_LABELS.recordType}`}</Label><Select value={recordType} onValueChange={setRecordType}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{targetTypes.map((item) => <SelectItem key={item.key} value={item.key}>{item.label}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="csv-prefecture">取り込み先の都道府県</Label><Select value={prefecture} onValueChange={setPrefecture}><SelectTrigger id="csv-prefecture" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="csv">CSV内の都道府県を使用</SelectItem>{prefectures.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <label className="mt-4 flex items-center gap-3 text-sm"><Switch checked={mergeDuplicates} onCheckedChange={setMergeDuplicates} />同名・同地域の営業先は更新する</label>

      {rows.length ? <div className="mt-5 overflow-hidden rounded-md border"><div className="flex items-center justify-between border-b bg-muted/45 px-3 py-2"><p className="text-sm font-medium"><FileSpreadsheet className="mr-2 inline size-4" />{rows.length.toLocaleString()}件を読み込みました</p><Badge variant="secondary">先頭5件</Badge></div><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead className="text-left text-xs text-muted-foreground"><tr>{Object.keys(preview[0] ?? {}).slice(0, 6).map((header) => <th key={header} className="h-9 px-3 font-medium">{header}</th>)}</tr></thead><tbody className="divide-y">{preview.map((row, index) => <tr key={index}>{Object.keys(preview[0] ?? {}).slice(0, 6).map((header) => <td key={header} className="max-w-48 truncate px-3 py-2">{row[header] || "-"}</td>)}</tr>)}</tbody></table></div></div> : <Alert className="mt-5"><FileSpreadsheet className="size-4" /><AlertTitle>CSVを選択してください</AlertTitle><AlertDescription>「営業先名」「施設名」「学校名」「名称」のいずれかの列が必要です。</AlertDescription></Alert>}
      {busy ? <Progress value={progress} className="mt-4" /> : null}
      <div className="mt-4 flex justify-end"><Button onClick={importRows} disabled={!rows.length || busy}>{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}{busy ? `取り込み中 ${progress}%` : `${rows.length.toLocaleString()}件を取り込む`}</Button></div>
    </section>
  );
}

export function ImportCoverage({ coverage, prefectures, targetTypes }: { coverage: { prefecture: string; recordType: string; count: number }[]; prefectures: string[]; targetTypes: SalesTargetType[] }) {
  const counts = new Map(coverage.map((item) => [`${item.prefecture}\u0000${item.recordType}`, item.count]));
  return <section className="border-t p-4"><h2 className="text-sm font-semibold">{`都道府県・${SALES_TARGET_LABELS.recordType}別の取り込み状況`}</h2><p className="mt-1 text-xs text-muted-foreground">登録件数がある組み合わせをチェックで表示します。</p><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-sm"><thead className="bg-muted/60 text-left text-xs text-muted-foreground"><tr><th className="h-9 px-3 font-medium">都道府県</th>{targetTypes.map((type) => <th key={type.key} className="px-3 text-center font-medium">{type.label}</th>)}</tr></thead><tbody className="divide-y">{prefectures.map((prefecture) => <tr key={prefecture} className="h-9"><td className="px-3 font-medium">{prefecture}</td>{targetTypes.map((type) => { const count = counts.get(`${prefecture}\u0000${type.key}`) ?? 0; return <td key={type.key} className="px-3 text-center">{count ? <span className="inline-flex items-center gap-1 text-success"><Check className="size-3.5" /><span className="tabular-nums text-foreground">{count.toLocaleString()}</span></span> : <span className="text-muted-foreground/45">-</span>}</td>; })}</tr>)}</tbody></table></div></section>;
}
