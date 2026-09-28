"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  Utensils,
  Receipt,
  ShoppingBag,
  Car,
  Gamepad2,
  HeartPulse,
} from "lucide-react";
import type { BudgetItem } from "@/types";

interface DetailedBudget extends BudgetItem {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const BUDGETS: DetailedBudget[] = [
  {
    name: "Makanan & Minuman",
    spent: 3450000,
    limit: 4000000,
    percent: 86,
    icon: Utensils,
    color: "#EF4444",
  },
  {
    name: "Tagihan & Utilitas",
    spent: 2100000,
    limit: 2500000,
    percent: 84,
    icon: Receipt,
    color: "#EAB308",
  },
  {
    name: "Transportasi",
    spent: 1450000,
    limit: 2000000,
    percent: 72,
    icon: Car,
    color: "#F97316",
  },
  {
    name: "Belanja & Lifestyle",
    spent: 1350000,
    limit: 2000000,
    percent: 67,
    icon: ShoppingBag,
    color: "#EC4899",
  },
  {
    name: "Hiburan & Hobi",
    spent: 1200000,
    limit: 1500000,
    percent: 80,
    icon: Gamepad2,
    color: "#8B5CF6",
  },
  {
    name: "Kesehatan & Medis",
    spent: 450000,
    limit: 1500000,
    percent: 30,
    icon: HeartPulse,
    color: "#06B6D4",
  },
];

export default function BudgetsPage() {
  const totalLimit = BUDGETS.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = BUDGETS.reduce((sum, b) => sum + b.spent, 0);
  const remainingBudget = totalLimit - totalSpent;
  const overallPercent = Math.round((totalSpent / totalLimit) * 100);

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Perencanaan & Kontrol Anggaran
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Tetapkan batas belanja per kategori untuk menjaga stabilitas finansial bulanan Anda
          </p>
        </div>

        <Button
          onClick={() => alert("Fitur Tambah Batas Anggaran segera siap!")}
          className="h-10 rounded-xl px-4.5 text-xs font-semibold gap-2 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Batas Anggaran Baru
        </Button>
      </div>

      {/* Overview Metric Banner */}
      <Card className="p-6 border-border/70">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">
              Alokasi Total Anggaran Bulan Ini
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold tabular-nums text-foreground">
                {formatRupiah(totalSpent)}
              </span>
              <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                dari batas {formatRupiah(totalLimit)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Sisa alokasi dana aman:{" "}
              <span className="font-bold text-emerald-500 tabular-nums">
                {formatRupiah(remainingBudget)}
              </span>
            </p>
          </div>

          <div className="w-full lg:w-72 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Kapasitas Terpakai</span>
              <span className={`font-bold tabular-nums ${overallPercent > 80 ? "text-amber-500" : "text-emerald-500"}`}>
                {overallPercent}%
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallPercent > 85
                    ? "bg-rose-500"
                    : overallPercent > 75
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {BUDGETS.map((b) => {
          const Icon = b.icon;
          const isWarning = b.percent >= 80;
          const remaining = b.limit - b.spent;

          return (
            <Card key={b.name} className="p-5 border-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${b.color}15`, color: b.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">{b.name}</h3>
                    <span className="text-[11px] text-muted-foreground">Limit Bulanan</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isWarning ? (
                    <span className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/20">
                      <AlertTriangle className="h-3 w-3" />
                      Mendekati Limit
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Aman
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatRupiah(b.spent)}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    Batas: {formatRupiah(b.limit)} ({b.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.percent >= 85
                        ? "bg-rose-500"
                        : b.percent >= 80
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${b.percent}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground block text-right">
                  Sisa anggaran: <span className="font-semibold text-foreground tabular-nums">{formatRupiah(remaining)}</span>
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
