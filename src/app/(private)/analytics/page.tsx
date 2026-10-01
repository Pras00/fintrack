"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { useFilterStore } from "@/stores/use-filter-store";
import { Calendar } from "lucide-react";

export default function AnalyticsPage() {
  const dateLabel = useFilterStore((state) => state.dateLabel);

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Laporan & Analitik Keuangan
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Arus kas dan pola pengeluaran dari transaksi yang tercatat
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border/70 rounded-lg px-3 py-1.5 bg-muted/30">
          <Calendar className="h-3.5 w-3.5 text-emerald-500" />
          Periode: {dateLabel}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <CashflowChart />
        <CategoryChart />
      </div>
    </DashboardShell>
  );
}
