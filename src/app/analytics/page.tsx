"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { formatCompactRupiah, formatRupiah } from "@/lib/utils";
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

const MONTHLY_COMPARISON = [
  { month: "Juni 2026", income: 38000000, expense: 11200000, savings: 26800000, rate: "70.5%" },
  { month: "Juli 2026", income: 41500000, expense: 12500000, savings: 29000000, rate: "69.8%" },
  { month: "Agustus 2026", income: 40500000, expense: 10100000, savings: 30400000, rate: "75.0%" },
  { month: "September 2026 (Berjalan)", income: 46500000, expense: 9550000, savings: 36950000, rate: "79.5%" },
];

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Laporan & Analitik Keuangan
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Evaluasi mendalam mengenai pertumbuhan aset, rasio tabungan, dan pola pengeluaran
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border/70 rounded-lg px-3 py-1.5 bg-muted/30">
          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
          Periode Analisis: Q3 2026
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <CashflowChart />
        <CategoryChart />
      </div>

      {/* MoM Performance Ledger */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
            Tabel Komparasi Month-over-Month (MoM)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Perbandingan kinerja pemasukan dan pengeluaran 4 bulan terakhir
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left border-t border-border/40">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="px-5 py-3">Bulan</th>
                <th className="px-5 py-3">Total Pemasukan</th>
                <th className="px-5 py-3">Total Pengeluaran</th>
                <th className="px-5 py-3">Surplus Bersih</th>
                <th className="px-5 py-3 text-right">Rasio Tabungan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {MONTHLY_COMPARISON.map((row, idx) => (
                <tr key={row.month} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-foreground">
                    {row.month}
                  </td>
                  <td className="px-5 py-3.5 text-emerald-500 font-semibold tabular-nums">
                    +{formatRupiah(row.income)}
                  </td>
                  <td className="px-5 py-3.5 text-rose-500 font-semibold tabular-nums">
                    -{formatRupiah(row.expense)}
                  </td>
                  <td className="px-5 py-3.5 text-sky-400 font-bold tabular-nums">
                    {formatRupiah(row.savings)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold tabular-nums text-foreground">
                    {row.rate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
