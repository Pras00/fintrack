"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCompactRupiah, formatRupiah } from "@/lib/utils";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

// Mock data representing a typical monthly cashflow timeline
const MOCK_DATA_30D = [
  { date: "01 Sep", income: 15000000, expense: 1200000 },
  { date: "05 Sep", income: 0, expense: 2850000 },
  { date: "10 Sep", income: 3500000, expense: 950000 },
  { date: "15 Sep", income: 500000, expense: 4100000 },
  { date: "20 Sep", income: 1200000, expense: 800000 },
  { date: "25 Sep", income: 25000000, expense: 3200000 },
  { date: "27 Sep", income: 0, expense: 650000 },
];

const MOCK_DATA_7D = [
  { date: "21 Sep", income: 450000, expense: 320000 },
  { date: "22 Sep", income: 0, expense: 180000 },
  { date: "23 Sep", income: 1200000, expense: 750000 },
  { date: "24 Sep", income: 0, expense: 420000 },
  { date: "25 Sep", income: 25000000, expense: 3200000 },
  { date: "26 Sep", income: 350000, expense: 510000 },
  { date: "27 Sep", income: 0, expense: 650000 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const income = payload.find((p) => p.dataKey === "income")?.value || 0;
    const expense = payload.find((p) => p.dataKey === "expense")?.value || 0;
    const net = income - expense;

    return (
      <div className="rounded-xl border border-border/80 bg-popover/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-2 text-popover-foreground">
        <p className="font-semibold border-b border-border/50 pb-1 text-foreground">{label}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Pemasukan:
            </span>
            <span className="tabular-nums font-semibold text-foreground">
              {formatRupiah(income)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Pengeluaran:
            </span>
            <span className="tabular-nums font-semibold text-foreground">
              {formatRupiah(expense)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-border/50">
            <span className="text-muted-foreground font-medium">Arus Bersih:</span>
            <span className={`tabular-nums font-bold ${net >= 0 ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400"}`}>
              {net >= 0 ? `+${formatRupiah(net)}` : formatRupiah(net)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function formatChartAxis(val: number, isCompactMobile: boolean): string {
  if (val === 0) return "Rp 0";
  if (Math.abs(val) >= 1_000_000_000) {
    const num = val / 1_000_000_000;
    const formatted = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
    return isCompactMobile ? `${formatted}M` : `Rp ${formatted}M`;
  }
  if (Math.abs(val) >= 1_000_000) {
    const num = val / 1_000_000;
    const formatted = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
    return isCompactMobile ? `${formatted}jt` : `Rp ${formatted}jt`;
  }
  if (Math.abs(val) >= 1_000) {
    const num = val / 1_000;
    const formatted = num % 1 === 0 ? num.toFixed(0) : num.toFixed(0);
    return isCompactMobile ? `${formatted}rb` : `Rp ${formatted}rb`;
  }
  return isCompactMobile ? `${val}` : `Rp ${val}`;
}

export function CashflowChart() {
  const [isMounted, setIsMounted] = useState(false);
  const [range, setRange] = useState<"7d" | "30d">("30d");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const data = range === "7d" ? MOCK_DATA_7D : MOCK_DATA_30D;
  const totalIncome = data.reduce((acc, curr) => acc + curr.income, 0);
  const totalExpense = data.reduce((acc, curr) => acc + curr.expense, 0);
  const netSavingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const yAxisWidth = isMobile ? 48 : 64;
  const chartMargin = {
    top: 10,
    right: isMobile ? 8 : 16,
    left: isMobile ? 0 : 4,
    bottom: 4,
  };

  return (
    <Card className="col-span-1 lg:col-span-8 overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 space-y-0 pb-3">
        <div className="min-w-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="truncate">Tren Arus Kas (Cashflow Velocity)</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-none">
            Komparasi pemasukan masuk vs pengeluaran riil harian
          </CardDescription>
        </div>

        {/* Inline Segmented Control */}
        <div className="flex items-center self-start sm:self-auto rounded-lg border border-border/60 bg-muted/40 p-0.5 text-xs shrink-0">
          <button
            onClick={() => setRange("7d")}
            className={`rounded-md px-2.5 py-1 font-medium transition-all cursor-pointer ${
              range === "7d"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setRange("30d")}
            className={`rounded-md px-2.5 py-1 font-medium transition-all cursor-pointer ${
              range === "30d"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            30 Hari
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Secondary Context Metric Strip */}
        <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 rounded-xl border border-border/50 bg-muted/20 p-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px] sm:text-[11px] font-medium">
              Total Masuk ({range.toUpperCase()})
            </span>
            <span className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 tabular-nums flex items-center gap-1 mt-0.5">
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
              {formatCompactRupiah(totalIncome)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px] sm:text-[11px] font-medium">
              Total Keluar ({range.toUpperCase()})
            </span>
            <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 tabular-nums flex items-center gap-1 mt-0.5">
              <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
              {formatCompactRupiah(totalExpense)}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0">
            <span className="text-muted-foreground block text-[10px] sm:text-[11px] font-medium">
              Rasio Tabungan Bersih
            </span>
            <span className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 tabular-nums block mt-0.5">
              {netSavingsRate}% dari Pemasukan
            </span>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-[230px] sm:h-[260px] md:h-[280px] w-full min-w-0">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={chartMargin}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/30" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  padding={{ left: 16, right: 16 }}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: "currentColor" }}
                  tickMargin={8}
                  className="text-muted-foreground"
                />
                <YAxis
                  width={yAxisWidth}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatChartAxis(val, isMobile)}
                  tick={{ fontSize: isMobile ? 10 : 11, fill: "currentColor" }}
                  tickMargin={isMobile ? 4 : 8}
                  className="text-muted-foreground"
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "rgba(13, 148, 136, 0.3)", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#0D9488"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#E11D48"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[230px] sm:h-[260px] md:h-[280px] w-full animate-pulse bg-muted/20 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
              Memuat grafik arus kas...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
