"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NumberCounter } from "@/components/ui/number-counter";
import { getDashboardData } from "@/actions/dashboard";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  PiggyBank,
} from "lucide-react";

interface KPICardsProps {
  initialNetWorth?: number;
  initialIncomeMonth?: number;
  initialExpenseMonth?: number;
  initialActiveWallets?: number;
}

export function KPICards({
  initialNetWorth = 84480000,
  initialIncomeMonth = 33500000,
  initialExpenseMonth = 3590000,
  initialActiveWallets = 4,
}: KPICardsProps) {
  const [netWorth, setNetWorth] = useState(initialNetWorth);
  const [incomeMonth, setIncomeMonth] = useState(initialIncomeMonth);
  const [expenseMonth, setExpenseMonth] = useState(initialExpenseMonth);
  const [activeWallets, setActiveWallets] = useState(initialActiveWallets);

  useEffect(() => {
    let ignore = false;

    async function loadMetrics() {
      try {
        const data = await getDashboardData();
        if (!ignore && data) {
          setNetWorth(data.netWorth);
          setIncomeMonth(data.incomeMonth);
          setExpenseMonth(data.expenseMonth);
          setActiveWallets(data.activeWalletsCount);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Gagal memuat KPI finansial:", err);
        }
      }
    }

    loadMetrics();

    const handleUpdate = () => {
      loadMetrics();
    };

    window.addEventListener("fintrack:transaction-created", handleUpdate);
    window.addEventListener("fintrack:transaction-updated", handleUpdate);
    window.addEventListener("fintrack:transaction-deleted", handleUpdate);
    window.addEventListener("fintrack:wallet-updated", handleUpdate);

    return () => {
      ignore = true;
      window.removeEventListener("fintrack:transaction-created", handleUpdate);
      window.removeEventListener("fintrack:transaction-updated", handleUpdate);
      window.removeEventListener("fintrack:transaction-deleted", handleUpdate);
      window.removeEventListener("fintrack:wallet-updated", handleUpdate);
    };
  }, []);

  const netSavings = incomeMonth - expenseMonth;
  const savingsRate = incomeMonth > 0 ? ((netSavings / incomeMonth) * 100).toFixed(1) : "0";
  const dailyAverageExpense = Math.round(expenseMonth / 28);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Net Worth */}
      <Card className="relative overflow-hidden border-border/80 bg-card hover:border-border transition-all shadow-xs">
        <CardContent className="p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Saldo Aktif
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              <NumberCounter value={netWorth} />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Tersinkron Real-Time
            </span>
            <span className="font-medium">{activeWallets} Akun Aktif</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Monthly Income */}
      <Card className="relative overflow-hidden border-border/80 bg-card hover:border-border transition-all shadow-xs">
        <CardContent className="p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Pemasukan (Bln)
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-foreground text-emerald-600 dark:text-emerald-400">
              +<NumberCounter value={incomeMonth} />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2.5 py-1 font-semibold text-teal-600 dark:text-teal-400">
              <ArrowUpRight className="h-3 w-3" />
              Kas Masuk
            </span>
            <span>Bulan Ini</span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Monthly Expense */}
      <Card className="relative overflow-hidden border-border/80 bg-card hover:border-border transition-all shadow-xs">
        <CardContent className="p-4.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Pengeluaran (Bln)
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              -<NumberCounter value={expenseMonth} />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 font-semibold text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="h-3 w-3" />
              Kas Keluar
            </span>
            <span className="tabular-nums">Avg: Rp {dailyAverageExpense > 0 ? (dailyAverageExpense / 1000).toFixed(0) : "0"}rb/hr</span>
          </div>
        </CardContent>
      </Card>

      {/* 4. Sovereign Ledger Hero Card: NET CASHFLOW / SURPLUS */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-[#0F172A] text-white p-4.5 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Net Cashflow
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-teal-400">
              <PiggyBank className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-1">
            <span className={`text-2xl font-bold tracking-tight tabular-nums ${netSavings >= 0 ? "text-teal-400" : "text-rose-400"}`}>
              {netSavings >= 0 ? "+" : ""}<NumberCounter value={netSavings} />
            </span>
          </div>

          <div className="mt-1.5">
            <span className="inline-flex items-center rounded-full bg-[#134E4A] px-2.5 py-1 text-[11px] font-semibold text-teal-300">
              Savings Rate {savingsRate}%
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
          <span>Target Ideal: 30.0%</span>
          <span className="text-teal-400 font-semibold">{parseFloat(savingsRate) >= 30 ? "Target tercapai" : "Perlu evaluasi"}</span>
        </div>
      </div>
    </div>
  );
}
