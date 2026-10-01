"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
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
import { TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { getCashflowChartAction, CashflowPoint } from "@/actions/dashboard";
import { useFilterStore } from "@/stores/use-filter-store";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function useIsMobile() {
  return useSyncExternalStore(
    (notify) => {
      window.addEventListener("resize", notify);
      return () => window.removeEventListener("resize", notify);
    },
    () => window.innerWidth < 640,
    () => false
  );
}

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
            <span
              className={`tabular-nums font-bold ${
                net >= 0 ? "text-teal-600 dark:text-teal-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
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
  if (val === 0) return isCompactMobile ? "0" : "Rp\u00A00";
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) {
    const num = val / 1_000_000_000;
    const formatted = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
    return isCompactMobile ? `${formatted}M` : `Rp\u00A0${formatted}\u00A0M`;
  }
  if (abs >= 1_000_000) {
    const num = val / 1_000_000;
    const formatted = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
    return isCompactMobile ? `${formatted}jt` : `Rp\u00A0${formatted}\u00A0jt`;
  }
  if (abs >= 1_000) {
    const num = val / 1_000;
    const formatted = num % 1 === 0 ? num.toFixed(0) : num.toFixed(0);
    return isCompactMobile ? `${formatted}rb` : `Rp\u00A0${formatted}\u00A0rb`;
  }
  return isCompactMobile ? `${val}` : `Rp\u00A0${val}`;
}

function getXAxisInterval(len: number, isMobileScreen: boolean): number {
  if (len <= 7) return 0;
  if (len <= 14) return isMobileScreen ? 2 : 1;
  if (len <= 31) return isMobileScreen ? 5 : 3;
  return isMobileScreen ? Math.floor(len / 5) : Math.floor(len / 8);
}

export function CashflowChart() {
  const isMounted = useIsMounted();
  const isMobile = useIsMobile();
  const { startDate, endDate, dateLabel } = useFilterStore();
  const [prevDates, setPrevDates] = useState({ startDate, endDate });
  const [rangeMode, setRangeMode] = useState<"filter" | "7d" | "30d">("filter");

  const [data, setData] = useState<CashflowPoint[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netSavingsRate, setNetSavingsRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Whenever global navbar dates change, auto-sync back to active filter
  if (prevDates.startDate !== startDate || prevDates.endDate !== endDate) {
    setPrevDates({ startDate, endDate });
    setRangeMode("filter");
  }

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const res = await getCashflowChartAction(rangeMode, startDate, endDate);
        if (!ignore) {
          setData(res.points);
          setTotalIncome(res.totalIncome);
          setTotalExpense(res.totalExpense);
          setNetSavingsRate(res.netSavingsRate);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Gagal memuat data cashflow riil:", err);
          setIsLoading(false);
        }
      }
    }

    loadData();

    const handleTransactionChange = () => {
      loadData();
    };

    window.addEventListener("fintrack:transaction-created", handleTransactionChange);
    window.addEventListener("fintrack:transaction-updated", handleTransactionChange);
    window.addEventListener("fintrack:transaction-deleted", handleTransactionChange);

    return () => {
      ignore = true;
      window.removeEventListener("fintrack:transaction-created", handleTransactionChange);
      window.removeEventListener("fintrack:transaction-updated", handleTransactionChange);
      window.removeEventListener("fintrack:transaction-deleted", handleTransactionChange);
    };
  }, [rangeMode, startDate, endDate]);

  const yAxisWidth = isMobile ? 54 : 76;
  const chartMargin = {
    top: 10,
    right: isMobile ? 8 : 16,
    left: isMobile ? -6 : 0,
    bottom: 4,
  };

  const rangeDisplayLabel =
    rangeMode === "filter"
      ? dateLabel
      : rangeMode === "7d"
      ? "7 Hari"
      : "30 Hari";

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
            type="button"
            onClick={() => {
              setIsLoading(true);
              setRangeMode("filter");
            }}
            className={`rounded-md px-2.5 py-1 font-medium transition-all cursor-pointer ${
              rangeMode === "filter"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Periode Filter
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setRangeMode("7d");
            }}
            className={`rounded-md px-2.5 py-1 font-medium transition-all cursor-pointer ${
              rangeMode === "7d"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setRangeMode("30d");
            }}
            className={`rounded-md px-2.5 py-1 font-medium transition-all cursor-pointer ${
              rangeMode === "30d"
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
          <div className="min-w-0">
            <span
              className="text-muted-foreground block text-[10px] sm:text-[11px] font-medium truncate"
              title={`Total Masuk (${rangeDisplayLabel})`}
            >
              Total Masuk ({rangeDisplayLabel})
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ArrowUpRight className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
                {formatCompactRupiah(totalIncome)}
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <span
              className="text-muted-foreground block text-[10px] sm:text-[11px] font-medium truncate"
              title={`Total Keluar (${rangeDisplayLabel})`}
            >
              Total Keluar ({rangeDisplayLabel})
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="text-sm sm:text-base font-bold text-foreground tabular-nums">
                {formatCompactRupiah(totalExpense)}
              </span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-border/40 min-w-0">
            <span className="text-muted-foreground block text-[10px] sm:text-[11px] font-medium">
              Rasio Tabungan Bersih
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm sm:text-base font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                {totalIncome > 0 ? `${netSavingsRate}%` : "0%"}
              </span>
              <span className="text-[11px] text-muted-foreground">dari Pemasukan</span>
            </div>
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="h-[250px] w-full min-w-0">
          {isMounted && !isLoading ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data} margin={chartMargin}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E11D48" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-border/40"
                />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={getXAxisInterval(data.length, isMobile)}
                  className="text-[10px] sm:text-xs font-medium fill-muted-foreground"
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  width={yAxisWidth}
                  tickFormatter={(val) => formatChartAxis(val, isMobile)}
                  className="text-[10px] sm:text-xs font-medium fill-muted-foreground"
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="income"
                  name="Pemasukan"
                  stroke="#0D9488"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                />

                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Pengeluaran"
                  stroke="#E11D48"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] w-full flex items-center justify-center text-xs text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              <span>Menyiapkan visualisasi arus kas...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
